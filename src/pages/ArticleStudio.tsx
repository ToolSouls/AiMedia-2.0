import { AppearanceDrawer } from "@/features/article-studio/AppearanceDrawer";
import { ArticlePreviewDialog } from "@/features/article-studio/ArticlePreviewDialog";
import { CoverDialog } from "@/features/article-studio/CoverDialog";
import { CreationWorkflow } from "@/features/article-studio/creation/CreationWorkflow";
import { GenerationResultDialog } from "@/features/article-studio/GenerationResultDialog";
import { ImagePicker } from "@/features/article-studio/ImagePicker";
import { ImagePreviewDialog } from "@/features/article-studio/ImagePreviewDialog";
import { PromptSettingsDialog } from "@/features/article-studio/PromptSettingsDialog";
import { PublishDialog } from "@/features/article-studio/PublishDialog";
import { StickerPreviewDialog } from "@/features/article-studio/StickerPreviewDialog";
import { TemplatePreviewDialog } from "@/features/article-studio/TemplatePreviewDialog";
import { useArticleStudio } from "@/features/article-studio/useArticleStudio";
import { ArticleWorkspaceProvider } from "@/features/article-studio/workspace-context";
import type { ArticleHistoryItem } from "@/data/localStore";
export default function ArticleStudio({
  active = true,
  pendingArticle,
  onConsumePending,
  pendingEditArticle,
  onConsumePendingEdit,
}: {
  active?: boolean;
  pendingArticle?: { title: string; content: string; images?: string[] } | null;
  onConsumePending?: () => void;
  pendingEditArticle?: ArticleHistoryItem | null;
  onConsumePendingEdit?: () => void;
} = {}) {
  const workspace = useArticleStudio({
    active,
    pendingArticle,
    onConsumePending,
    pendingEditArticle,
    onConsumePendingEdit,
  });
  const { contextHolder } = workspace;
  return (
    <ArticleWorkspaceProvider value={workspace}>
      <div>
        {contextHolder}
        <CreationWorkflow
          incomingArticle={pendingArticle}
          incomingHistory={pendingEditArticle}
        />

        <ArticlePreviewDialog />

        <StickerPreviewDialog />

        <TemplatePreviewDialog />

        <AppearanceDrawer />

        <ImagePicker />

        <GenerationResultDialog />

        <PromptSettingsDialog />

        <PublishDialog />

        <CoverDialog />

        {/* 内容卡隐藏渲染节点：生成/自动排版时逐张转 PNG */}
        <ImagePreviewDialog />
      </div>
    </ArticleWorkspaceProvider>
  );
}
