export type SearchEnrichmentResult =
  | {
      ok: true;
      text: string;
      count: number;
      cached: boolean;
    }
  | { ok: false; error: string };

export async function enrichWithSearch(
  title: string,
): Promise<SearchEnrichmentResult> {
  const search = window.wangaohui?.qilingSearch;
  if (!search) return { ok: false, error: "联网补全接口不可用" };
  let result: {
    ok: boolean;
    error?: string;
    summary?: string;
    highlights?: QilingHotNewsHighlight[];
    sources?: QilingHotNewsSource[];
    cached?: boolean;
  };
  try {
    result = await search({
      topic: title.trim().slice(0, 64),
      count: 5,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "联网搜索失败",
    };
  }
  if (!result.ok) {
    return { ok: false, error: result.error || "联网搜索失败" };
  }
  const highlights = result.highlights || [];
  const sources = result.sources || [];
  if (!result.summary && !highlights.length && !sources.length) {
    return { ok: false, error: "未找到可用的补充资料" };
  }
  const sections = [
    result.summary ? `【热点扩充概览】\n${result.summary}` : "",
    highlights.length
      ? `【关键要点】\n${highlights
          .map(
            (item, index) =>
              `${index + 1}. ${item.title}${item.point ? `：${item.point}` : ""}${item.sourceUrl ? `\n来源：${item.sourceUrl}` : ""}`,
          )
          .join("\n")}`
      : "",
    sources.length
      ? `【公开来源】\n${sources
          .map(
            (item, index) =>
              `${index + 1}. ${item.title}${item.siteName ? ` · ${item.siteName}` : ""}${item.publishedAt ? ` · ${item.publishedAt}` : ""}${item.url ? `\n${item.url}` : ""}${item.summary ? `\n${item.summary}` : ""}`,
          )
          .join("\n\n")}`
      : "",
  ].filter(Boolean);
  return {
    ok: true,
    text: sections.join("\n\n").slice(0, 10000),
    count: Math.max(highlights.length, sources.length),
    cached: result.cached === true,
  };
}
