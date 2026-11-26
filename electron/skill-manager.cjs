"use strict";

const { app, dialog, ipcMain, shell } = require("electron");
const crypto = require("crypto");
const fs = require("fs");
const fsp = fs.promises;
const os = require("os");
const path = require("path");
const extractZip = require("extract-zip");

const OFFICIAL_SKILLS = [
  {
    id: "wechat-article-workflow",
    name: "公众号深度写作",
    type: "writing",
    file: "wechat-article-workflow.zip",
  },
  {
    id: "gzh-paiban-skill",
    name: "公众号自动排版",
    type: "layout",
    file: "gzh-paiban-skill.zip",
  },
];
const RELEASE_BASE =
  "https://gitee.com/gongdnq/ten-thousand-manuscripts-hub/releases/download/latest";
const CHECK_INTERVAL = 12 * 60 * 60 * 1000;
const MAX_ARCHIVE_BYTES = 20 * 1024 * 1024;
const MAX_INSTALL_BYTES = 60 * 1024 * 1024;

function rootDir() {
  return path.join(app.getPath("userData"), "skills");
}
function registryPath() {
  return path.join(rootDir(), "registry.json");
}
function safeId(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
function readRegistry() {
  try {
    const value = JSON.parse(fs.readFileSync(registryPath(), "utf8"));
    return {
      version: 1,
      lastCheckedAt: value.lastCheckedAt || 0,
      skills: value.skills && typeof value.skills === "object" ? value.skills : {},
    };
  } catch {
    return { version: 1, lastCheckedAt: 0, skills: {} };
  }
}
async function writeRegistry(value) {
  await fsp.mkdir(rootDir(), { recursive: true });
  const temp = `${registryPath()}.${process.pid}.tmp`;
  await fsp.writeFile(temp, JSON.stringify(value, null, 2), "utf8");
  await fsp.rename(temp, registryPath());
}
function parseSkillInfo(dir, fallback = {}) {
  const skillPath = path.join(dir, "SKILL.md");
  const metaPath = path.join(dir, "_skillhub_meta.json");
  let content = "";
  try {
    content = fs.readFileSync(skillPath, "utf8");
  } catch {
    /* ignore */
  }
  const frontmatter = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/)?.[1] || "";
  const field = (key) => {
    const lines = frontmatter.split(/\r?\n/);
    const index = lines.findIndex((line) =>
      new RegExp(`^${key}\\s*:`, "i").test(line),
    );
    if (index < 0) return "";
    const inline = lines[index]
      .replace(new RegExp(`^${key}\\s*:\\s*`, "i"), "")
      .trim();
    if (!["|", "|-", ">", ">-"].includes(inline)) {
      return inline.replace(/^["']|["']$/g, "").trim();
    }
    const block = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const line = lines[cursor];
      if (line && !/^\s/.test(line)) break;
      block.push(line.replace(/^\s{0,4}/, ""));
    }
    const text = block.join(inline.startsWith(">") ? " " : "\n").trim();
    return text;
  };
  let meta = {};
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  } catch {
    /* ignore */
  }
  const description = field("description_zh") || field("description") || "";
  const hint = `${fallback.name || field("display_name_zh") || field("name")} ${description}`;
  const type =
    fallback.type ||
    (/排版|主题|组件库|微信 html/i.test(hint) ? "layout" : "writing");
  return {
    id: safeId(fallback.id || meta.id || field("slug") || field("name")),
    name: fallback.name || field("display_name_zh") || field("display_name") || field("name") || "未命名 Skill",
    type,
    version: field("version") || "1.0.0",
    description,
    path: dir,
    skillPath,
  };
}
async function pathStats(source) {
  let files = 0;
  let bytes = 0;
  async function walk(current) {
    const entries = await fsp.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const next = path.join(current, entry.name);
      const stat = await fsp.lstat(next);
      if (stat.isSymbolicLink()) throw Error("Skill 不允许包含符号链接");
      if (stat.isDirectory()) await walk(next);
      else if (stat.isFile()) {
        files += 1;
        bytes += stat.size;
        if (files > 2000 || bytes > MAX_INSTALL_BYTES) {
          throw Error("Skill 文件数量或体积超过限制");
        }
      }
    }
  }
  await walk(source);
  return { files, bytes };
}
function findSkillRoot(directory) {
  if (fs.existsSync(path.join(directory, "SKILL.md"))) return directory;
  const children = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());
  for (const child of children) {
    const candidate = path.join(directory, child.name);
    if (fs.existsSync(path.join(candidate, "SKILL.md"))) return candidate;
  }
  throw Error("Skill 包中未找到 SKILL.md");
}
async function copySkill(source, scope, fallback = {}) {
  await pathStats(source);
  const info = parseSkillInfo(source, fallback);
  if (!info.id) throw Error("无法识别 Skill ID");
  const destination = path.join(rootDir(), scope, info.id);
  const temp = `${destination}.${process.pid}.new`;
  await fsp.rm(temp, { recursive: true, force: true });
  await fsp.mkdir(path.dirname(destination), { recursive: true });
  await fsp.cp(source, temp, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(source, src);
      if (!rel) return true;
      const first = rel.split(path.sep)[0];
      if (["\.git", "node_modules", "scripts", "__pycache__"].includes(first)) {
        return false;
      }
      return !/\.(?:exe|dll|bat|cmd|ps1|py|pyc|sh)$/i.test(rel);
    },
  });
  await fsp.rm(destination, { recursive: true, force: true });
  await fsp.rename(temp, destination);
  const installed = parseSkillInfo(destination, { ...fallback, id: info.id });
  const registry = readRegistry();
  registry.skills[`${scope}:${installed.id}`] = {
    ...installed,
    path: undefined,
    scope,
    installedAt: new Date().toISOString(),
  };
  await writeRegistry(registry);
  return { ...installed, scope };
}
async function extractArchive(zipPath) {
  const stat = await fsp.stat(zipPath);
  if (stat.size > MAX_ARCHIVE_BYTES) throw Error("Skill 压缩包超过 20MB");
  const temp = await fsp.mkdtemp(path.join(os.tmpdir(), "wangaohui-skill-"));
  const output = path.join(temp, "extracted");
  await fsp.mkdir(output, { recursive: true });
  await extractZip(zipPath, { dir: output });
  return { temp, root: findSkillRoot(output) };
}
async function installZip(zipPath, scope, fallback = {}) {
  const extracted = await extractArchive(zipPath);
  try {
    return await copySkill(extracted.root, scope, fallback);
  } finally {
    await fsp.rm(extracted.temp, { recursive: true, force: true });
  }
}
async function downloadOfficial(skill, registry) {
  const url = `${RELEASE_BASE}/${skill.file}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "WanGaoHui Skill Manager" },
    redirect: "follow",
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw Error(`HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length || buffer.length > MAX_ARCHIVE_BYTES) {
    throw Error("官方 Skill 文件为空或过大");
  }
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const key = `official:${skill.id}`;
  if (registry.skills[key]?.sha256 === hash) {
    return { ...registry.skills[key], changed: false };
  }
  const temp = path.join(os.tmpdir(), `wangaohui-${skill.id}-${Date.now()}.zip`);
  await fsp.writeFile(temp, buffer);
  try {
    const installed = await installZip(temp, "official", skill);
    const latest = readRegistry();
    latest.skills[key] = {
      ...latest.skills[key],
      ...installed,
      path: undefined,
      scope: "official",
      sourceUrl: url,
      sha256: hash,
      installedAt: new Date().toISOString(),
    };
    await writeRegistry(latest);
    return { ...latest.skills[key], changed: true };
  } finally {
    await fsp.rm(temp, { force: true });
  }
}
async function checkOfficialSkills(force = false) {
  const registry = readRegistry();
  if (!force && Date.now() - registry.lastCheckedAt < CHECK_INTERVAL) {
    return { ok: true, skipped: true, skills: listSkills().skills };
  }
  const results = [];
  for (const skill of OFFICIAL_SKILLS) {
    try {
      results.push({ ok: true, ...(await downloadOfficial(skill, registry)) });
    } catch (error) {
      results.push({ ok: false, id: skill.id, error: error.message || String(error) });
    }
  }
  const next = readRegistry();
  next.lastCheckedAt = Date.now();
  await writeRegistry(next);
  return { ok: results.some((row) => row.ok), results, skills: listSkills().skills };
}
function listSkills() {
  const registry = readRegistry();
  return {
    ok: true,
    skills: Object.entries(registry.skills)
      .map(([key, value]) => {
        const directory = value.skillPath
          ? path.dirname(value.skillPath)
          : path.join(rootDir(), value.scope || "custom", safeId(value.id));
        let parsed = {};
        try {
          parsed = parseSkillInfo(directory, value);
        } catch {
          /* keep registry data */
        }
        return { key, ...value, ...parsed, path: undefined, skillPath: value.skillPath };
      })
      .sort((a, b) => `${a.type}-${a.name}`.localeCompare(`${b.type}-${b.name}`)),
    lastCheckedAt: registry.lastCheckedAt,
  };
}
function writingSkillRules(key = "") {
  const candidates = [];
  if (key) {
    const entry = readRegistry().skills[String(key)];
    if (entry?.skillPath) candidates.push(entry.skillPath);
  }
  candidates.push(
    path.join(rootDir(), "official", "wechat-article-workflow", "SKILL.md"),
    path.join(rootDir(), "custom", "wechat-article-workflow", "SKILL.md"),
  );
  for (const candidate of candidates) {
    try {
      const text = fs.readFileSync(candidate, "utf8");
      const start = text.indexOf("### 第2步");
      const end = text.indexOf("### 第5步");
      const section = start >= 0 && end > start ? text.slice(start, end) : text.slice(0, 12000);
      return section.slice(0, 16000).trim();
    } catch {
      /* continue */
    }
  }
  return "";
}
async function chooseZip() {
  const result = await dialog.showOpenDialog({
    title: "导入 Skill ZIP",
    properties: ["openFile"],
    filters: [{ name: "Skill ZIP 压缩包", extensions: ["zip"] }],
  });
  if (result.canceled || !result.filePaths[0]) return { ok: false, canceled: true };
  const zipPath = result.filePaths[0];
  if (path.extname(zipPath).toLowerCase() !== ".zip") {
    return { ok: false, error: "仅支持导入 ZIP 压缩包" };
  }
  const installed = await installZip(zipPath, "custom");
  return { ok: true, skill: installed };
}
function registerSkillIpc() {
  ipcMain.handle("skills-list", () => listSkills());
  ipcMain.handle("skills-read-rules", (_event, payload = {}) => ({
    ok: true,
    rules: writingSkillRules(String(payload.key || "")),
  }));
  ipcMain.handle("skills-check", async () => checkOfficialSkills(true));
  ipcMain.handle("skills-import-zip", async () => {
    try {
      return await chooseZip();
    } catch (error) {
      return { ok: false, error: error.message || String(error) };
    }
  });
  ipcMain.handle("skills-open-dir", async () => {
    await fsp.mkdir(rootDir(), { recursive: true });
    const error = await shell.openPath(rootDir());
    return { ok: !error, error: error || "" };
  });
  ipcMain.handle("skills-remove", async (_event, payload = {}) => {
    const key = String(payload.key || "");
    if (!key.startsWith("custom:")) return { ok: false, error: "只能删除自定义 Skill" };
    const registry = readRegistry();
    if (!registry.skills[key]) return { ok: false, error: "Skill 不存在" };
    const id = registry.skills[key].id;
    const target = path.join(rootDir(), "custom", safeId(id));
    await fsp.rm(target, { recursive: true, force: true });
    delete registry.skills[key];
    await writeRegistry(registry);
    return { ok: true };
  });
}
function startSkillUpdater() {
  setTimeout(() => {
    void checkOfficialSkills(false).catch((error) => {
      console.warn(`[skills] official update failed: ${error.message || error}`);
    });
  }, 12 * 1000);
  const timer = setInterval(() => {
    void checkOfficialSkills(false).catch(() => {});
  }, CHECK_INTERVAL);
  timer.unref?.();
}

module.exports = {
  OFFICIAL_SKILLS,
  registerSkillIpc,
  startSkillUpdater,
  checkOfficialSkills,
  listSkills,
  writingSkillRules,
};
