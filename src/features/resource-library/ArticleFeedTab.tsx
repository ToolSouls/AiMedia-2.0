import { DataPagination } from "@/components/shared/data-pagination";
import { ArticleFilters } from "./ArticleFilters";
import { ArticleList } from "./ArticleList";
import { HOT_PAGE_SIZE } from "./model";
import { useResourceLibraryContext } from "./workspace-context";

export function ArticleFeedTab() {
  const state = useResourceLibraryContext();

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <ArticleFilters
        categories={state.categories}
        category={state.hotCategory}
        total={state.hotTotal}
        label="近7天热点"
        onChange={(value) => {
          state.setHotCategory(value);
          void state.loadHot(1, value);
        }}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ArticleList
          articles={state.hotList}
          loading={state.hotLoading}
          withCover={false}
          emptyText="近7天暂无已分类热点"
          onGenerate={state.handleGenerate}
        />
      </div>
      <DataPagination
        total={state.hotTotal}
        page={state.hotPage}
        pageSize={HOT_PAGE_SIZE}
        onChange={(page) => void state.loadHot(page)}
        className="shrink-0 pt-4"
      />
    </div>
  );
}
