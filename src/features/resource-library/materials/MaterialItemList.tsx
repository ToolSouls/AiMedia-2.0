import { EmptyState } from "@/components/shared/empty-state";
import { DataPagination } from "@/components/shared/data-pagination";
import { FileTextIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { MaterialItemCard } from "./MaterialItemCard";
import { useMaterialsContext } from "./workspace-context";

const MATERIAL_PAGE_SIZE = 10;

export function MaterialItemList() {
  const { active, openEdit, resetMaterial, deleteMaterial } =
    useMaterialsContext();
  const [page, setPage] = useState(1);
  const total = active?.materials.length || 0;
  const pageCount = Math.max(1, Math.ceil(total / MATERIAL_PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [active?.id]);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  if (!active) return null;
  if (!active.materials.length) {
    return (
      <EmptyState
        icon={<FileTextIcon />}
        title="这个素材组还没有内容"
        description="可以通过「AI 生成素材」补充，或导入 txt 后选择该组。"
      />
    );
  }
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * MATERIAL_PAGE_SIZE;
  const visibleMaterials = active.materials.slice(
    start,
    start + MATERIAL_PAGE_SIZE,
  );
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 divide-y divide-border-subtle overflow-y-auto pr-1">
        {visibleMaterials.map((item) => (
          <MaterialItemCard
            key={item.id}
            item={item}
            onEdit={() => openEdit(active.id, item)}
            onReset={() => resetMaterial(active.id, item)}
            onDelete={() => deleteMaterial(active.id, item.id)}
          />
        ))}
      </div>
      <DataPagination
        total={total}
        page={currentPage}
        pageSize={MATERIAL_PAGE_SIZE}
        onChange={setPage}
        className="shrink-0 border-t border-border-subtle pt-3"
      />
    </div>
  );
}
