"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";


interface Article {
  _id: string;
  title: string;
  url: string;
  source?: string;
  content?: string;
  publishedAt?: string;
}

interface AnalysisResult {
  title: string;
  url?: string;
  source?: string;
  summaries: {
    executive: string;
    technical: string;
    beginner: string;
  };
  jobRecommendations: string;
}

type SummaryKey = keyof AnalysisResult["summaries"];

const tabs: Array<{ key: SummaryKey; label: string; hint: string }> = [
  { key: "executive", label: "Executive", hint: "Risk and action" },
  { key: "technical", label: "Technical", hint: "Findings and fixes" },
  { key: "beginner", label: "Beginner", hint: "Simple explanation" },
];

function FormattedOutput({ text }: { text: string }) {
  const lines = text
    .replace(/\*\*/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const isHeading = line.endsWith(":") && !line.startsWith("-");
        const isBullet = line.startsWith("-") || /^\d+\./.test(line);

        if (isHeading) {
          return (
            <h4
              key={`${line}-${index}`}
              className="pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300 first:pt-0"
            >
              {line.replace(/:$/, "")}
            </h4>
          );
        }

        if (isBullet) {
          return (
            <div
              key={`${line}-${index}`}
              className="rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm leading-5 text-slate-100"
            >
              {line.replace(/^-\s*/, "")}
            </div>
          );
        }

        return (
          <p key={`${line}-${index}`} className="text-sm leading-5 text-slate-200">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [keyword, setKeyword] = useState("ransomware");
  const [selectedArticle, setSelectedArticle] = useState("");
  const [skills, setSkills] = useState("");
  const [activeTab, setActiveTab] = useState<SummaryKey>("executive");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState("");

  const selected = useMemo(
    () => articles.find((article) => article._id === selectedArticle),
    [articles, selectedArticle]
  );

  async function loadArticles() {
    const response = await fetch(`${API_BASE}/api/news/articles`);
    if (!response.ok) throw new Error("Could not load stored articles");
    const data = await response.json();
    setArticles(data);
    if (!selectedArticle && data[0]?._id) setSelectedArticle(data[0]._id);
  }

  useEffect(() => {
    loadArticles().catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNews(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoadingNews(true);

    try {
      const response = await fetch(`${API_BASE}/api/news/fetch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not fetch news");

      setArticles(data.articles);
      if (data.articles[0]?._id) setSelectedArticle(data.articles[0]._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch news");
    } finally {
      setLoadingNews(false);
    }
  }

  async function analyzeArticle() {
    if (!selectedArticle) {
      setError("Select an article first");
      return;
    }

    setError("");
    setResult(null);
    setLoadingAnalysis(true);

    try {
      const response = await fetch(`${API_BASE}/api/ai/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: selectedArticle, skills }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not analyze article");
      setResult(data);
      setActiveTab("executive");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze article");
    } finally {
      setLoadingAnalysis(false);
    }
  }

  const busy = loadingNews || loadingAnalysis;

  return (
    <main className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-b border-slate-800 pb-5">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-400">
            Security News Intelligence
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            News crawler, threat analysis, and security career guidance
          </h1>
        </header>

        <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
            <form onSubmit={fetchNews} className="space-y-3">
              <label className="block text-sm font-medium text-slate-300" htmlFor="keyword">
                News keyword
              </label>
              <div className="flex gap-2">
                <input
                  id="keyword"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                  placeholder="ransomware, cloud breach, CVE"
                />
                <button
                  type="submit"
                  disabled={busy || !keyword.trim()}
                  className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Fetch
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300" htmlFor="article">
                Article
              </label>
              <select
                id="article"
                value={selectedArticle}
                onChange={(event) => setSelectedArticle(event.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              >
                <option value="">Select an article</option>
                {articles.map((article) => (
                  <option key={article._id} value={article._id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300" htmlFor="skills">
                Your security skills
              </label>
              <textarea
                id="skills"
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                rows={4}
                className="w-full resize-none rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                placeholder="SOC monitoring, Linux, Python, networking, pentesting basics"
              />
            </div>

            <button
              onClick={analyzeArticle}
              disabled={busy || !selectedArticle}
              className="w-full rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingAnalysis ? "Analyzing..." : "Analyze Selected Article"}
            </button>

            {error && (
              <div className="rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}
          </aside>

          <section className="min-h-[520px] rounded-lg border border-slate-800 bg-slate-950">
            <div className="border-b border-slate-800 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Selected source
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {selected?.title || "Fetch news or select an article"}
              </h2>
              {selected?.url && (
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block break-all text-sm text-cyan-300 hover:text-cyan-200"
                >
                  {selected.source || "Source"} - open article
                </a>
              )}
            </div>

            {loadingNews && (
              <div className="p-6 text-sm text-slate-300">Fetching security news from Google News...</div>
            )}

            {!result && !loadingNews && !loadingAnalysis && (
              <div className="p-6 text-sm leading-6 text-slate-400">
                Fetch current cybersecurity news, choose an article, add your skills, then run the analysis.
              </div>
            )}

            {loadingAnalysis && (
              <div className="p-6 text-sm text-slate-300">
                LangChain is sending the article to Groq and building the three analysis formats...
              </div>
            )}

            {result && (
              <div className="space-y-5 p-4 sm:p-6">
                <div className="flex flex-wrap gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`rounded-md px-3 py-2 text-left text-sm font-medium ${
                        activeTab === tab.key
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span className="block">{tab.label}</span>
                      <span className="block text-xs font-normal opacity-75">{tab.hint}</span>
                    </button>
                  ))}
                </div>

                <article className="rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-lg shadow-black/20">
                  <FormattedOutput text={result.summaries[activeTab]} />
                </article>

                <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-4 shadow-lg shadow-black/20">
                  <h3 className="mb-3 text-base font-semibold text-cyan-200">
                    Suggested Security Jobs
                  </h3>
                  <FormattedOutput text={result.jobRecommendations} />
                </div>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
