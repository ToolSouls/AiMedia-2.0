import { EmptyState } from "@/components/shared/empty-state";
import { FilterChips } from "@/components/shared/filter-chips";
import {
  Button,
  Input,
  Modal,
  Segmented,
} from "@/components/shared/controls";
import { Badge } from "@/components/ui/badge";
import {
  listMaterialGroups,
  type MaterialStatus,
} from "@/data/localStore";
import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  FileTextIcon,
  MagicWandIcon,
  ReloadIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import { fetchArticles, type ResourceArticle } from "@/utils/resourceApi";
import { useEffect, useMemo, useState } from "react";

type SourceTab = "hot" | "mine";
type MaterialSource = "hot" | "txt" | "ai";

export interface SelectedMaterialSource {
  title: string;
  content: string;
  source: MaterialSource;
  groupName?: string;
}

interface SourceItem extends SelectedMaterialSource {
  key: string;
  meta: string;
  status?: MaterialStatus;
  isOutline?: boolean;
}

const SOURCE_OPTIONS = [
  { value: "txt", label: "自己上传" },
  { value: "ai", label: "AI 生成" },
];

const TAB_OPTIONS = [
  { value: "hot", label: "近 7 天素材" },
  { value: "mine", label: "我的素材" },
];

const MINE_PAGE_SIZE = 60;
const HOT_PAGE_SIZE = 40;

const MATERIAL_STATUS: Record<
  MaterialStatus,
  { label: string; className: string }
> = {
  pending: { label: "未使用", className: "bg-amber-500/12 text-amber-700" },
  using: { label: "使用中", className: "bg-accent text-accent-foreground" },
  used: { label: "已使用", className: "bg-emerald-500/12 text-emerald-700" },
  failed: { label: "失败", className: "bg-destructive/10 text-destructive" },
};

