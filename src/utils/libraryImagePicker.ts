import { listAssets } from "@/data/localStore";
import { pickImages } from "@/features/task-center/model";

const RECENT_KEY = "wangaohui:recentCoverImages";

function keywordsOf(text: string): string[] {
  const words = String(text || "").match(/[\u4e00-\u9fa5]{2,6}/g) || [];
  const stop = new Set([
    "我们",
    "一个",
    "什么",
    "可以",
    "自己",
    "因为",
    "所以",
    "但是",
    "没有",
    "不是",
    "这个",
    "那个",
    "以及",
    "进行",
  ]);
  const freq = new Map<string, number>();
  for (const word of words) {
    if (!stop.has(word)) freq.set(word, (freq.get(word) || 0) + 1);
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word]) => word);
}

function recentCovers(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function rememberCover(src: string) {
  try {
    const next = [src, ...recentCovers().filter((item) => item !== src)].slice(0, 20);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function pickLibraryCover(
  text: string,
  allowUnmatchedFallback = true,
): string {
  const images = listAssets()
    .filter((asset) => asset.kind === "图片")
    .map((asset) => ({
      src: asset.dataUrl || asset.sourceUrl || "",
      tags: asset.tags || [],
      name: asset.name || "",
    }))
    .filter((asset) => asset.src);
  if (!images.length) return "";

  const keywords = keywordsOf(text);
  const recent = new Set(recentCovers());
  const scored = images
    .map((image) => {
      const tagText = image.tags.join(" ").toLowerCase();
      const nameText = image.name.toLowerCase();
      const score = keywords.reduce((sum, keyword) => {
        const key = keyword.toLowerCase();
        return sum +
          (tagText && (tagText.includes(key) || key.includes(tagText)) ? 3 : 0) +
          (nameText.includes(key) ? 1 : 0);
      }, 0);
      return { ...image, score };
    })
    .sort((a, b) => b.score - a.score);

  const matched = scored.filter((image) => image.score > 0);
  if (!matched.length && !allowUnmatchedFallback) return "";
  const relevantPool = matched.length ? matched : scored;
  const fresh = relevantPool.filter((image) => !recent.has(image.src));
  const pool = fresh.length ? fresh : relevantPool;
  const picked = pool[Math.floor(Math.random() * pool.length)]?.src || "";
  if (picked) rememberCover(picked);
  return picked;
}

export async function pickArticleCover(
  text: string,
  source: "auto" | "library" = "auto",
): Promise<string> {
  if (source === "library") {
    return pickLibraryCover(text, true);
  }

  const localMatch = pickLibraryCover(text, false);
  if (localMatch) return localMatch;

  try {
    const remote = await pickImages("auto", 1, text);
    if (remote[0]) return remote[0];
  } catch {
    /* fall through to an unmatched local image */
  }

  return pickLibraryCover(text, true);
}
