const express = require("express");
const analyzeArticle = require("../ai/agents/analyzerAgent");
const generateSummaries = require("../ai/agents/summaryAgent");
const recommendJobs = require("../ai/agents/jobAgent");
const { findArticleById } = require("../storage/articleStore");

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { articleId, skills } = req.body;

    if (!articleId) {
      return res.status(400).json({ message: "articleId is required" });
    }

    const article = await findArticleById(articleId);
    if (!article) return res.status(404).json({ message: "Article not found" });

    const analyzed = analyzeArticle(article);
    const [summaries, jobs] = await Promise.all([
      generateSummaries(analyzed.content),
      recommendJobs(analyzed.content, skills),
    ]);

    res.json({
      title: article.title,
      url: article.url,
      source: article.source,
      summaries,
      jobRecommendations: jobs,
    });
  } catch (error) {
    console.error("AI analysis error:", error.message);
    res.status(500).json({ message: "Server error while analyzing article" });
  }
});

module.exports = router;
