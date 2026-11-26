import { useEffect, useState } from "react";
import AppShell, { PageKey } from "./layout/AppShell";
import AccountCenter from "./pages/AccountCenter";
import ArticleStudio from "./pages/ArticleStudio";
import HelpPage from "./pages/HelpPage";
import AiConfig from "./pages/AiConfig";
import type { ArticleHistoryItem } from "./data/localStore";
import PublishCenter from "./pages/PublishCenter";
import ResourceLibrary from "./pages/ResourceLibrary";
import SkillCenter from "./pages/SkillCenter";
import TaskCenter from "./pages/TaskCenter";
import { migrateLocalImages } from "./utils/imageStore";

export default function App() {
  const [page, setPage] = useState<PageKey>("resource");
  const [pendingArticle, setPendingArticle] = useState<{
    title: string;
    content: string;
    images?: string[];
  } | null>(null);
  const [pendingEditArticle, setPendingEditArticle] =
    useState<ArticleHistoryItem | null>(null);

  // 启动后把旧 base64 图片后台迁移到磁盘（一次性）
  useEffect(() => {
    void migrateLocalImages();
  }, []);

  return (
    <AppShell page={page} onNavigate={setPage}>
      <div style={{ display: page === "resource" ? undefined : "none" }}>
        <ResourceLibrary
          active={page === "resource"}
          onGenerateArticle={(a) => {
            setPendingEditArticle(null);
            setPendingArticle(a);
            setPage("article");
          }}
        />
      </div>
      <div style={{ display: page === "accounts" ? undefined : "none" }}>
        <AccountCenter active={page === "accounts"} />
      </div>
      <div style={{ display: page === "article" ? undefined : "none" }}>
        <ArticleStudio
          active={page === "article"}
          pendingArticle={pendingArticle}
          onConsumePending={() => setPendingArticle(null)}
          pendingEditArticle={pendingEditArticle}
          onConsumePendingEdit={() => setPendingEditArticle(null)}
        />
      </div>
      <div style={{ display: page === "publish" ? undefined : "none" }}>
        <PublishCenter
          active={page === "publish"}
          onEditArticle={(work) => {
            setPendingArticle(null);
            setPendingEditArticle(work);
            setPage("article");
          }}
        />
      </div>
      <div style={{ display: page === "task" ? undefined : "none" }}>
        <TaskCenter active={page === "task"} />
      </div>
      <div style={{ display: page === "ai" ? undefined : "none" }}>
        <AiConfig active={page === "ai"} />
      </div>
      <div style={{ display: page === "skills" ? undefined : "none" }}>
        <SkillCenter active={page === "skills"} />
      </div>
      <div style={{ display: page === "help" ? undefined : "none" }}>
        <HelpPage onNavigate={setPage} />
      </div>
    </AppShell>
  );
}
