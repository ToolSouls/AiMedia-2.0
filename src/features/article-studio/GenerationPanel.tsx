import { Input, message, Segmented } from "@/components/shared/controls";
import { FolderOpenOutlined } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreationImages } from "./creation/CreationImages";
import { CreationSettings } from "./creation/CreationSettings";
import { GenerationProgress } from "./creation/GenerationProgress";
import {
  MaterialSourceDialog,
  type SelectedMaterialSource,
} from "./creation/MaterialSourceDialog";
import { useArticleWorkspace } from "./workspace-context";
export function GenerationPanel() {
  const { topic, setTopic, contentType, setContentType, generating } =
    useArticleWorkspace();
  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceName, setSourceName] = useState("");

  const useMaterial = (item: SelectedMaterialSource) => {
    const content = item.content.trim();
    setTopic(`${item.title.trim()}${content ? `\n\n${content}` : ""}`);
    setSourceName(item.groupName || (item.source === "hot" ? "近 7 天素材" : item.title));
    message.success("素材已带入，可以继续修改后生成");
  };

  return (
    <div className="creation-prepare-layout">
      <section className="creation-topic-panel">
        <div className="creation-section-heading">
          <h2>主题 / 素材</h2>
          <fieldset
            disabled={generating}
            className="m-0 flex min-w-0 flex-wrap items-center gap-2 border-0 p-0"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={generating}
              onClick={() => setSourceOpen(true)}
            >
              <FolderOpenOutlined />
              选择素材
            </Button>
            <Segmented
              value={contentType}
              onChange={(value) =>
                setContentType(value as "article" | "sticker")
              }
              options={[
                { label: "文章", value: "article" },
                { label: "贴图", value: "sticker" },
              ]}
            />
          </fieldset>
        </div>
        {sourceName && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
              已选择素材
            </span>
            <span className="min-w-0 truncate">{sourceName}</span>
          </div>
        )}
        <Input.TextArea
          id="creation-topic"
          aria-label="主题或素材"
          value={topic}
          disabled={generating}
          onChange={(event) => setTopic(event.target.value)}
          placeholder={
            contentType === "sticker"
              ? "输入贴图主题或素材描述"
              : "输入文章主题或素材描述，可直接粘贴整篇素材文档"
          }
        />
        <p className="m-0 text-xs leading-relaxed text-muted-foreground">
          可以直接输入，也可以从「近 7 天素材」或「我的素材」选择一条带入。
        </p>
      </section>
      <aside className="creation-config-panel">
        <fieldset
          disabled={generating}
          aria-label="生成配置"
          className="m-0 min-w-0 border-0 p-0"
        >
          <section className="creation-config-section">
            <h3>生成设置</h3>
            <CreationSettings />
          </section>
          <CreationImages />
        </fieldset>
        <section className="creation-config-section creation-progress-section">
          <h3>生成进度</h3>
          <GenerationProgress />
        </section>
      </aside>
      <MaterialSourceDialog
        open={sourceOpen}
        onOpenChange={setSourceOpen}
        onSelect={useMaterial}
      />
    </div>
  );
}
