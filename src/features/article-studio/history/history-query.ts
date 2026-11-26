import type { ArticleHistoryItem } from "@/data/localStore";
export const HISTORY_PAGE_SIZE = 10;
export function filterHistory(
  history: ArticleHistoryItem[],
  query: string,
  source = "",
) {
  const keyword = query.trim().toLocaleLowerCase();
  const sorted = [...history]
    .filter((item) => !source || (item.source || "studio") === source)
    .sort(
      (a, b) => (Date.parse(b.time) || 0) - (Date.parse(a.time) || 0),
    );
  if (!keyword) return sorted;
  return sorted.filter((item) =>
    [
      item.title,
      item.tag,
      item.text || "",
      ...(item.blocks || []).map((block) =>
        [block.text || "", ...(block.items || [])].join(" "),
      ),
    ]
      .join("\n")
      .toLocaleLowerCase()
      .includes(keyword),
  );
}
