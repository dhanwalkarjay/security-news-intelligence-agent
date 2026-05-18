const { ChatGroq } = require("@langchain/groq");

const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  temperature: 0.2,
  maxTokens: 650,
});

async function callGroq(prompt) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  try {
    console.log("Sending prompt to Groq via LangChain...");
    const response = await model.invoke([
      {
        role: "system",
        content:
          "You are a cybersecurity news intelligence analyst. Be accurate, practical, and concise. Use short bullets. Do not invent facts not present in the article.",
      },
      { role: "user", content: prompt },
    ]);

    return response.content;
  } catch (error) {
    console.error("Groq API error:", error.message);
    throw error;
  }
}

module.exports = { callGroq };
