import { PlatformPublishDialog } from "@/features/publish-center/PlatformPublishDialog";
import { PublishingWorkspace } from "@/features/publish-center/PublishingWorkspace";
import { PublishDetailsDialog } from "@/features/publish-center/components/PublishDetailsDialog";
import { usePublishCenter } from "@/features/publish-center/usePublishCenter";
import { PublishWorkspaceProvider } from "@/features/publish-center/workspace-context";
import type { ArticleHistoryItem } from "@/data/localStore";
export default function PublishCenter({
  active = true,
  onEditArticle,
}: {
  active?: boolean;
  onEditArticle?: (item: ArticleHistoryItem) => void;
}) {
  const state = usePublishCenter({ active, onEditArticle });
  return (
    <PublishWorkspaceProvider value={state}>
      <PublishingWorkspace />
      <PlatformPublishDialog />
      <PublishDetailsDialog />
    </PublishWorkspaceProvider>
  );
}
