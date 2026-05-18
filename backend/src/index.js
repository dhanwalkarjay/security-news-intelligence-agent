const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const newsRoutes = require("./routes/newsRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);
app.use(express.json());

const mongoUri = process.env.MONGO_DIRECT_URI || process.env.MONGO_URI;

if (!mongoUri) {
  console.warn(
    "MongoDB URI is not configured. Backend will continue with local JSON storage."
  );
} else {
  mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      console.warn("Backend will continue with local JSON storage.");

      if (
        err.message.includes("whitelist") ||
        err.message.includes("Could not connect to any servers") ||
        err.message.includes("Server selection timed out")
      ) {
        console.error(
          "Fix: In MongoDB Atlas, add your current public IP in Network Access > IP Access List. If it still fails, your Wi-Fi/ISP may be blocking outbound port 27017."
        );
      }

      if (err.message.includes("querySrv")) {
        console.error(
          "Fix: Your network or DNS is blocking MongoDB SRV lookup. Try another network/DNS or use Atlas's standard connection string."
        );
      }
    });
}

app.use("/api/news", newsRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Security News Intelligence Agent API running",
    health: mongoose.connection.readyState === 1 ? "mongodb-connected" : "fallback-local-json",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "fallback-local-json",
  });
});

const port = process.env.PORT || 5000;

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Backend may already be running.`
    );
    console.error(`Open http://localhost:${port}/health to check it.`);
    return;
  }

  console.error("Server startup error:", error.message);
});
