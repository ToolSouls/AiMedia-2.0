import { Button, Card, Tag } from "@/components/shared/controls";
import { ArticleTemplateGallery } from "./creation/ArticleTemplateGallery";
import { StickerTemplateGallery } from "./creation/StickerTemplateGallery";
import { useArticleWorkspace } from "./workspace-context";
export function TemplatePanel() {
  const { contentType, layoutMode, skillLayout, setLayoutMode } =
    useArticleWorkspace();
  if (contentType === "article" && layoutMode === "auto") {
    return (
      <section className="creation-template-panel">
        <Card title="自动排版 · 写作 Skill">
          <div className="flex flex-col gap-3 p-1 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Tag color="green">{skillLayout.themeName}</Tag>
              <span className="text-xs text-muted-foreground">
                {skillLayout.themeReason}
              </span>
            </div>
            <p className="m-0 text-xs leading-relaxed text-muted-foreground">
              系统已根据文章结构自动选择主题、章节组件、关键词标记和结尾互动区。自动排版模式下正文通过左侧自动预览查看。
            </p>
            <Button size="small" onClick={() => setLayoutMode("fixed")}>
              改用固定排版
            </Button>
          </div>
        </Card>
      </section>
    );
  }
  return (
    <section className="creation-template-panel">
      {contentType === "article" ? (
        <ArticleTemplateGallery />
      ) : (
        <StickerTemplateGallery />
      )}
    </section>
  );
}
