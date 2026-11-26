import { Drawer } from "@/components/shared/controls";
import { beijingDateTime, localizeTaskLog } from "./model";
import { useTaskCenter } from "./useTaskCenter";
type Props = Pick<ReturnType<typeof useTaskCenter>, "logTask" | "setLogTask">;
export function TaskLogs({ logTask, setLogTask }: Props) {
  return (
    <Drawer
      title={`执行日志 · ${logTask?.name || ""}`}
      open={!!logTask}
      onClose={() => setLogTask(null)}
      width={560}
      bodyStyle={{ padding: "10px 16px" }}
    >
      {logTask && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 92px)",
          }}
        >
          <div className="log-console" style={{ flex: 1, minHeight: 0 }}>
            {(logTask.log.length ? logTask.log : ["暂无日志"]).map((l, i) => (
              <div
                key={i}
                className={
                  l.includes("失败")
                    ? "warn"
                    : l.includes("完成")
                      ? "ok"
                      : undefined
                }
              >
                {localizeTaskLog(l)}
              </div>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 12, fontSize: 12 }}>
            下次运行：
            {beijingDateTime(logTask.nextRunAt)}
            {logTask.lastRunAt
              ? ` · 上次运行：${beijingDateTime(logTask.lastRunAt)}`
              : ""}
          </div>
        </div>
      )}
    </Drawer>
  );
}
