import { Button, Input } from "@/components/shared/controls";
import { FilterChips } from "@/components/shared/filter-chips";
import { MagnifyingGlassIcon, TrashIcon } from "@radix-ui/react-icons";
export function HistoryFilters({
  query,
  total,
  allCount,
  onSearch,
  onClear,
  source,
  onSourceChange,
}: {
  query: string;
  total: number;
  allCount: number;
  onSearch: (value: string) => void;
  onClear: () => void;
  source: string;
  onSourceChange: (value: string) => void;
}) {
  return (
    <div className="history-filters">
      <Input
        prefix={<MagnifyingGlassIcon />}
        aria-label="搜索历史作品"
        placeholder="搜索标题或正文"
        allowClear
        value={query}
        onChange={(e) => onSearch(e.target.value)}
      />
      <FilterChips
        value={source}
        options={[
          { value: "studio", label: "创作工坊" },
          { value: "automation", label: "自动托管" },
        ]}
        allLabel="全部来源"
        onChange={onSourceChange}
        ariaLabel="作品来源"
      />
      <span className="history-count">
        {query.trim()
          ? `匹配 ${total} / ${allCount} 篇`
          : `全部 ${allCount} 篇`}
      </span>
      <Button
        size="small"
        type="text"
        danger
        disabled={!allCount}
        icon={<TrashIcon />}
        onClick={onClear}
      >
        清空全部
      </Button>
    </div>
  );
}
