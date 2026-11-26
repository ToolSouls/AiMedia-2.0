import { Lightbox,type LightboxItem } from "@/components/ui/lightbox";
import { cn } from "@/lib/utils";
import * as React from "react";

interface PreviewGroupValue {
  register: (item: LightboxItem) => () => void;
  open: (id: string) => void;
}

const PreviewGroupContext = React.createContext<PreviewGroupValue | null>(null);

/** 图片预览分组：组内图片可在同一个灯箱里左右切换。 */
export function MediaImageGroup({ children }: { children: React.ReactNode }) {
  const itemsRef = React.useRef(new Map<string, LightboxItem>());
  const [images, setImages] = React.useState<LightboxItem[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const register = React.useCallback((item: LightboxItem) => {
    itemsRef.current.set(item.id, item);
    return () => {
      itemsRef.current.delete(item.id);
    };
  }, []);
  const open = React.useCallback((id: string) => {
    // 打开预览时才一次性生成图片列表，避免每张图注册都触发重渲染
    setImages(Array.from(itemsRef.current.values()));
    setActiveId(id);
  }, []);
  const value = React.useMemo(
    () => ({ register, open }),
    [register, open],
  );
  return (
    <PreviewGroupContext.Provider value={value}>
      {children}
      <Lightbox
        items={images}
        activeId={activeId}
        onChange={setActiveId}
        onClose={() => setActiveId(null)}
      />
    </PreviewGroupContext.Provider>
  );
}

/** 带点击预览（可选分组）的图片，加载失败时回退到占位图。 */
export function MediaImage({
  src,
  previewSrc,
  alt = "",
  fallback,
  preview = true,
  className,
  loading = "lazy",
  referrerPolicy,
}: {
  src: string;
  /** 预览时使用的大图；缺省使用 src（缩略图场景可单独指定）。 */
  previewSrc?: string;
  alt?: string;
  fallback?: string;
  preview?: boolean;
  className?: string;
  loading?: "lazy" | "eager";
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}) {
  const group = React.useContext(PreviewGroupContext);
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const shownSrc = failed && fallback ? fallback : src;
  const target = previewSrc ?? src;

  React.useEffect(() => {
    if (group && preview) {
      return group.register({
        id,
        src: target,
        thumb: target === src ? undefined : src,
        alt,
        fallback,
        referrerPolicy,
      });
    }
    return undefined;
  }, [group, id, target, src, alt, fallback, preview, referrerPolicy]);

  const activate = () => {
    if (!preview) return;
    if (group) group.open(id);
    else setOpen(true);
  };

  return (
    <>
      <img
        src={shownSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        referrerPolicy={referrerPolicy}
        role={preview ? "button" : undefined}
        tabIndex={preview ? 0 : undefined}
        aria-label={preview ? `预览${alt || "图片"}` : alt || undefined}
        onError={() => {
          if (fallback) setFailed(true);
        }}
        onKeyDown={(event) => {
          if (preview && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            activate();
          }
        }}
        onClick={activate}
        className={cn(preview && "cursor-zoom-in", className)}
      />
      {preview && !group && (
        <Lightbox
          items={[
            {
              id,
              src: failed && fallback ? fallback : target,
              alt,
              fallback,
              referrerPolicy,
            },
          ]}
          activeId={open ? id : null}
          onChange={() => undefined}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
