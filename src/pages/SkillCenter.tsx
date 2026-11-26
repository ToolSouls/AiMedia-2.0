import {
  Alert,
  Button,
  Card,
  Modal,
  Space,
  message,
} from "@/components/shared/controls";
import { Badge } from "@/components/ui/badge";
import {
  FileTextIcon,
  LayersIcon,
  ReloadIcon,
  TrashIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import { FolderOpenOutlined } from "@/components/shared/icons";
import { useEffect, useMemo, useState } from "react";

const TYPE_LABEL = {
  writing: "写作 Skill",
  layout: "排版 Skill",
} as const;

function timeText(value?: number | string) {
  if (!value) return "尚未检查";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

export default function SkillCenter({ active }: { active: boolean }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [skills, setSkills] = useState<InstalledSkill[]>([]);
  const [lastCheckedAt, setLastCheckedAt] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    if (!window.wangaohui?.skillsList) {
      setError("请在桌面应用中使用 Skill 管理");
      return;
    }
    setLoading(true);
    try {
      const result = await window.wangaohui.skillsList();
      setSkills(result.skills || []);
      setLastCheckedAt(result.lastCheckedAt);
      setError(result.error || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (active) void refresh();
  }, [active]);

  const checkUpdates = async () => {
    if (!window.wangaohui?.skillsCheck) return;
    setChecking(true);
    setError("");
    try {
      const result = await window.wangaohui.skillsCheck();
      setSkills(result.skills || []);
      setLastCheckedAt(Date.now());
      const failed = (result.results || []).filter(
        (row) => typeof row === "object" && row && "ok" in row && !row.ok,
      );
      if (failed.length) {
        messageApi.warning("部分官方 Skill 下载失败，请检查网络后重试");
      } else {
        messageApi.success("官方 Skill 已检查并更新");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "检查更新失败");
    } finally {
      setChecking(false);
    }
  };

  const importSkill = async () => {
    const action = window.wangaohui?.skillsImportZip;
    if (!action) return;
    try {
      const result = await action();
      if (result.canceled) return;
      if (!result.ok) throw new Error(result.error || "导入失败");
      messageApi.success(`已导入 Skill：${result.skill?.name || ""}`);
      await refresh();
    } catch (err) {
      messageApi.error(err instanceof Error ? err.message : "导入失败");
    }
  };

  const removeSkill = (skill: InstalledSkill) => {
    Modal.confirm({
      title: "删除自定义 Skill？",
      content: `将删除「${skill.name}」的本机文件，删除后需要重新导入。`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        const result = await window.wangaohui?.skillsRemove({ key: skill.key });
        if (!result?.ok) throw new Error(result?.error || "删除失败");
        messageApi.success("Skill 已删除");
        await refresh();
      },
    });
  };

  const groups = useMemo(
    () => ({
      writing: skills.filter((skill) => skill.type === "writing"),
      layout: skills.filter((skill) => skill.type === "layout"),
    }),
    [skills],
  );

  const renderSkill = (skill: InstalledSkill) => (
    <article
      key={skill.key}
      className="flex flex-wrap items-start gap-4 rounded-xl border border-border/70 bg-white p-4"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
        {skill.type === "layout" ? <LayersIcon /> : <FileTextIcon />}
      </span>
      <div className="min-w-[220px] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-sm">{skill.name}</strong>
          <Badge variant="secondary">v{skill.version}</Badge>
          <Badge variant={skill.scope === "official" ? "default" : "outline"}>
            {skill.scope === "official" ? "官方在线" : "自定义"}
          </Badge>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {skill.description || TYPE_LABEL[skill.type]}
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          安装时间：{timeText(skill.installedAt)}
        </p>
      </div>
      {skill.scope === "custom" && (
        <Button
          size="small"
          danger
          icon={<TrashIcon />}
          onClick={() => removeSkill(skill)}
        >
          删除
        </Button>
      )}
    </article>
  );

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {contextHolder}
      {error && <Alert type="error" showIcon message={error} />}
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <div className="mr-auto min-w-0">
            <strong className="text-[15px]">官方 Skill 自动更新</strong>
            <p className="mt-1 text-xs text-muted-foreground">
              首次启动自动从 Gitee 下载；之后每 12 小时检查一次。最后检查：
              {timeText(lastCheckedAt)}
            </p>
          </div>
          <Button
            icon={<ReloadIcon className={checking ? "animate-spin" : ""} />}
            loading={checking}
            onClick={() => void checkUpdates()}
          >
            检查更新
          </Button>
          <Button
            icon={<FolderOpenOutlined />}
            onClick={() => void window.wangaohui?.skillsOpenDir()}
          >
            打开 Skill 目录
          </Button>
        </div>
      </Card>

      <Card
        title="写作 Skill"
        extra={
          <Button
            size="small"
            icon={<UploadIcon />}
            onClick={() => void importSkill()}
          >
            导入 ZIP
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          {groups.writing.length ? (
            groups.writing.map(renderSkill)
          ) : (
            <Alert
              type="info"
              showIcon
              message="写作 Skill 尚未安装，可点击「检查更新」从 Gitee 下载。"
            />
          )}
        </div>
      </Card>

      <Card
        title="排版 Skill"
        extra={
          <Space>
            <Button
              size="small"
              icon={<UploadIcon />}
              onClick={() => void importSkill()}
            >
              导入 ZIP
            </Button>
          </Space>
        }
      >
        <div className="flex flex-col gap-3">
          {groups.layout.length ? (
            groups.layout.map(renderSkill)
          ) : (
            <Alert
              type="info"
              showIcon
              message="排版 Skill 尚未安装，自动排版暂不可用。"
            />
          )}
        </div>
      </Card>

      {loading && (
        <p className="text-xs text-muted-foreground">正在读取本地 Skill…</p>
      )}
    </div>
  );
}
