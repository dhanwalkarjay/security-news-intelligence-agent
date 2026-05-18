function analyzeArticle(article) {
  return {
    title: article.title,
    url: article.url,
    source: article.source,
    content: [article.title, article.content].filter(Boolean).join("\n\n"),
  };
}

module.exports = analyzeArticle;
