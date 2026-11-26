import { ImageIcon } from "@radix-ui/react-icons";
import type { CSSProperties } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { MediaImageGroup } from "@/components/shared/media-image";
import { Skeleton } from "@/components/ui/skeleton";
import { RemoteImageCard } from "./RemoteImageCard";
import { useResourceLibraryContext } from "./workspace-context";
import { IMG_COLUMNS, IMG_PAGE_SIZE } from "./model";

export function RemoteImageGrid() {
  const { imgLoading, imgList, savingId, saveImage } =
    useResourceLibraryContext();
  const gridStyle = {
    gridTemplateColumns: `repeat(${IMG_COLUMNS}, minmax(0, 1fr))`,
  } as CSSProperties;

  if (imgLoading) {
    return (
      <div
        className="grid gap-3"
        style={gridStyle}
        aria-busy="true"
        role="status"
        aria-label="加载中"
      >
        {Array.from({ length: IMG_PAGE_SIZE }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/3] rounded-lg" />
        ))}
      </div>
    );
  }

  if (!imgList.length) {
    return (
      <EmptyState
        icon={<ImageIcon />}
        title="暂无已打标签的图片"
        description="图片素材会按 AI 标签展示，稍后刷新再试。"
      />
    );
  }

  return (
    <MediaImageGroup>
      <div className="grid gap-3" style={gridStyle}>
        {imgList.map((image) => (
          <RemoteImageCard
            key={image.id}
            image={image}
            saving={savingId === image.id}
            onSave={(item) => void saveImage(item)}
          />
        ))}
      </div>
    </MediaImageGroup>
  );
}
