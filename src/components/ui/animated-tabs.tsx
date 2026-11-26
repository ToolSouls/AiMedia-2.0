"use client";

import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import * as React from "react";

type TabDirection = 1 | -1;

interface AnimatedTabsContextValue {
  value: string;
  direction: TabDirection;
  duration: number;
  reducedMotion: boolean;
}

const AnimatedTabsContext =
  React.createContext<AnimatedTabsContextValue | null>(null);

function useAnimatedTabsContext(name: string) {
  const context = React.useContext(AnimatedTabsContext);
  if (!context) {
    throw new Error(`${name} must be rendered inside <AnimatedTabs>`);
  }
  return context;
}

/** 系统「减少动态效果」偏好：命中时关闭过渡，避免眩晕。 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * 为 Radix Tabs 的子面板提供切换过渡：保留已访问面板的状态（不重复请求），
 * 切换时新面板滑入淡入、旧面板淡出，方向跟随标签顺序（左切/右切）。
 */
export function AnimatedTabs({
  value,
  order = [],
  duration = 260,
  className,
  children,
}: {
  value: string;
  /** 标签顺序，用于判断滑动方向；缺省时统一向右滑动。 */
  order?: readonly string[];
  /** 过渡时长（毫秒），与 tab-panel-enter/leave 动画保持一致。 */
  duration?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const previousRef = React.useRef(value);
  const directionRef = React.useRef<TabDirection>(1);
  if (previousRef.current !== value) {
    const from = order.indexOf(previousRef.current);
    const to = order.indexOf(value);
    directionRef.current = from >= 0 && to >= 0 && to < from ? -1 : 1;
    previousRef.current = value;
  }
  const direction = directionRef.current;

  const context = React.useMemo<AnimatedTabsContextValue>(
    () => ({
      value,
      direction,
      duration: reducedMotion ? 0 : duration,
      reducedMotion,
    }),
    [value, direction, duration, reducedMotion],
  );

  return (
    <AnimatedTabsContext.Provider value={context}>
      <div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
        {children}
      </div>
    </AnimatedTabsContext.Provider>
  );
}

export function AnimatedTabsPanel({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { value: activeValue, direction } =
    useAnimatedTabsContext("AnimatedTabsPanel");
  const active = activeValue === value;

  // 只挂载当前面板，避免隐藏的图片/素材面板持续参与重渲染
  if (!active) return null;

  return (
    <TabsContent
      value={value}
      className="flex min-h-0 flex-1 flex-col outline-none"
    >
      <div
        data-state="active"
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          // 切换不做进入动画，优先保证点击响应
        )}
        style={
          { "--tab-shift": `${direction * 14}px` } as React.CSSProperties
        }
      >
        {children}
      </div>
    </TabsContent>
  );
}
