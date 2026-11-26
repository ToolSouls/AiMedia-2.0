import { Empty } from "@/components/shared/controls";
import { templateClasses } from "@/data/articleTemplates";
import { renderArticleBody,renderStickerBody } from "../article-renderer";
import { useArticleWorkspace } from "../workspace-context";
export function ArticleCanvas() {
  const {
    contentType,
    isCustom,
    effective,
    stickerTitleText,
    coverTpl,
    paperStyle,
    blocks,
    uploadImage,
    editingId,
    editValue,
    setEditValue,
    saveEdit,
    cancelEdit,
    startEdit,
    removeBlock,
    insertAfter,
    coverRenderRef,
    renderStickerCards,
    renderingCover,
    liveOverrides,
    layoutMode,
    skillLayout,
  } = useArticleWorkspace();
  const autoLayout = contentType === "article" && layoutMode === "auto";
  return (
    <div
      className={`article-paper ${contentType === "article" && !autoLayout ? templateClasses(effective, isCustom) : ""}`}
      style={autoLayout ? undefined : paperStyle}
    >
      {contentType === "sticker" ? (
        renderStickerBody(
          blocks,
          coverTpl,
          stickerTitleText || "贴图标题",
          "",
          uploadImage,
          {
            editingId,
            value: editValue,
            onChange: setEditValue,
            onSave: saveEdit,
            onCancel: cancelEdit,
            onStart: startEdit,
            onDelete: removeBlock,
            onInsertAfter: insertAfter,
          },
          coverRenderRef,
          renderStickerCards,
          renderingCover,
        )
      ) : autoLayout ? (
        blocks.length === 0 ? (
          <Empty
            description="点击上方生成按钮，或从历史作品载入内容。"
            style={{ marginTop: 60 }}
          />
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                自动排版 · {skillLayout.themeName}
              </span>
              <span>{skillLayout.themeReason}</span>
              <span>如需逐块编辑，请切换为「固定排版」。</span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: skillLayout.html }} />
          </>
        )
      ) : (
        <>
          {liveOverrides.customCSS ? (
            <style>{liveOverrides.customCSS}</style>
          ) : null}
          {blocks.length === 0 ? (
            <Empty
              description="点击上方生成按钮，或从历史作品载入内容。"
              style={{ marginTop: 60 }}
            />
          ) : (
            renderArticleBody(blocks, effective, uploadImage, {
              editingId,
              value: editValue,
              onChange: setEditValue,
              onSave: saveEdit,
              onCancel: cancelEdit,
              onStart: startEdit,
              onDelete: removeBlock,
              onInsertAfter: insertAfter,
            })
          )}
        </>
      )}
    </div>
  );
}
