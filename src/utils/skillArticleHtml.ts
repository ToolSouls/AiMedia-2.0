interface LayoutBlock {
  type: string;
  text?: string;
  items?: string[];
  src?: string;
}

interface SkillTheme {
  id: string;
  name: string;
  reason: string;
  accent: string;
  soft: string;
  deep: string;
  ink: string;
  body: string;
  muted: string;
  bg: string;
  border: string;
  highlight: string;
}

const FONT =
  "-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";

const THEMES: SkillTheme[] = [
  {
    id: "moyu-green",
    name: "摸鱼绿",
    reason: "教程、清单和方法类内容信息密度较高",
    accent: "#059669",
    soft: "#ECFDF5",
    deep: "#065F46",
    ink: "#111827",
    body: "#374151",
    muted: "#6B7280",
    bg: "#FFFFFF",
    border: "#D1F2E4",
    highlight: "#A7F3D0",
  },
  {
    id: "red-white",
    name: "红白色系",
    reason: "观点、深度分析和力量感话题适合编辑风",
    accent: "#DC2626",
    soft: "#FEF2F2",
    deep: "#991B1B",
    ink: "#1F1F1F",
    body: "#374151",
    muted: "#6B7280",
    bg: "#FFFFFF",
    border: "#FECACA",
    highlight: "#FECACA",
  },
  {
    id: "graphite-minimal",
    name: "石墨极简风",
    reason: "科技、产品和专业评论适合克制留白",
    accent: "#52525B",
    soft: "#F4F4F5",
    deep: "#27272A",
    ink: "#18181B",
    body: "#3F3F46",
    muted: "#71717A",
    bg: "#FFFFFF",
    border: "#E4E4E7",
    highlight: "#D4D4D8",
  },
  {
    id: "zen-whitespace",
    name: "留白禅意风",
    reason: "生活、情绪和随笔内容需要更多呼吸感",
    accent: "#4A5D52",
    soft: "#F6F8F6",
    deep: "#2F3D35",
    ink: "#26302A",
    body: "#46524B",
    muted: "#7D8981",
    bg: "#FCFCFA",
    border: "#DDE6E0",
    highlight: "#B5C8BC",
  },
  {
    id: "moyu-ticket",
    name: "摸鱼票据风",
    reason: "测评、对比和推荐内容适合票据式视觉",
    accent: "#059669",
    soft: "#ECFDF5",
    deep: "#065F46",
    ink: "#111827",
    body: "#374151",
    muted: "#6B7280",
    bg: "#FFFFFF",
    border: "#BBF7D0",
    highlight: "#FDE68A",
  },
  {
    id: "olive-journal",
    name: "橄榄手记",
    reason: "案例复盘和系统说明适合内刊手记质感",
    accent: "#ED7B2F",
    soft: "#FFF7ED",
    deep: "#9A3412",
    ink: "#1E1F23",
    body: "#44403C",
    muted: "#78716C",
    bg: "#FFFDF9",
    border: "#FED7AA",
    highlight: "#FDBA74",
  },
];

