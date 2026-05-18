const axios = require("axios");
const xml2js = require("xml2js");

function stripHtml(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function crawlGoogleNews(keyword) {
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
    `${keyword} cybersecurity`
  )}&hl=en-US&gl=US&ceid=US:en`;

  const response = await axios.get(rssUrl, {
    timeout: 15000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  const parsed = await xml2js.parseStringPromise(response.data);
  const items = parsed?.rss?.channel?.[0]?.item || [];

  return items.slice(0, 8).map((item) => ({
    title: item.title?.[0] || "Untitled security news",
    url: item.link?.[0],
    source: item.source?.[0]?._ || "Google News",
    publishedAt: item.pubDate?.[0] ? new Date(item.pubDate[0]) : undefined,
    snippet: stripHtml(item.description?.[0]),
  }));
}

async function crawlNews(keyword) {
  try {
    const articles = await crawlGoogleNews(keyword);
    const seen = new Set();

    return articles.filter((article) => {
      if (!article.url || seen.has(article.url)) return false;
      seen.add(article.url);
      return true;
    });
  } catch (error) {
    console.error("Google News crawl error:", error.message);
    return [];
  }
}

module.exports = crawlNews;
