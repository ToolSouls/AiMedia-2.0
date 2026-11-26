# 万稿汇 AIMedia｜公众号 AI 写作、自动排版、去 AI 味与多平台发布

**开源微信公众号 AI 写作工具：找热点、写文章、生成爆款标题、自动排版、降低 AI 痕迹，并发布到微信公众号、百家号、头条号和小红书。**

万稿汇（AIMedia）是一款开源的桌面内容创作与多平台发布工具，支持微信公众号、百家号、头条号和小红书。面向公众号运营、自媒体作者和内容团队，帮助用户把热点、爆文或自有素材变成可发布的作品，减少找选题、改稿、排版和切换账号的重复操作。

- **公众号 AI 写作**：基于近 7 天热点、微信爆文、我的素材或自定义主题，生成文章、贴图和爆款标题。
- **去 AI 味、降低 AI 痕迹**：接入器灵改文服务，长文自动分段处理；先预览改文结果，满意再采用。
- **公众号自动排版**：支持自动排版 Skill 与固定模板，按文章类型调整版式，并提供多套排版主题。
- **自动配图与封面**：可从系统图片素材或「我的图库」配图，没有正文图片时也能自动选择封面。
- **多平台发布**：统一管理微信公众号、百家号、头条号和小红书账号，支持发布、草稿、作品记录与失败反馈。
- **自动托管**：设置素材来源、写作 Skill、是否去 AI、排版方式、目标账号和运行时间，按计划完成创作与发布。
- **Skill 扩展**：内置写作与公众号排版 Skill，也支持导入自定义 Skill ZIP，并自动检查官方 Skill 更新。

