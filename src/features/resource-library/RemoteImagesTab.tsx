import { DataPagination } from "@/components/shared/data-pagination";
import { RemoteImageFilters } from "./RemoteImageFilters";
import { RemoteImageGrid } from "./RemoteImageGrid";
import { IMG_PAGE_SIZE } from "./model";
import { useResourceLibraryContext } from "./workspace-context";

export function RemoteImagesTab() {
  const { imgTotal, imgPage, loadImages } = useResourceLibraryContext();

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <RemoteImageFilters />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <RemoteImageGrid />
      </div>
      <DataPagination
        total={imgTotal}
        page={imgPage}
        pageSize={IMG_PAGE_SIZE}
        onChange={(page) => void loadImages(page)}
        className="shrink-0 pt-4"
      />
    </div>
  );
}
