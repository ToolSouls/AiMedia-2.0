import { message } from "@/components/shared/controls";
import type {
  ImageTagItem,
  ResourceArticle,
  ResourceImageItem,
} from "@/utils/resourceApi";
import {
  fetchArticles,
  fetchCategories,
  fetchImageTags,
  fetchImages,
  saveImageToLibrary,
} from "@/utils/resourceApi";
import { useEffect, useRef, useState } from "react";
import {
  HOT_PAGE_SIZE,
  IMG_PAGE_SIZE,
  isResourceTab,
  type ResourceTab,
} from "./model";

export interface ResourceLibraryProps {
  active?: boolean;
  onGenerateArticle?: (article: {
    title: string;
    content: string;
    images?: string[];
  }) => void;
}
export function useResourceLibrary({
  active = true,
  onGenerateArticle,
}: ResourceLibraryProps) {
  const messageApi = message;
  const [tab, setTab] = useState<ResourceTab>("hot");

  const [categories, setCategories] = useState<string[]>([]);
  const [baseError, setBaseError] = useState("");

  const [hotList, setHotList] = useState<ResourceArticle[]>([]);
  const [hotTotal, setHotTotal] = useState(0);
  const [hotPage, setHotPage] = useState(1);
  const [hotCategory, setHotCategory] = useState("");
  const [hotLoading, setHotLoading] = useState(false);
  const hotCache = useRef(new Map<string, { list: ResourceArticle[]; total: number; at: number }>());

  const [imgList, setImgList] = useState<ResourceImageItem[]>([]);
  const [imgTotal, setImgTotal] = useState(0);
  const [imgPage, setImgPage] = useState(1);
  const [imgTag, setImgTag] = useState("");
  const [imgQ, setImgQ] = useState("");
  const [imgLoading, setImgLoading] = useState(false);
  const [imageTags, setImageTags] = useState<ImageTagItem[]>([]);
  const imageTagsLoaded = useRef(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [libRefreshKey, setLibRefreshKey] = useState(0);
  const [matRefreshKey, setMatRefreshKey] = useState(0);

  const requests = useRef({ hot: 0, images: 0 });
  const loadCategories = async () => {
    try {
      const r = await fetchCategories();
      setCategories(
        (r.data || [])
          .map((c) => c.category)
          .filter((c) => c && c !== "待分类"),
      );
    } catch {
      setBaseError("无法连接资源库服务，请到设置页检查「资源库服务地址」");
    }
  };

  const loadHot = async (page = 1, category = hotCategory) => {
    const cacheKey = `${category || ""}|${page}`;
    const cached = hotCache.current.get(cacheKey);
    if (cached && Date.now() - cached.at < 5 * 60 * 1000) {
      setHotList(cached.list);
      setHotTotal(cached.total);
      setHotPage(page);
      return;
    }
    const request = ++requests.current.hot;
    setHotLoading(true);
    setBaseError("");
    try {
      const weekStart = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const r = await fetchArticles({
        source_type: "newsnow",
        classified: true,
        after: weekStart,
        category: category || undefined,
        page,
        page_size: HOT_PAGE_SIZE,
      });
      if (request !== requests.current.hot) return;
      setHotList(r.data || []);
      setHotTotal(r.meta?.total || 0);
      setHotPage(page);
      hotCache.current.set(cacheKey, {
        list: r.data || [],
        total: r.meta?.total || 0,
        at: Date.now(),
      });
    } catch {
      if (request !== requests.current.hot) return;
      setBaseError("今日热点加载失败，请检查资源库服务地址");
    } finally {
      if (request === requests.current.hot) setHotLoading(false);
    }
  };

  const loadImages = async (page = 1, tag = imgTag, query = imgQ) => {
    const request = ++requests.current.images;
    setImgLoading(true);
    setBaseError("");
    try {
      const r = await fetchImages({
        ai_tagged: true,
        tag: tag || undefined,
        q: query || undefined,
        page,
        page_size: IMG_PAGE_SIZE,
      });
      if (request !== requests.current.images) return;
      setImgList(r.data || []);
      setImgTotal(r.meta?.total || 0);
      setImgPage(page);
      if (!imageTagsLoaded.current) {
        const tags = await fetchImageTags(true);
        if (request !== requests.current.images) return;
        setImageTags(tags.data || []);
        imageTagsLoaded.current = true;
      }
    } catch {
      if (request !== requests.current.images) return;
      setBaseError("图片素材加载失败，请检查资源库服务地址");
    } finally {
      if (request === requests.current.images) setImgLoading(false);
    }
  };

  useEffect(() => {
    if (!active) return;
    void loadCategories();
    if (tab === "hot") void loadHot(hotPage, hotCategory);
    else if (tab === "images") void loadImages(imgPage);
    else if (tab === "library") setLibRefreshKey((v) => v + 1);
  }, [active]);

  const selectTab = (value: string) => {
    if (!isResourceTab(value) || value === tab) return;
    setTab(value);
    if (value === "hot") {
      // 已加载过则直接复用，避免每次切 Tab 重复请求
      if (!hotList.length) void loadHot(hotPage, hotCategory);
    } else if (value === "images") {
      if (!imgList.length) void loadImages(imgPage);
    }
    else if (value === "library") setLibRefreshKey((v) => v + 1);
  };

  const saveImage = async (img: ResourceImageItem) => {
    setSavingId(img.id);
    try {
      const r = await saveImageToLibrary(img);
      if (r.ok) {
        messageApi.success(r.duplicate ? "该图片已在图片库中" : "已存入图片库");
        setLibRefreshKey((k) => k + 1);
      } else {
        messageApi.error(r.error || "保存失败");
      }
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "保存图片失败");
    } finally {
      setSavingId(null);
    }
  };

  const refresh = () => {
    if (tab === "hot") {
      hotCache.current.clear();
      void loadHot(hotPage, hotCategory);
    }
    else if (tab === "images") void loadImages(imgPage);
    else if (tab === "library") setLibRefreshKey((k) => k + 1);
    else setMatRefreshKey((k) => k + 1);
  };

  const handleGenerate = (a: ResourceArticle) => {
    if (!onGenerateArticle) {
      messageApi.info("一键生成暂不可用");
      return;
    }
    onGenerateArticle({
      title: a.title,
      content: a.content_text || a.summary || "",
      images: a.images || [],
    });
  };

  return {
    baseError,
    tab,
    selectTab,
    loadHot,
    loadImages,
    setLibRefreshKey,
    matRefreshKey,
    refresh,
    categories,
    hotTotal,
    hotCategory,
    setHotCategory,
    hotLoading,
    hotList,
    handleGenerate,
    hotPage,
    imgTag,
    imageTags,
    setImgTag,
    imgQ,
    setImgQ,
    imgTotal,
    imgLoading,
    imgList,
    savingId,
    saveImage,
    imgPage,
    libRefreshKey,
  };
}
