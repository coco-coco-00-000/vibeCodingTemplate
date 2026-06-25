# Codex 培训第三课作业：AI Native 英语学习 Demo

## 作业信息

- 项目名称：AI Native English Quest
- 当前 MVP 主题：Weekend Invitation / 周末邀约
- 项目代码：https://github.com/liuqing0224/vibeCodingTemplate
- 本地演示入口：`/english-quest`
- 使用方法：`cd frontend && npm install && npm run dev`

## 原始需求

我要做一个 AI native 英语学习产品。这个产品主要面向中国初中年龄段学生，目标不是做传统背单词或刷题 App，而是把英语学习教学法、游戏化动机和真实语言应用结合起来。

核心问题：

- 让学生能高效利用碎片化时间学习英语。
- 让语言知识学习和真实场景使用形成闭环。
- 让产品比传统英语学习 App 更 AI native，例如后续可以接入自适应推题、语音评估和个性化学习路径。
- 先用一个可演示前端原型表达产品方向，复杂自适应算法后续交给工程师实现。

第一版聚焦“周末邀约”场景。学生先在“语言训练场”学习和练习必要语言，再进入“场景任务”，在接近真实微信聊天的界面中给朋友发出邀请，并根据对方接受或拒绝做出回复。

## MVP 版本

MVP 采用“首页任务大厅 + 语言训练场 + 趣味练习 + 场景任务”的结构。

### 首页任务大厅

- 提供两个主入口：语言训练场、场景任务。
- 场景任务可以直接进入，但会提示建议先完成训练。
- UI 采用塞尔达 / 希卡风格的暗色幻想界面，突出任务感和游戏感。

### 语言训练场

语言训练场分为两个部分：

- 语言学习：主线学习流程。
- 趣味练习：用于提高掌握度和训练量。

主线学习内容包括：

- 5 个活动词块：`go swimming`、`play basketball`、`watch a movie`、`go shopping`、`play video games`。
- 邀请句型：`Do you want to + activity + time?`
- 时间表达：`this Saturday`、`this Sunday`、`tomorrow`。
- 对方回应：`Sounds good.`、`Sorry, I can't.`
- 收尾表达：`Great! See you then.`、`No problem.`

趣味练习包括：

- 语块消消乐：匹配英文、中文和图示。
- 句子俄罗斯方块：把活动和时间词块填入句型槽，训练句型生成。

### 场景任务

场景任务采用微信式聊天界面。学生选择不同塞尔达世界观角色作为聊天对象，完成不同邀约：

| 对象 | 邀约活动 | 时间 | 对方回应 | 学生回复 |
| --- | --- | --- | --- | --- |
| 公主 | go swimming | this Saturday | Sounds good. | Great! See you then. |
| 普尔亚 | play video games | this Sunday | Sorry, I can't. | No problem. |
| 丘栗 | watch a movie | tomorrow | Sounds good. | Great! See you then. |

当前版本用浏览器语音识别或模拟识别完成演示。设计原则是“不打断真实使用感”，即学生说得不完美时给温和提示，不做强失败判定。

## 验收标准

普通标准验收：

- 能通过 `/english-quest` 进入 demo。
- 首页同时提供语言训练场和场景任务入口。
- 语言训练场能展示周末邀约所需语言的主线学习流程。
- 趣味练习中包含语块消消乐和句子俄罗斯方块两个练习入口。
- 场景任务能选择至少 3 位聊天对象。
- 每个场景任务能完成“发出邀请 -> 看懂回应 -> 继续回复”的闭环。
- 麦克风或语音识别不可用时，仍可用模拟识别完成演示。
- 任务完成后能获得徽章，完成全部任务后解锁奖励卡。
- 项目代码能在本地运行，并通过基础验证命令。

优秀标准验收：

- 项目来自真实业务需求，而不是临时作业题。
- Demo 能真实用于产品讨论、教学法验证和工程沟通。
- 语言学习流程不是随意题目堆叠，而是按照“语言输入 -> 识别理解 -> 结构观察 -> 控制性产出 -> 半开放迁移 -> 场景应用”的教学路径设计。
- 场景任务接近真实微信使用，而不是传统答题页面。
- 已经为后续自适应推题、语音评估、学习路径推荐预留数据结构和替换边界。

## 沉淀项目 Skills

本项目沉淀了一个项目 Skill：

- `.agents/skills/ai-english-learning-demo/SKILL.md`

该 Skill 用于后续继续开发 AI 英语学习 demo 时复用，覆盖：

- 如何把真实学习产品想法拆成 MVP。
- 如何把语言知识训练和真实场景任务拆开设计。
- 如何设计“训练场 -> 场景应用”的学习闭环。
- 如何沉淀验收标准，避免 demo 只停留在静态页面。
- 如何把复杂 AI 能力先降级成可演示前端规则，再交给工程师替换。

## Codex + Superpowers 使用过程

本项目使用 Codex 和 Superpowers 完成了从需求梳理到开发实现的完整流程：

- 使用 brainstorming 梳理产品方向、目标用户、MVP 边界和页面结构。
- 使用 writing-plans 将设计稿拆成可执行开发计划。
- 使用 executing-plans 按 Task 逐步实现模块。
- 使用 test-driven-development 为场景语音判断逻辑先写测试，再实现。
- 使用 verification-before-completion 在提交前运行类型检查、lint、测试和构建。
- 使用项目 Skill 将这次流程沉淀为可复用方法。

相关沉淀文档：

- `docs/superpowers/specs/2026-06-16-ai-native-english-quest-design.zh.md`
- `docs/superpowers/plans/2026-06-17-ai-native-english-quest-implementation-plan.md`
- `docs/superpowers/specs/2026-06-22-wechat-scenario-task-design.md`
- `docs/superpowers/plans/2026-06-22-wechat-scenario-task.md`

## 当前边界和后续方向

当前版本是前端演示原型，不包含：

- 真实后端持久化。
- 真实用户账号。
- 生产级语音评分。
- 真实自适应推荐算法。
- 教师后台。

后续可以继续扩展：

- 接入工程团队实现的自适应推题规则。
- 接入更稳定的语音识别和口语反馈。
- 增加电话邀约任务。
- 增加购物、看病、学校生活等更多真实场景。
- 增加教师端学习数据看板。
