import {
  Button,
  InputNumber,
  Radio,
  Select,
  Switch,
} from "@/components/shared/controls";
import { GearIcon } from "@radix-ui/react-icons";
import { useArticleWorkspace } from "../workspace-context";
export function CreationSettings() {
  const {
    contentType,
    stickerWords,
    setStickerWords,
    customWords,
    words,
    setCustomWords,
    setWords,
    promptSetId,
    usePromptSet,
    promptSets,
    openPromptMgr,
    layoutMode,
    setLayoutMode,
    layoutSkills,
    layoutSkillKey,
    setLayoutSkillKey,
    useWritingSkill,
    setUseWritingSkill,
    searchEnrich,
    setSearchEnrich,
    writingSkills,
    writingSkillKey,
    setWritingSkillKey,
  } = useArticleWorkspace();
  return (
    <div className="creation-settings-grid">
      <div className="creation-field">
        <label htmlFor="creation-words">内容长度</label>
        <div className="creation-field-row">
          {contentType === "sticker" ? (
            <Select
              id="creation-words"
              value={stickerWords}
              onChange={setStickerWords}
              options={[
                "200 字以内",
                "300 字以内",
                "400 字以内",
                "500 字以内",
                "800 字以内",
                "1000 字以内",
              ].map((value) => ({ value, label: value }))}
            />
          ) : (
            <>
              <Select
                id="creation-words"
                value={customWords ? "custom" : words}
                onChange={(value: string) => {
                  setCustomWords(value === "custom");
                  setWords(value === "custom" ? "800 字" : value);
                }}
                options={[
                  ...["600 字", "800 字", "1200 字"].map((value) => ({
                    value,
                    label: value,
                  })),
                  { value: "custom", label: "自定义" },
                ]}
              />
              {customWords && (
                <InputNumber
                  aria-label="自定义字数"
                  min={300}
                  max={1500}
                  step={100}
                  value={parseInt(words, 10) || 800}
                  onChange={(value) => setWords(`${value || 800} 字`)}
                  addonAfter="字"
                />
              )}
            </>
          )}
        </div>
      </div>
      <div className="creation-field">
        <label>写作增强</label>
        <div className="creation-field-row">
          <Switch checked={useWritingSkill} onChange={setUseWritingSkill} />
          <span className="text-xs text-muted-foreground">
            使用公众号写作 Skill 规则
          </span>
        </div>
        {contentType === "article" && useWritingSkill && (
          <Select
            value={writingSkillKey}
            onChange={setWritingSkillKey}
            placeholder={
              writingSkills.length ? "选择写作 Skill" : "尚未安装写作 Skill"
            }
            options={writingSkills.map((skill) => ({
              value: skill.key,
              label: `${skill.name} · v${skill.version}`,
            }))}
          />
        )}
      </div>
      {contentType === "article" && (
        <div className="creation-field">
          <label>热点联网补全</label>
          <div className="creation-field-row">
            <Switch checked={searchEnrich} onChange={setSearchEnrich} />
            <span className="text-xs text-muted-foreground">
              生成前搜索并补充事件背景、关键数据和最新进展
            </span>
          </div>
        </div>
      )}
      <div className="creation-field">
        <label>排版方式</label>
        <Radio.Group
          value={layoutMode}
          onChange={(event) =>
            setLayoutMode(event.target.value === "fixed" ? "fixed" : "auto")
          }
          options={[
            { label: "自动排版", value: "auto" },
            { label: "固定排版", value: "fixed" },
          ]}
        />
        {contentType === "article" && layoutMode === "auto" && (
          <Select
            value={layoutSkillKey}
            onChange={setLayoutSkillKey}
            placeholder={
              layoutSkills.length ? "选择排版 Skill" : "尚未安装排版 Skill"
            }
            options={layoutSkills.map((skill) => ({
              value: skill.key,
              label: `${skill.name} · v${skill.version}`,
            }))}
          />
        )}
      </div>
      <div className="creation-field">
        <label htmlFor="creation-prompt">提示词套件</label>
        <div className="creation-field-row">
          <Select
            id="creation-prompt"
            value={promptSetId}
            onChange={usePromptSet}
            options={promptSets.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
          />
          <Button
            aria-label="提示词管理"
            icon={<GearIcon />}
            onClick={openPromptMgr}
          />
        </div>
      </div>
    </div>
  );
}
