const express = require("express");
const router = express.Router();

const crawlNews = require("../crawler/newsCrawler");
const cleanContent = require("../utils/contentCleaner");
const { listArticles, mongoReady, upsertArticle } = require("../storage/articleStore");

router.post("/fetch", async (req, res) => {
  try {
    const keyword = req.body.keyword?.trim();

    if (!keyword) {
      return res.status(400).json({ message: "Keyword is required" });
    }

    const crawledArticles = await crawlNews(keyword);

    if (!crawledArticles.length) {
      return res.status(502).json({
        message: "No articles found. Try a broader cybersecurity keyword.",
      });
    }

    const savedArticles = [];

    for (const article of crawledArticles) {
      const fallbackContent = [article.title, article.snippet]
        .filter(Boolean)
        .join("\n\n");
      const content = await cleanContent(article.url, fallbackContent);

      const saved = await upsertArticle({
        title: article.title,
        url: article.url,
        source: article.source,
        publishedAt: article.publishedAt,
        keyword: keyword,
        content,
      });

      savedArticles.push(saved);
    }

    res.json({
      message: "Articles fetched and stored",
      count: savedArticles.length,
      storage: mongoReady() ? "mongodb" : "local-json",
      articles: savedArticles,
    });
  } catch (error) {
    console.error("Error fetching news:", error.message);
    res.status(500).json({ message: "Server error while fetching news" });
  }
});

router.get("/articles", async (_req, res) => {
  try {
    const articles = await listArticles();
    res.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error.message);
    res.status(500).json({ message: "Server error while loading articles" });
  }
});

module.exports = router;