function escapeHtml(value: string): string {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function leaf(value: string): string {
  return `<span leaf="">${escapeHtml(value)}</span>`;
}

function contentText(blocks: LayoutBlock[]): string {
  return blocks
    .map((block) => `${block.text || ""}\n${(block.items || []).join("\n")}`)
    .join("\n");
}

export function chooseSkillTheme(blocks: LayoutBlock[]): SkillTheme {
  const text = contentText(blocks);
  const scores = new Map(THEMES.map((theme) => [theme.id, 0]));
  const score = (id: string, pattern: RegExp, weight: number) => {
    if (pattern.test(text)) scores.set(id, (scores.get(id) || 0) + weight);
  };
  const h2Count = blocks.filter((block) => block.type === "h2").length;
  const listCount = blocks.filter((block) => block.type === "list").length;

  score("moyu-green", /教程|步骤|指南|清单|方法|怎么|如何|盘点|技巧|攻略/, 4);
  score("moyu-green", /工具|软件|流程|操作/, 2);
  score("red-white", /为什么|真相|本质|观点|认知|争议|焦虑|愤怒|力量|深度/, 4);
  score("red-white", /普通家庭|教育|公平|代价/, 2);
  score("graphite-minimal", /AI|人工智能|科技|产品|设计|模型|互联网|芯片|数码/, 4);
  score("graphite-minimal", /专业|行业|效率/, 2);
  score("zen-whitespace", /生活|松弛|独处|治愈|情绪|禅|慢下来|关系|婚姻/, 4);
  score("zen-whitespace", /随笔|感受|内心/, 2);
  score("moyu-ticket", /测评|对比|推荐|选择|值不值|排名|榜单|价格|费用/, 4);
  score("olive-journal", /复盘|案例|项目|经验|手记|团队|实战|总结/, 4);

  if (h2Count >= 3 || listCount >= 2) {
    scores.set("moyu-green", (scores.get("moyu-green") || 0) + 2);
  }
  if (h2Count <= 2 && /情绪|成长|生活|关系/.test(text)) {
    scores.set("zen-whitespace", (scores.get("zen-whitespace") || 0) + 2);
  }

  return THEMES.reduce((best, theme) =>
    (scores.get(theme.id) || 0) > (scores.get(best.id) || 0) ? theme : best,
  );
}

function choosePhrase(text: string): string {
  const clauses = text
    .split(/[，。！？；：、,.!?;:]/)
    .map((part) => part.trim())
    .filter((part) => Array.from(part).length >= 4 && Array.from(part).length <= 18);
  if (!clauses.length) return "";
  return clauses.sort((a, b) => {
    const score = (value: string) =>
      (/\d/.test(value) ? 3 : 0) +
      (/关键|核心|真正|本质|不是|而是|因为|所以/.test(value) ? 2 : 0) +
      Math.min(2, Array.from(value).length / 8);
    return score(b) - score(a);
  })[0];
}

function paragraphHtml(block: LayoutBlock, theme: SkillTheme): string {
  const text = block.text || "";
  const phrase = choosePhrase(text);
  const style = `font-size:15px;line-height:1.92;color:${theme.body};margin:0 0 18px;text-align:justify;letter-spacing:0.2px;`;
  if (!phrase || !text.includes(phrase)) {
    return `<p style="${style}">${leaf(text)}</p>`;
  }
  const index = text.indexOf(phrase);
  const before = text.slice(0, index);
  const after = text.slice(index + phrase.length);
  return `<p style="${style}">${before ? leaf(before) : ""}<span style="border-bottom:2px solid ${theme.highlight};font-weight:600;color:${theme.ink};">${leaf(phrase)}</span>${after ? leaf(after) : ""}</p>`;
}

function coverHtml(title: string, quote: string, theme: SkillTheme): string {
  const now = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replace(/\//g, ".");
  return `<section style="margin:0 0 28px;padding:30px 24px;border:1px solid ${theme.border};border-radius:18px;background:${theme.soft};">
  <p style="margin:0 0 18px;font-size:11px;font-weight:700;color:${theme.accent};letter-spacing:2px;">${leaf(`${theme.name.toUpperCase()} · ${now}`)}</p>
  <p style="margin:0;font-size:26px;font-weight:900;line-height:1.38;color:${theme.ink};letter-spacing:-0.5px;">${leaf(title)}</p>
  ${quote ? `<p style="margin:18px 0 0;padding-left:14px;border-left:3px solid ${theme.accent};font-size:14px;line-height:1.8;color:${theme.muted};">${leaf(quote)}</p>` : ""}
</section>`;
}

function tocHtml(headings: string[], theme: SkillTheme): string {
  if (headings.length < 2) return "";
  return `<section style="margin:0 0 26px;padding:18px 20px;border-radius:12px;background:${theme.bg};border:1px solid ${theme.border};">
  <p style="margin:0 0 12px;font-size:14px;font-weight:800;color:${theme.ink};">${leaf("本文导读")}</p>
  ${headings
    .slice(0, 3)
    .map(
      (heading, index) =>
        `<p style="margin:${index ? "9px" : "0"} 0 0;font-size:13px;line-height:1.7;color:${theme.body};"><span style="display:inline-block;min-width:24px;color:${theme.accent};font-weight:800;">${leaf(String(index + 1).padStart(2, "0"))}</span>${leaf(heading)}</p>`,
    )
    .join("")}
</section>`;
}

function chapterHtml(title: string, index: number, theme: SkillTheme): string {
  if (theme.id === "graphite-minimal" || theme.id === "zen-whitespace") {
    return `<section style="margin:42px 0 20px;padding:${theme.id === "zen-whitespace" ? "0 0 14px" : "0 0 12px"};border-bottom:1px solid ${theme.border};">
  <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:${theme.accent};letter-spacing:2px;">${leaf(`PART ${String(index + 1).padStart(2, "0")}`)}</p>
  <p style="margin:0;font-size:22px;font-weight:800;line-height:1.45;color:${theme.ink};text-align:${theme.id === "zen-whitespace" ? "center" : "left"};">${leaf(title)}</p>
</section>`;
  }
  return `<section style="margin:38px 0 20px;">
  <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:${theme.accent};letter-spacing:2px;">${leaf(`PART ${String(index + 1).padStart(2, "0")}`)}</p>
  <p style="margin:0;">
    <span style="display:inline-block;background:${theme.accent};color:#FFFFFF;font-size:12px;font-weight:800;padding:3px 9px;border-radius:6px;margin-right:9px;">${leaf(String(index + 1).padStart(2, "0"))}</span>
    <span style="font-size:20px;font-weight:800;line-height:1.5;color:${theme.ink};">${leaf(title)}</span>
  </p>
</section>`;
}

function listHtml(items: string[], theme: SkillTheme): string {
  return `<section style="margin:2px 0 22px;">${items
    .map(
      (item, index) =>
        `<section style="display:flex;align-items:flex-start;gap:10px;margin:0 0 11px;">
  <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:50%;background:${theme.accent};color:#FFFFFF;font-size:11px;font-weight:700;flex-shrink:0;">${leaf(String(index + 1))}</span>
  <p style="flex:1;margin:0;font-size:14px;line-height:1.8;color:${theme.body};">${leaf(item)}</p>
</section>`,
    )
    .join("")}</section>`;
}

function quoteHtml(text: string, theme: SkillTheme): string {
  return `<section style="margin:0 0 22px;padding:16px 18px;border-left:4px solid ${theme.accent};border-radius:0 10px 10px 0;background:${theme.soft};">
  <p style="margin:0;font-size:15px;font-weight:700;line-height:1.82;color:${theme.deep};">${leaf(`「${text}」`)}</p>
</section>`;
}

function imageHtml(block: LayoutBlock, theme: SkillTheme): string {
  if (!block.src) {
    return `<section style="margin:0 0 22px;padding:24px 16px;text-align:center;border:1px dashed ${theme.border};border-radius:12px;background:${theme.soft};"><p style="margin:0;font-size:13px;color:${theme.muted};">${leaf(block.text || "图片待补")}</p></section>`;
  }
  return `<section style="margin:0 0 ${block.text ? "8px" : "22px"};padding:6px;border:1px solid ${theme.border};border-radius:12px;background:${theme.bg};">
  <span leaf=""><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.text || "")}" style="max-width:100%;height:auto;display:block;margin:0 auto;border-radius:8px;"></span>
</section>${block.text ? `<p style="margin:0 0 22px;text-align:center;font-size:12px;color:${theme.muted};">${leaf(`— ${block.text}`)}</p>` : ""}`;
}

function footerHtml(theme: SkillTheme): string {
  return `<section style="margin:34px 0 4px;padding:24px 20px;border-radius:16px;background:${theme.soft};border:1px solid ${theme.border};text-align:center;">
  <p style="margin:0 0 8px;font-size:15px;font-weight:800;color:${theme.ink};">${leaf("如果这篇内容对你有帮助")}</p>
  <p style="margin:0;font-size:13px;line-height:1.8;color:${theme.muted};">${leaf("欢迎点赞、在看、转发，也欢迎在评论区说说你的经历。")}</p>
</section>`;
}

export function buildSkillInlineHtml(blocks: LayoutBlock[]): {
  html: string;
  themeId: string;
  themeName: string;
  themeReason: string;
} {
  const theme = chooseSkillTheme(blocks);
  const title =
    blocks.find((block) => block.type === "title")?.text?.trim() || "未命名文章";
  const firstHeading = blocks.findIndex((block) => block.type === "h2");
  const leadQuote =
    blocks
      .slice(0, firstHeading >= 0 ? firstHeading : blocks.length)
      .find((block) => block.type === "quote")?.text || "";
  const headings = blocks
    .filter((block) => block.type === "h2")
    .map((block) => block.text || "")
    .filter(Boolean);

  let chapterNo = 0;
  let hasCta = false;
  const body: string[] = [];
  for (const block of blocks) {
    if (block.type === "title" || block.text === leadQuote) continue;
    switch (block.type) {
      case "h2":
        body.push(chapterHtml(block.text || "", chapterNo++, theme));
        break;
      case "p":
      case "subtitle":
        body.push(paragraphHtml(block, theme));
        break;
      case "list":
        body.push(listHtml(block.items || [], theme));
        break;
      case "quote":
        body.push(quoteHtml(block.text || "", theme));
        break;
      case "card":
      case "tip":
        body.push(`<section style="margin:0 0 22px;padding:15px 18px;border-radius:10px;background:${theme.soft};border-left:4px solid ${theme.accent};"><p style="margin:0;font-size:14px;line-height:1.82;color:${theme.body};">${leaf(block.text || "")}</p></section>`);
        break;
      case "image":
        // 自动排版只生成文字版式，封面在发布阶段从图库按标签随机选择。
        break;
      case "divider":
        body.push(`<section style="height:1px;margin:24px 0;background:${theme.border};"><span leaf=""><br></span></section>`);
        break;
      case "follow":
      case "cta":
        hasCta = true;
        body.push(`<section style="margin:30px 0 4px;padding:22px 18px;text-align:center;border-radius:14px;background:${theme.accent};"><p style="margin:0;font-size:15px;font-weight:700;line-height:1.75;color:#FFFFFF;">${leaf(block.text || "喜欢这篇内容，欢迎点赞、在看和转发。")}</p></section>`);
        break;
      case "badges":
      case "infoGrid":
        body.push(
          paragraphHtml(
            { type: "p", text: (block.items || []).join(" · ") },
            theme,
          ),
        );
        break;
      default:
        if (block.text)
          body.push(paragraphHtml({ ...block, type: "p" }, theme));
    }
  }
  if (!hasCta) body.push(footerHtml(theme));

  const html = `<section style="max-width:677px;margin:0 auto;padding:22px 20px 10px;box-sizing:border-box;background:${theme.bg};font-family:${FONT};color:${theme.body};line-height:1.75;letter-spacing:0.2px;overflow-x:hidden;">
${coverHtml(title, leadQuote, theme)}
${tocHtml(headings, theme)}
${body.join("\n")}
</section>`;
  return {
    html,
    themeId: theme.id,
    themeName: theme.name,
    themeReason: theme.reason,
  };
}
