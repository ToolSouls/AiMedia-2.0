import LibraryPanel from "@/components/LibraryPanel";
import MaterialLibraryPanel from "@/components/MaterialLibraryPanel";
import { AnimatedTabs,AnimatedTabsPanel } from "@/components/ui/animated-tabs";
import { Card,CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { ArticleFeedTab } from "./ArticleFeedTab";
import { RESOURCE_TAB_ORDER } from "./model";
import { RemoteImagesTab } from "./RemoteImagesTab";
import { ResourceErrorBanner } from "./ResourceErrorBanner";
import { ResourceTabBar } from "./ResourceTabBar";
import { useResourceLibraryContext } from "./workspace-context";

export function ResourceWorkspace() {
  const { tab, selectTab, libRefreshKey, matRefreshKey } =
    useResourceLibraryContext();
  return (
    <div className="flex h-[calc(100vh-120px)] min-h-0 min-w-0 flex-col gap-4">
      <ResourceErrorBanner />
      <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden rounded-2xl py-0 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <Tabs
          value={tab}
          onValueChange={(value) => selectTab(value)}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="shrink-0 px-4 pt-4 pb-2">
            <ResourceTabBar />
          </div>
          <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pt-1 pb-4">
            <AnimatedTabs value={tab} order={RESOURCE_TAB_ORDER}>
              <AnimatedTabsPanel value="hot">
                <ArticleFeedTab />
              </AnimatedTabsPanel>
              <AnimatedTabsPanel value="materials">
                <MaterialLibraryPanel key={matRefreshKey} />
              </AnimatedTabsPanel>
              <AnimatedTabsPanel value="images">
                <RemoteImagesTab />
              </AnimatedTabsPanel>
              <AnimatedTabsPanel value="library">
                <LibraryPanel refreshKey={libRefreshKey} />
              </AnimatedTabsPanel>
            </AnimatedTabs>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
