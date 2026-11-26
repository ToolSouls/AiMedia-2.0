"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createQilingApi, fault } = require("./qiling-api.cjs");

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ITEMS = 200;

function text(value, max = 4000) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function cleanKeywords(value) {
  if (!Array.isArray(value)) return [];
  const result = [];
  for (const item of value) {
    const keyword = text(item, 20);
    if (keyword && !result.includes(keyword)) result.push(keyword);
    if (result.length >= 8) break;
  }
  return result;
}

function createQilingSearch({
  config,
  directory,
  api = createQilingApi(),
  now = Date.now,
}) {
  const cacheFile = path.join(directory, "qiling-hot-news-cache.json");

  function readCache() {
    try {
      const value = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function writeCache(items) {
    try {
      fs.mkdirSync(directory, { recursive: true });
      const temporary = `${cacheFile}.${process.pid}.tmp`;
      fs.writeFileSync(temporary, JSON.stringify(items.slice(0, MAX_CACHE_ITEMS)), {
        mode: 0o600,
      });
      fs.renameSync(temporary, cacheFile);
    } catch {
      // Cache failure must not block article generation.
    }
  }

  async function search(input = {}) {
    const topic = text(input.topic || input.query, 64);
    if (!topic) throw fault("热点信息扩充缺少主题");
    const keywords = cleanKeywords(input.keywords);
    const count = Math.min(20, Math.max(1, Number(input.count) || 5));
    const runtime = config.runtimeConfig();
    const key = runtime.QILING_API_KEY;
    if (!key) throw fault("请先在 AI 配置中授权器灵或填写器灵 API Key");

    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify([topic, keywords, count]))
      .digest("hex");
    const cached = readCache().find(
      (item) => item.hash === hash && Number(item.expiresAt) > now(),
    );
    if (cached) {
      console.log(
        `[qiling-hot-news] cache hit: sources=${cached.result?.sources?.length || 0}`,
      );
      return { ...cached.result, cached: true };
    }

    let data;
    try {
      console.log(`[qiling-hot-news] request start: count=${count}`);
      data = await api.request("/api/v1/open/hot-news", {
        key,
        method: "POST",
        body: { topic, keywords, count },
      });
    } catch (error) {
      if (error.status === 404) {
        console.warn("[qiling-hot-news] unavailable: HTTP 404");
        throw fault(
          "器灵热点信息扩充服务暂不可用",
          "QILING_HOT_NEWS_UNAVAILABLE",
          404,
        );
      }
      if (error.status === 422) {
        console.warn("[qiling-hot-news] no results or invalid topic");
        throw fault(
          error.message || "暂未整理到有效热点，本次不收费",
          "QILING_HOT_NEWS_EMPTY",
          422,
        );
      }
      console.warn(
        `[qiling-hot-news] failed: status=${error.status || 0} code=${error.code || ""}`,
      );
      throw error;
    }

    const result = data?.result;
    if (!result || typeof result !== "object") {
      throw fault("热点信息扩充返回格式异常");
    }
    const normalized = {
      topic: text(result.topic, 64) || topic,
      summary: text(result.summary, 2000),
      highlights: Array.isArray(result.highlights)
        ? result.highlights
            .map((item) => ({
              title: text(item?.title, 200),
              point: text(item?.point, 500),
              sourceUrl: text(item?.source_url, 1200),
            }))
            .filter((item) => item.title || item.point)
        : [],
      sources: Array.isArray(result.sources)
        ? result.sources
            .map((item, index) => ({
              index: index + 1,
              title: text(item?.title, 300) || `来源 ${index + 1}`,
              url: text(item?.url, 1200),
              siteName: text(item?.site_name, 160),
              publishedAt: text(item?.published_at, 80),
              summary: text(item?.summary, 500),
            }))
            .filter((item) => item.title || item.summary)
        : [],
      generatedAt: text(result.generated_at, 80),
      charged: text(data.charged, 40),
      balance: text(data.balance, 40),
      cached: false,
    };
    if (!normalized.sources.length && !normalized.summary) {
      throw fault("暂未整理到有效热点，本次不收费", "QILING_HOT_NEWS_EMPTY", 422);
    }

    const next = [
      {
        hash,
        topic,
        keywords,
        count,
        createdAt: now(),
        expiresAt: now() + CACHE_TTL_MS,
        result: normalized,
      },
      ...readCache().filter((item) => item.hash !== hash),
    ];
    writeCache(next);
    console.log(
      `[qiling-hot-news] completed: sources=${normalized.sources.length}`,
    );
    return normalized;
  }

  return { search };
}

module.exports = { createQilingSearch };
