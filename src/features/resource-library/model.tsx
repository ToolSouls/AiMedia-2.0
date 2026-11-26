import {
  FileTextOutlined,
  FireOutlined,
  FolderOpenOutlined,
  PictureOutlined,
} from "@/components/shared/icons";
import type { ComponentType, SVGProps } from "react";

export type ResourceTab = "hot" | "materials" | "images" | "library";

export interface ResourceTabMeta {
  value: ResourceTab;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/** 标签的唯一数据源：标签栏与面板顺序都取自这里。 */
export const RESOURCE_TABS: ResourceTabMeta[] = [
  { value: "hot", label: "近7天热点", Icon: FireOutlined },
  { value: "materials", label: "我的素材", Icon: FileTextOutlined },
  { value: "images", label: "图片素材", Icon: PictureOutlined },
  { value: "library", label: "我的图库", Icon: FolderOpenOutlined },
];

export const RESOURCE_TAB_ORDER = RESOURCE_TABS.map((item) => item.value);

export function isResourceTab(value: string): value is ResourceTab {
  return RESOURCE_TAB_ORDER.includes(value as ResourceTab);
}
export const PAGE_SIZE = 10;

export const HOT_PAGE_SIZE = 10;

export const IMG_COLUMNS = 8;
export const IMG_PAGE_SIZE = IMG_COLUMNS * 4;

export const FALLBACK_IMG =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="100%" height="100%" fill="#f0f2f7"/></svg>',
  );

export function timeText(s?: string): string {
  if (!s) return "";
  return s.replace("T", " ").replace("Z", "").slice(0, 16);
}

export function thumbUrl(url: string): string {
  const bang = url.indexOf("!");
  return bang > 0 ? `${url.slice(0, bang)}!p1` : url;
}
