const axios = require("axios");
const cheerio = require("cheerio");

async function cleanContent(url, fallbackText = "") {
  try {
    const { data } = await axios.get(url, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(data);
    $("script, style, nav, footer, header, aside, noscript, svg").remove();

    const paragraphs = [];
    $("article p, main p, p").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (text.length > 40) paragraphs.push(text);
    });

    const content = paragraphs.join(" ").slice(0, 6000);
    return content || fallbackText;
  } catch (error) {
    console.warn("Content extraction failed:", error.message);
    return fallbackText;
  }
}

module.exports = cleanContent;