function cleanText(value?: string): string {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function previewText(value: string): string {
  return cleanText(value)
    .replace(/[#*_`>【】]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function dateText(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 16).replace("T", " ");
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function hotItem(article: ResourceArticle): SourceItem {
  return {
    key: `hot:${article.id}`,
    title: article.title || "未命名素材",
    content: cleanText(article.content_text || article.summary),
    source: "hot",
    meta: [article.category || "待分类", article.platform, dateText(article.published_at || article.fetched_at)]
      .filter(Boolean)
      .join(" · "),
  };
}

export function MaterialSourceDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: SelectedMaterialSource) => void;
}) {
  const [tab, setTab] = useState<SourceTab>("hot");
  const [query, setQuery] = useState("");
  const [hotItems, setHotItems] = useState<SourceItem[]>([]);
  const [hotLoading, setHotLoading] = useState(false);
  const [hotError, setHotError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [mineSource, setMineSource] = useState("all");
  const [mineLimit, setMineLimit] = useState(MINE_PAGE_SIZE);
  const [selected, setSelected] = useState<SourceItem | null>(null);
  const [materialGroups, setMaterialGroups] = useState(() =>
    listMaterialGroups(),
  );

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setMaterialGroups(listMaterialGroups());
  }, [open]);

  useEffect(() => {
    if (!open || tab !== "hot") return;
    let active = true;
    const timer = window.setTimeout(() => {
      setHotLoading(true);
      setHotError("");
      const after = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      void fetchArticles({
        source_type: "newsnow",
        classified: true,
        after,
        q: query.trim() || undefined,
        page: 1,
        page_size: HOT_PAGE_SIZE,
      })
        .then((result) => {
          if (!active) return;
          setHotItems((result.data || []).map(hotItem));
        })
        .catch(() => {
          if (active) {
            setHotError("近 7 天素材加载失败，请检查资源库服务");
          }
        })
        .finally(() => {
          if (active) setHotLoading(false);
        });
    }, query.trim() ? 280 : 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [open, tab, query, reloadKey]);

  useEffect(() => {
    if (!open) return;
    setMineLimit(MINE_PAGE_SIZE);
  }, [open, tab, mineSource, query]);

  const mineItems = useMemo<SourceItem[]>(
    () =>
      materialGroups
        .flatMap((group) =>
          group.materials.map((material) => ({
            key: `mine:${group.id}:${material.id}`,
            title: material.title || "未命名素材",
            content: cleanText(material.content),
            source: group.source === "ai" ? ("ai" as const) : ("txt" as const),
            groupName: group.name,
            meta: `${group.name} · ${material.isOutline ? "大纲" : "正文"} · ${dateText(material.createdAt)}`,
            status: material.status,
            isOutline: material.isOutline,
          })),
        ),
    [materialGroups],
  );

  const filteredMine = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return mineItems.filter((item) => {
      if (mineSource !== "all" && item.source !== mineSource) return false;
      if (!keyword) return true;
      return `${item.title}\n${item.content}\n${item.groupName || ""}`
        .toLowerCase()
        .includes(keyword);
    });
  }, [mineItems, mineSource, query]);

  const visibleMine = filteredMine.slice(0, mineLimit);
  const items = tab === "hot" ? hotItems : visibleMine;
  const loading = tab === "hot" && hotLoading;
  const error = tab === "hot" ? hotError : "";

  const selectAndClose = () => {
    if (!selected) return;
    onSelect({
      title: selected.title,
      content: selected.content,
      source: selected.source,
      groupName: selected.groupName,
    });
    onOpenChange(false);
  };

  const switchTab = (value: string) => {
    const next = value === "mine" ? "mine" : "hot";
    setTab(next);
    setSelected(null);
    setQuery("");
  };

  return (
    <Modal
      open={open}
      title="选择创作素材"
      width={860}
      onCancel={() => onOpenChange(false)}
      footer={
        <>
          <Button onClick={() => onOpenChange(false)}>取消</Button>
          <Button type="primary" disabled={!selected} onClick={selectAndClose}>
            {selected ? `使用「${selected.title.slice(0, 16)}」` : "使用所选素材"}
          </Button>
        </>
      }
    >
      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented
            value={tab}
            onChange={switchTab}
            options={TAB_OPTIONS}
          />
          <span className="text-xs text-muted-foreground">
            {tab === "hot"
              ? "已按发布时间筛选最近 7 天"
              : `共 ${mineItems.length} 条，可搜索标题和正文`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input.Search
            className="min-w-[240px] flex-1"
            value={query}
            allowClear
            placeholder={
              tab === "hot"
                ? "搜索近 7 天素材标题或内容"
                : "搜索我的素材、分组或正文"
            }
            onChange={(event) => setQuery(event.target.value)}
            onSearch={setQuery}
          />
          {tab === "mine" && (
            <FilterChips
              value={mineSource}
              options={SOURCE_OPTIONS}
              allLabel="全部来源"
              onChange={setMineSource}
              ariaLabel="素材来源"
            />
          )}
          {tab === "hot" && (
            <Button
              size="small"
              icon={<ReloadIcon className={hotLoading ? "animate-spin" : ""} />}
              disabled={hotLoading}
              onClick={() => setReloadKey((value) => value + 1)}
            >
              刷新
            </Button>
          )}
        </div>

        <div className="max-h-[430px] min-h-[280px] overflow-y-auto rounded-lg border border-border/70 bg-surface-subtle/30">
          {loading && !items.length ? (
            <div className="flex h-[280px] items-center justify-center gap-2 text-sm text-muted-foreground">
              <ReloadIcon className="animate-spin" />
              正在读取素材…
            </div>
          ) : error ? (
            <EmptyState
              icon={<FileTextIcon />}
              title="素材加载失败"
              description={error}
              action={
                <Button size="small" onClick={() => setReloadKey((v) => v + 1)}>
                  重新加载
                </Button>
              }
            />
          ) : !items.length ? (
            <EmptyState
              icon={tab === "hot" ? <FileTextIcon /> : <UploadIcon />}
              title={query.trim() ? "没有找到匹配素材" : "暂无可用素材"}
              description={
                tab === "hot"
                  ? "可换个关键词，或稍后刷新近 7 天素材。"
                  : "先在资源管理导入 TXT，或使用 AI 生成素材。"
              }
            />
          ) : (
            <div className="divide-y divide-border/60">
              {items.map((item) => {
                const active = selected?.key === item.key;
                const materialStatus = item.status
                  ? MATERIAL_STATUS[item.status]
                  : null;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={active}
                    className={cn(
                      "group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      active && "bg-primary/[0.07]",
                    )}
                    onClick={() => setSelected(item)}
                    onDoubleClick={() => {
                      setSelected(item);
                      onSelect({
                        title: item.title,
                        content: item.content,
                        source: item.source,
                        groupName: item.groupName,
                      });
                      onOpenChange(false);
                    }}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground",
                        active && "bg-primary/10 text-primary",
                      )}
                    >
                      {item.source === "ai" ? (
                        <MagicWandIcon />
                      ) : item.source === "txt" ? (
                        <UploadIcon />
                      ) : (
                        <FileTextIcon />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {item.title}
                        </span>
                        {item.source === "hot" && (
                          <Badge variant="secondary" className="font-normal">
                            近 7 天
                          </Badge>
                        )}
                        {item.source === "txt" && (
                          <Badge variant="secondary" className="font-normal">
                            自己上传
                          </Badge>
                        )}
                        {item.source === "ai" && (
                          <Badge variant="secondary" className="font-normal">
                            AI 生成
                          </Badge>
                        )}
                        {tab === "mine" && item.isOutline && (
                          <Badge
                            variant="secondary"
                            className="bg-muted font-normal text-muted-foreground"
                          >
                            大纲
                          </Badge>
                        )}
                        {tab === "mine" && materialStatus && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "font-normal",
                              materialStatus.className,
                            )}
                          >
                            {materialStatus.label}
                          </Badge>
                        )}
                      </span>
                      <span className="mt-1 line-clamp-1 block text-xs text-muted-foreground">
                        {previewText(item.content) || "仅标题，无正文内容"}
                      </span>
                      <span className="mt-1.5 block truncate text-[11px] text-muted-foreground/80">
                        {item.meta}
                      </span>
                    </span>
                    <ArrowRightIcon
                      className={cn(
                        "mt-1 shrink-0 text-muted-foreground/40",
                        active && "text-primary",
                      )}
                    />
                  </button>
                );
              })}
              {tab === "mine" && filteredMine.length > visibleMine.length && (
                <div className="flex justify-center p-3">
                  <Button
                    size="small"
                    onClick={() =>
                      setMineLimit((value) => value + MINE_PAGE_SIZE)
                    }
                  >
                    再显示 {Math.min(MINE_PAGE_SIZE, filteredMine.length - visibleMine.length)} 条
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="m-0 text-xs leading-relaxed text-muted-foreground">
          单选一条素材后点击右下角带入。双击素材也可以直接使用；带入后仍可在输入框继续修改。
        </p>
      </div>
    </Modal>
  );
}