[代码仓库](https://github.com/ToolSouls/AiMedia-2.0) · [下载软件](https://gitee.com/gongdnq/ten-thousand-manuscripts-hub/releases#release-latest) · [问题反馈](https://github.com/ToolSouls/AiMedia-2.0/issues) · [器灵官网](https://toolsoul.daniu7.cn/) · [ToolSouls 开源组织](https://github.com/ToolSouls)

## 支持平台：微信公众号、百家号、头条号、小红书

| 平台 | 支持内容 | 发布方式 | 说明 |
| --- | --- | --- | --- |
| 微信公众号 | 文章、贴图 | 保存到草稿箱、直接发布 | 支持同一微信下的多个公众号账号，托管时可预切换目标账号 |
| 百家号 | 文章 | 保存到草稿箱、直接发布 | 支持正文配图与封面上传 |
| 头条号 | 文章 | 保存到草稿箱、直接发布 | 支持账号登录态检测与自动托管 |
| 小红书 | 图文笔记 | 直接发布 | 至少需要 1 张图片；暂不支持保存草稿 |

常见搜索别名：微信公众号、公众号、微信公众平台、百家号、百家号文章发布、今日头条号、头条号、头条号文章发布、小红书、小红书笔记、小红书图文发布。

平台登录、发布接口和页面规则可能调整。遇到异常时，请先更新到最新版，再到「账号中心」重新登录对应账号。

## 下载

前往 **[Gitee Releases 下载页面](https://gitee.com/gongdnq/ten-thousand-manuscripts-hub/releases#release-latest)**，打开对应版本的附件列表，下载 Windows 安装包：

| 平台 | 选择的安装包 |
| --- | --- |
| Windows · 64 位 | 名称含 `win-x64-Setup` 的 `.exe` |

目前仅提供 Windows 64 位版本，暂无 Mac 版本。下载后双击安装程序，按提示完成安装。

> Windows 首次运行可能出现 SmartScreen 提示，请确认安装包来自本项目的 Gitee Releases。实际文件名和可用附件以 Releases 页面为准。

## 怎么使用

### 1. 配置 AI

打开「AI 配置」，选择一种方式：

- **推荐：器灵一键授权**。点击授权，在浏览器中登录器灵并确认，回到软件选择文本模型、保存即可。
- **使用自己的接口**。手动填写接口地址、模型名称和 API Key，测试连接后保存。支持 OpenAI 兼容的文本接口。

软件无需激活。AI 调用按所选服务商规则计费；API Key 保存在本机，请勿分享。

器灵模型支持时，「AI 配置 → 器灵服务」会显示 **思考模式** 选项。可选默认、开启或关闭，点击「保存模型与设置」生效；默认不发送思考模式参数，由系统自动决定。费用预估和实际生成使用同一设置，不支持切换的模型不显示开关。

### 2. 生成与编辑

在「资源管理」选中素材进入创作，或直接在「创作工坊」粘贴原文、输入主题。

1. 在 **「素材与生成」** 中设置字数、配图，按需启用写作 Skill、热点信息扩充和自动排版，点击「生成内容」。
2. 生成完成后进入 **「样式与编辑」**，修改正文，选择自动排版或固定排版并预览。
3. 想减少 AI 味，在编辑器点击 **「去 AI / 降低 AI 痕迹」**，确认费用后处理，预览满意再采用。此功能需授权器灵；文案超过 2000 字时会分段处理。

历史作品可搜索、翻页，随时载入继续编辑。

### 3. 发布或托管

在「账号中心」登录平台账号，再到「内容发布」选择作品和账号发布，结果可在发布记录查看。需要定时执行时，在「自动托管」新建任务，设置来源、账号与时间后启动。

## 器灵 AI，让创作更省事

不想研究接口地址和模型配置？使用 **[器灵](https://toolsoul.daniu7.cn/)**，在万稿汇中一键授权，即可使用文本模型与去 AI 味服务。

我们也持续开源 AI 工具与 Agent Skills，欢迎关注 **[ToolSouls 开源组织](https://github.com/ToolSouls)**，一起使用、反馈和改进。

## 去 AI 味、降低 AI 率与腾讯朱雀实测

万稿汇的「去 AI 味」接入与 **[toolsoul-humanize](https://github.com/ToolSouls/toolsoul-humanize.git)** 相同的器灵改文服务。欢迎拿同一篇原文，与其他改写工具直接对比。

很多人把这类需求称为“去 AI 味”“降低 AI 痕迹”“降 AI 率”或“过朱雀”。万稿汇会在改文后提供预览，用户确认后再采用；自动托管也可以按任务开启“发布前自动去 AI”。

请以检测时的原文、模型和时间点为准。不同文本的检测结果可能不同，项目不承诺所有文章都能 100% 通过腾讯朱雀或其他 AIGC 检测。

### 公开实测案例

同一篇文章，改前改后直接对比。以下为 [qiling-humanize 公开案例](https://github.com/qilingAI/qiling-humanize#腾讯朱雀实测)，两篇改文的检测结论均为 **「人工创作特征显著」**。

| 案例 | AI 特征：改前 → 改后 | 疑似 AI：改前 → 改后 | 人工特征：改前 → 改后 |
| --- | --- | --- | --- |
| 重新认识阅读 | 65.17% → **0%** | 34.83% → **0%** | 0% → **100%** |
| 青少年媒介素养 | 49.02% → **0%** | 50.98% → **20.98%** | 0% → **79.02%** |

#### 01 · 重新认识阅读

**AI 特征降至 0%，人工特征达到 100%。**

| 改写前 | 器灵改写后 |
| :---: | :---: |
| <a href="https://raw.githubusercontent.com/qilingAI/qiling-humanize/main/examples/reading/before.png"><img src="https://raw.githubusercontent.com/qilingAI/qiling-humanize/main/examples/reading/before.png" width="440" alt="重新认识阅读：改写前腾讯朱雀检测结果"></a> | <a href="https://raw.githubusercontent.com/qilingAI/qiling-humanize/main/examples/reading/after.png"><img src="https://raw.githubusercontent.com/qilingAI/qiling-humanize/main/examples/reading/after.png" width="440" alt="重新认识阅读：器灵改写后腾讯朱雀检测结果"></a> |

[阅读原文](https://github.com/qilingAI/qiling-humanize/blob/main/examples/reading/before.md) · [阅读改文](https://github.com/qilingAI/qiling-humanize/blob/main/examples/reading/after.md)

#### 02 · 青少年媒介素养

**AI 特征降至 0%，人工特征提升至 79.02%。**

| 改写前 | 器灵改写后 |
| :---: | :---: |
| <a href="https://raw.githubusercontent.com/qilingAI/qiling-humanize/main/examples/media-literacy/before.png"><img src="https://raw.githubusercontent.com/qilingAI/qiling-humanize/main/examples/media-literacy/before.png" width="440" alt="青少年媒介素养：改写前腾讯朱雀检测结果"></a> | <a href="https://raw.githubusercontent.com/qilingAI/qiling-humanize/main/examples/media-literacy/after.png"><img src="https://raw.githubusercontent.com/qilingAI/qiling-humanize/main/examples/media-literacy/after.png" width="440" alt="青少年媒介素养：器灵改写后腾讯朱雀检测结果"></a> |

[阅读原文](https://github.com/qilingAI/qiling-humanize/blob/main/examples/media-literacy/before.md) · [阅读改文](https://github.com/qilingAI/qiling-humanize/blob/main/examples/media-literacy/after.md)

<sub>截图与数据由器灵提供，截图中朱雀模型更新时间为 2026-07-21。案例效果随文本与检测工具而异。点击截图可查看大图，亦可前往 <a href="https://matrix.tencent.com/ai-detect/ai_gen">腾讯朱雀</a> 自行复测。</sub>

## 常见搜索与适用场景

如果你正在搜索以下需求，万稿汇覆盖了对应的完整流程：

- **公众号写作**：微信公众号 AI 写作工具、AI 写公众号文章、公众号爆款标题生成器、公众号选题工具、微信爆文素材。
- **排版与配图**：公众号自动排版、微信文章排版工具、Markdown 转公众号、Word 转公众号、PDF 转公众号、自动配图、自动封面。
- **改文与检测**：去 AI 味、降低 AI 痕迹、降 AI 率、过朱雀、腾讯朱雀检测、AIGC 内容改写、AI 文章口语化。
- **发布与托管**：公众号草稿箱、公众号定时发布、公众号自动托管、头条号发布、百家号发布、小红书笔记发布、多平台内容分发。
- **扩展能力**：Codex Skill、Agent Skill、写作 Skill、公众号排版 Skill、器灵 AI、万稿汇 AIMedia。

它适合需要持续更新公众号的个人创作者、管理多个平台账号的自媒体团队，以及希望把“找素材、写稿、排版、配图、发布”集中到一个桌面工具中的用户。

## 加入微信交流群

交流写作、改文与排版经验，反馈问题，获取版本消息。欢迎一起把万稿汇做得更好。

<img src="docs/wechat.png">

---

开源协议：[Apache-2.0](LICENSE)。喜欢这个项目，欢迎点个 Star。
