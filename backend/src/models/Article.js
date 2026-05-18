const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  keyword: {
    type: String,
    required: true,
  },
  source: String,
  publishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Index on keyword for faster lookups
ArticleSchema.index({ keyword: 1 });

module.exports = mongoose.model("Article", ArticleSchema);
