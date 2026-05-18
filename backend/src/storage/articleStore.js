const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Article = require("../models/Article");

const dataFile = path.join(__dirname, "../../data/articles.json");

function mongoReady() {
  return mongoose.connection.readyState === 1;
}

function normalizeArticle(article) {
  if (!article) return null;
  const value = typeof article.toObject === "function" ? article.toObject() : article;
  return {
    ...value,
    _id: value._id?.toString?.() || value._id,
  };
}

async function readLocalArticles() {
  try {
    const content = await fs.readFile(dataFile, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocalArticles(articles) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(articles, null, 2));
}

async function upsertArticle(article) {
  if (mongoReady()) {
    const saved = await Article.findOneAndUpdate(
      { url: article.url },
      article,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return normalizeArticle(saved);
  }

  const articles = await readLocalArticles();
  const index = articles.findIndex((item) => item.url === article.url);
  const now = new Date().toISOString();

  const saved = {
    _id: index >= 0 ? articles[index]._id : crypto.randomUUID(),
    createdAt: index >= 0 ? articles[index].createdAt : now,
    ...article,
    publishedAt: article.publishedAt
      ? new Date(article.publishedAt).toISOString()
      : undefined,
  };

  if (index >= 0) articles[index] = saved;
  else articles.unshift(saved);

  await writeLocalArticles(articles);
  return saved;
}

async function listArticles() {
  if (mongoReady()) {
    const articles = await Article.find().sort({ createdAt: -1 }).limit(50);
    return articles.map(normalizeArticle);
  }

  const articles = await readLocalArticles();
  return articles
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 50);
}

async function findArticleById(id) {
  if (mongoReady()) {
    return normalizeArticle(await Article.findById(id));
  }

  const articles = await readLocalArticles();
  return articles.find((article) => article._id === id) || null;
}

module.exports = {
  findArticleById,
  listArticles,
  mongoReady,
  upsertArticle,
};
