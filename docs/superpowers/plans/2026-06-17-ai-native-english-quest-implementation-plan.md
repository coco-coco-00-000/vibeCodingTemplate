# AI Native English Quest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable Vue frontend prototype for the AI Native English weekend invitation quest.

**Architecture:** Create a new closed-loop frontend module named `english-quest`. Keep all product data, state, views, and feature-specific components inside `frontend/src/modules/english-quest/`. Use local mock data and Pinia state only; do not add backend APIs, persistence, account systems, or real adaptive algorithms in this version.

**Tech Stack:** Vue 3, TypeScript, Pinia, Vue Router, Less, Vite. Visual direction follows the Zelda / Sheikah-inspired dark UI rules already selected for this project.

---

## Architecture Design

**Current structure**

- Existing router pattern inspected: `frontend/src/router/index.ts` imports module routes and spreads them under `DefaultLayout`.
- Existing module route pattern inspected: `frontend/src/modules/todo/routes.ts`.
- Existing state pattern inspected: `frontend/src/modules/todo/store/index.ts` uses Pinia setup stores.
- Existing composable pattern inspected: `frontend/src/modules/todo/composables/useTodoList.ts`.
- Existing view and scoped Less pattern inspected: `frontend/src/modules/todo/views/TodoListView.vue`.
- Shared components inspected under `frontend/src/components/`, but this feature should mostly use module-local components because the UI is highly domain-specific.

**Target architecture**

- New frontend module: `frontend/src/modules/english-quest/`.
- Route prefix: `/english-quest`.
- Main routes:
  - `/english-quest` quest hub.
  - `/english-quest/training` language training field.
  - `/english-quest/practice/chunk-match` chunk match mini-game.
  - `/english-quest/practice/sentence-blocks` sentence pattern mini-game shell.
  - `/english-quest/scenario` WeChat-style real scenario quest.
  - `/english-quest/report` learning report.
- Local data lives in `data/questContent.ts`.
- Local state and progress live in `store/index.ts`.
- Derived interaction helpers live in `composables/useQuestProgress.ts`.

**Change boundary**

- Create and edit files only under `frontend/src/modules/english-quest/`.
- Modify `frontend/src/router/index.ts` to register `englishQuestRoutes`.
- Optionally modify `frontend/src/App.vue` or `frontend/src/layouts/DefaultLayout.vue` only if the default layout visually blocks the prototype. Prefer keeping the prototype self-contained.
- Do not change backend files.
- Do not add backend migrations, zod schemas, repositories, controllers, or API routes.
- Do not implement real speech scoring or real adaptive recommendation logic.

**Contracts**

- No backend contract.
- No HTTP API client.
- Frontend data contracts are TypeScript interfaces in `frontend/src/modules/english-quest/types/index.ts`.
- Store contract exposes current route-independent progress, mastery display values, completed steps, scenario task state, and actions for completing steps and selecting recommendations.

**Execution order**

1. Scaffold the frontend module and route registration.
2. Define TypeScript domain types and static content.
3. Build store and progress helpers.
4. Build Zelda-style module shell and shared UI primitives.
5. Build Quest Hub.
6. Build Training Field Mission 1 and Mission 2.
7. Build optional mini-games.
8. Build WeChat-style scenario quest.
9. Build learning report and recommendation display.
10. Polish responsive UI and run verification.

**Verification**

- Run `cd frontend && npm run type-check`.
- Run `cd frontend && npm run lint`.
- Run `bash .agents/skills/vibecoding-verify/scripts/verify.sh`.
- Manually verify the prototype at `/english-quest`.

---

## File Structure

Create these files:

- `frontend/src/modules/english-quest/index.ts`  
  Public module surface; exports routes.
- `frontend/src/modules/english-quest/routes.ts`  
  Route definitions for the quest module.
- `frontend/src/modules/english-quest/types/index.ts`  
  Domain types for activities, training steps, mini-games, scenario tasks, mastery, and report.
- `frontend/src/modules/english-quest/data/questContent.ts`  
  Static first-version language content and task data.
- `frontend/src/modules/english-quest/store/index.ts`  
  Pinia store for local demo progress.
- `frontend/src/modules/english-quest/composables/useQuestProgress.ts`  
  Derived progress, recommendations, and report helpers.
- `frontend/src/modules/english-quest/components/HyrulePanel.vue`  
  Reusable dark double-border panel.
- `frontend/src/modules/english-quest/components/QuestEntryCard.vue`  
  Home entry card for Training Field and Real Scenario.
- `frontend/src/modules/english-quest/components/MasteryMeter.vue`  
  Small mastery display.
- `frontend/src/modules/english-quest/components/ActivityCard.vue`  
  Activity chunk card.
- `frontend/src/modules/english-quest/components/TrainingStepCard.vue`  
  Standard learning-flow step card.
- `frontend/src/modules/english-quest/components/ChatPhone.vue`  
  WeChat-style phone frame.
- `frontend/src/modules/english-quest/components/MessageBubble.vue`  
  Chat message bubble.
- `frontend/src/modules/english-quest/views/QuestHubView.vue`  
  Product home / quest hub.
- `frontend/src/modules/english-quest/views/TrainingFieldView.vue`  
  Mainline training and optional practice entry.
- `frontend/src/modules/english-quest/views/ChunkMatchGameView.vue`  
  Optional chunk matching mini-game.
- `frontend/src/modules/english-quest/views/SentenceBlocksGameView.vue`  
  Optional sentence-pattern mini-game shell.
- `frontend/src/modules/english-quest/views/ScenarioQuestView.vue`  
  WeChat invitation scenario.
- `frontend/src/modules/english-quest/views/LearningReportView.vue`  
  Session report and adaptive recommendations.
- `frontend/src/modules/english-quest/styles/quest.less`  
  Module-level Zelda / Sheikah visual tokens and utilities.

Modify these files:

- `frontend/src/router/index.ts`  
  Import and register `englishQuestRoutes`; redirect home to `english-quest` for demo.

---

## Task 1: Scaffold `english-quest` Module and Routes

**Files:**

- Create: `frontend/src/modules/english-quest/index.ts`
- Create: `frontend/src/modules/english-quest/routes.ts`
- Create: `frontend/src/modules/english-quest/views/QuestHubView.vue`
- Modify: `frontend/src/router/index.ts`

- [ ] **Step 1: Create a minimal module public surface**

Create `frontend/src/modules/english-quest/index.ts`:

```ts
export { englishQuestRoutes } from './routes'
```

- [ ] **Step 2: Create route definitions**

Create `frontend/src/modules/english-quest/routes.ts`:

```ts
import type { RouteRecordRaw } from 'vue-router'

export const englishQuestRoutes: RouteRecordRaw[] = [
  {
    path: 'english-quest',
    name: 'english-quest-hub',
    component: () => import('./views/QuestHubView.vue'),
  },
  {
    path: 'english-quest/training',
    name: 'english-quest-training',
    component: () => import('./views/TrainingFieldView.vue'),
  },
  {
    path: 'english-quest/practice/chunk-match',
    name: 'english-quest-chunk-match',
    component: () => import('./views/ChunkMatchGameView.vue'),
  },
  {
    path: 'english-quest/practice/sentence-blocks',
    name: 'english-quest-sentence-blocks',
    component: () => import('./views/SentenceBlocksGameView.vue'),
  },
  {
    path: 'english-quest/scenario',
    name: 'english-quest-scenario',
    component: () => import('./views/ScenarioQuestView.vue'),
  },
  {
    path: 'english-quest/report',
    name: 'english-quest-report',
    component: () => import('./views/LearningReportView.vue'),
  },
]
```

- [ ] **Step 3: Create a temporary hub view**

Create `frontend/src/modules/english-quest/views/QuestHubView.vue`:

```vue
<template>
  <main class="quest-hub">
    <h1>AI Native English Quest</h1>
    <p>Weekend invitation prototype</p>
  </main>
</template>

<style lang="less" scoped>
.quest-hub {
  min-height: 60vh;
  display: grid;
  place-items: center;
  color: #e9e1d1;
  background: #66645d;
}
</style>
```

- [ ] **Step 4: Register routes**

Modify `frontend/src/router/index.ts`:

```ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

import { todoRoutes } from '@/modules/todo'
import { englishQuestRoutes } from '@/modules/english-quest'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        redirect: { name: 'english-quest-hub' },
      },
      ...englishQuestRoutes,
      ...todoRoutes,
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

- [ ] **Step 5: Create route shell views required by routes**

Create each route shell view with the same shape as `QuestHubView.vue` so the route scaffold compiles before feature UI is added:

- `TrainingFieldView.vue`: text `Training Field`
- `ChunkMatchGameView.vue`: text `Chunk Match`
- `SentenceBlocksGameView.vue`: text `Sentence Blocks`
- `ScenarioQuestView.vue`: text `Scenario Quest`
- `LearningReportView.vue`: text `Learning Report`

- [ ] **Step 6: Verify route scaffold**

Run:

```bash
cd frontend && npm run type-check
```

Expected: command exits with code `0`.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/router/index.ts frontend/src/modules/english-quest
git commit -m "feat: scaffold english quest frontend module"
```

---

## Task 2: Define Domain Types and Static Content

**Files:**

- Create: `frontend/src/modules/english-quest/types/index.ts`
- Create: `frontend/src/modules/english-quest/data/questContent.ts`

- [ ] **Step 1: Add domain types**

Create `frontend/src/modules/english-quest/types/index.ts`:

```ts
export type SkillKey =
  | 'activity-chunks'
  | 'invitation-pattern'
  | 'time-expressions'
  | 'response-understanding'
  | 'conversation-closing'

export type TrainingMissionId = 'mission-1' | 'mission-2'
export type StepStatus = 'locked' | 'available' | 'complete'
export type ResponseKind = 'accept' | 'refuse'

export interface ActivityChunk {
  id: string
  text: string
  zh: string
  imageLabel: string
  emoji: string
  example: string
}

export interface TimeExpression {
  id: string
  text: string
  zh: string
}

export interface FriendResponse {
  id: string
  text: string
  zh: string
  kind: ResponseKind
}

export interface ClosingExpression {
  id: string
  text: string
  zh: string
  useWhen: ResponseKind
}

export interface TrainingStep {
  id: string
  missionId: TrainingMissionId
  title: string
  goal: string
  interaction: string
  skillKeys: SkillKey[]
}

export interface MiniGame {
  id: string
  title: string
  description: string
  skillKeys: SkillKey[]
  routeName: string
}

export interface ScenarioTask {
  id: string
  friendName: string
  clue: string
  activityId: string
  timeId: string
  responseId: string
  expectedInvitation: string
  expectedFollowUp: string
}

export interface MasteryEntry {
  key: SkillKey
  label: string
  value: number
}
```

- [ ] **Step 2: Add confirmed language content**

Create `frontend/src/modules/english-quest/data/questContent.ts`:

```ts
import type {
  ActivityChunk,
  ClosingExpression,
  FriendResponse,
  MasteryEntry,
  MiniGame,
  ScenarioTask,
  TimeExpression,
  TrainingStep,
} from '../types'

export const activities: ActivityChunk[] = [
  {
    id: 'go-swimming',
    text: 'go swimming',
    zh: '去游泳',
    imageLabel: '泳池和水花',
    emoji: '🏊',
    example: 'Do you want to go swimming this Saturday?',
  },
  {
    id: 'play-basketball',
    text: 'play basketball',
    zh: '打篮球',
    imageLabel: '篮球场',
    emoji: '🏀',
    example: 'Do you want to play basketball tomorrow?',
  },
  {
    id: 'watch-a-movie',
    text: 'watch a movie',
    zh: '看电影',
    imageLabel: '电影院',
    emoji: '🎬',
    example: 'Do you want to watch a movie this Sunday?',
  },
  {
    id: 'go-shopping',
    text: 'go shopping',
    zh: '去购物',
    imageLabel: '商店和购物袋',
    emoji: '🛍️',
    example: 'Do you want to go shopping tomorrow?',
  },
  {
    id: 'play-video-games',
    text: 'play video games',
    zh: '打电子游戏',
    imageLabel: '游戏手柄',
    emoji: '🎮',
    example: 'Do you want to play video games this Sunday?',
  },
]

export const timeExpressions: TimeExpression[] = [
  { id: 'this-saturday', text: 'this Saturday', zh: '这周六' },
  { id: 'this-sunday', text: 'this Sunday', zh: '这周日' },
  { id: 'tomorrow', text: 'tomorrow', zh: '明天' },
]

export const friendResponses: FriendResponse[] = [
  { id: 'sounds-good', text: 'Sounds good.', zh: '听起来不错。', kind: 'accept' },
  { id: 'sorry-cant', text: "Sorry, I can't.", zh: '抱歉，我不行。', kind: 'refuse' },
  { id: 'maybe-next-time', text: 'Maybe next time.', zh: '下次吧。', kind: 'refuse' },
]

export const closingExpressions: ClosingExpression[] = [
  { id: 'see-you-then', text: 'Great! See you then.', zh: '太好了，到时候见。', useWhen: 'accept' },
  { id: 'no-problem', text: 'No problem.', zh: '没关系。', useWhen: 'refuse' },
]

export const trainingSteps: TrainingStep[] = [
  {
    id: 'activity-wall',
    missionId: 'mission-1',
    title: '活动卡墙：自由点亮',
    goal: '探索并点亮 5 个活动词块。',
    interaction: '点击卡片翻开，查看图片、英文、中文和音频。',
    skillKeys: ['activity-chunks'],
  },
  {
    id: 'listen-image',
    missionId: 'mission-1',
    title: '混合听音选图',
    goal: '建立声音和活动意义的连接。',
    interaction: '听活动词块，从 3-4 张活动图中选择。',
    skillKeys: ['activity-chunks'],
  },
  {
    id: 'text-image',
    missionId: 'mission-1',
    title: '混合看词选图',
    goal: '建立英文形式和活动意义的连接。',
    interaction: '看英文词块，选择对应活动图。',
    skillKeys: ['activity-chunks'],
  },
  {
    id: 'quick-match',
    missionId: 'mission-1',
    title: '词块图片快连线',
    goal: '整合词形、意义和图像。',
    interaction: '把英文词块和活动图片快速匹配。',
    skillKeys: ['activity-chunks'],
  },
  {
    id: 'alternate-recall',
    missionId: 'mission-1',
    title: '换图复现',
    goal: '确认学生理解的是活动概念，不是记住单张图片。',
    interaction: '同一活动换新图后重新识别。',
    skillKeys: ['activity-chunks'],
  },
  {
    id: 'image-output',
    missionId: 'mission-1',
    title: '抽样看图说活动',
    goal: '让活动词块进入输出准备状态。',
    interaction: 'Demo 中用点击词块模拟主动输出。',
    skillKeys: ['activity-chunks'],
  },
  {
    id: 'invite-function',
    missionId: 'mission-2',
    title: '发现邀请功能',
    goal: '理解 Do you want to ...? 是用来发出邀请。',
    interaction: '在微信式情境里判断句子功能。',
    skillKeys: ['invitation-pattern'],
  },
  {
    id: 'sentence-chunks',
    missionId: 'mission-2',
    title: '观察句型结构',
    goal: '理解句子由邀请框架、活动、时间组成。',
    interaction: '点击并标注三个语块。',
    skillKeys: ['invitation-pattern', 'activity-chunks', 'time-expressions'],
  },
  {
    id: 'activity-slot',
    missionId: 'mission-2',
    title: '活动填入句子',
    goal: '把 Mission 1 的活动词块迁移进邀请句。',
    interaction: '把活动词块拖入句型空格。',
    skillKeys: ['invitation-pattern', 'activity-chunks'],
  },
  {
    id: 'activity-time-sentence',
    missionId: 'mission-2',
    title: '活动 + 时间成句',
    goal: '形成完整邀约句。',
    interaction: '根据活动图和日历卡补全活动和时间。',
    skillKeys: ['invitation-pattern', 'activity-chunks', 'time-expressions'],
  },
  {
    id: 'chunk-build',
    missionId: 'mission-2',
    title: '语块拼完整句',
    goal: '训练句型顺序和语块组合。',
    interaction: '把打乱语块排成完整邀请句。',
    skillKeys: ['invitation-pattern'],
  },
  {
    id: 'repeat-full',
    missionId: 'mission-2',
    title: '跟读完整句',
    goal: '让邀请句进入口语输出准备。',
    interaction: 'Demo 中用点击完成跟读模拟。',
    skillKeys: ['invitation-pattern'],
  },
  {
    id: 'fade-transfer',
    missionId: 'mission-2',
    title: '撤提示迁移',
    goal: '换活动、换时间后仍能组织邀请句。',
    interaction: '只给活动图和时间卡，让学生选择完整句。',
    skillKeys: ['invitation-pattern', 'activity-chunks', 'time-expressions'],
  },
  {
    id: 'response-classify',
    missionId: 'mission-2',
    title: '回应分类',
    goal: '被动理解朋友接受或拒绝。',
    interaction: '判断 Sounds good / Sorry, I can\\'t / Maybe next time 的含义。',
    skillKeys: ['response-understanding'],
  },
  {
    id: 'response-match',
    missionId: 'mission-2',
    title: '回应和表情匹配',
    goal: '用情境降低回应理解难度。',
    interaction: '把朋友回应和聊天气泡或表情匹配。',
    skillKeys: ['response-understanding'],
  },
  {
    id: 'choose-closing',
    missionId: 'mission-2',
    title: '根据朋友回应选择下一句',
    goal: '学习接受和拒绝后如何收束对话。',
    interaction: '朋友接受时选 Great! See you then.；朋友拒绝时选 No problem.',
    skillKeys: ['conversation-closing'],
  },
  {
    id: 'dialogue-order',
    missionId: 'mission-2',
    title: '小对话排序',
    goal: '建立邀请、回应、收束的完整对话链。',
    interaction: '把三条聊天消息排序成完整对话。',
    skillKeys: ['invitation-pattern', 'response-understanding', 'conversation-closing'],
  },
]

export const miniGames: MiniGame[] = [
  {
    id: 'chunk-match',
    title: '语块消消乐',
    description: '匹配活动词块、时间表达、回应和结束语。',
    skillKeys: ['activity-chunks', 'time-expressions', 'response-understanding', 'conversation-closing'],
    routeName: 'english-quest-chunk-match',
  },
  {
    id: 'sentence-blocks',
    title: '句型俄罗斯方块',
    description: '抓住正确活动和时间，填入 Do you want to [activity] [time]?',
    skillKeys: ['invitation-pattern', 'activity-chunks', 'time-expressions'],
    routeName: 'english-quest-sentence-blocks',
  },
]

export const scenarioTasks: ScenarioTask[] = [
  {
    id: 'mia-swimming',
    friendName: 'Mia',
    clue: '☀️🥵 I really want to jump into a pool. Saturday: free.',
    activityId: 'go-swimming',
    timeId: 'this-saturday',
    responseId: 'sounds-good',
    expectedInvitation: 'Do you want to go swimming this Saturday?',
    expectedFollowUp: 'Great! See you then.',
  },
  {
    id: 'leo-games',
    friendName: 'Leo',
    clue: 'New game card! Sunday: free.',
    activityId: 'play-video-games',
    timeId: 'this-sunday',
    responseId: 'maybe-next-time',
    expectedInvitation: 'Do you want to play video games this Sunday?',
    expectedFollowUp: 'No problem.',
  },
  {
    id: 'ben-basketball',
    friendName: 'Ben',
    clue: 'Basketball again? Tomorrow looks good.',
    activityId: 'play-basketball',
    timeId: 'tomorrow',
    responseId: 'sounds-good',
    expectedInvitation: 'Do you want to play basketball tomorrow?',
    expectedFollowUp: 'Great! See you then.',
  },
  {
    id: 'lily-shopping',
    friendName: 'Lily',
    clue: 'I need a birthday gift. Saturday is open.',
    activityId: 'go-shopping',
    timeId: 'this-saturday',
    responseId: 'sorry-cant',
    expectedInvitation: 'Do you want to go shopping this Saturday?',
    expectedFollowUp: 'No problem.',
  },
]

export const initialMastery: MasteryEntry[] = [
  { key: 'activity-chunks', label: '活动词块', value: 20 },
  { key: 'invitation-pattern', label: '邀请句型', value: 10 },
  { key: 'time-expressions', label: '时间表达', value: 35 },
  { key: 'response-understanding', label: '回应理解', value: 10 },
  { key: 'conversation-closing', label: '对话收束', value: 25 },
]
```

- [ ] **Step 3: Run type-check**

```bash
cd frontend && npm run type-check
```

Expected: command exits with code `0`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/modules/english-quest/types frontend/src/modules/english-quest/data
git commit -m "feat: add english quest content model"
```

---

## Task 3: Implement Local Progress Store and Derived Helpers

**Files:**

- Create: `frontend/src/modules/english-quest/store/index.ts`
- Create: `frontend/src/modules/english-quest/composables/useQuestProgress.ts`

- [ ] **Step 1: Create Pinia store**

Create `frontend/src/modules/english-quest/store/index.ts`:

```ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { initialMastery, scenarioTasks, trainingSteps } from '../data/questContent'
import type { MasteryEntry, ScenarioTask, SkillKey } from '../types'

function increase(value: number, amount: number) {
  return Math.min(100, value + amount)
}

export const useEnglishQuestStore = defineStore('englishQuest', () => {
  const completedTrainingStepIds = ref<string[]>([])
  const completedMiniGameIds = ref<string[]>([])
  const completedScenarioTaskIds = ref<string[]>([])
  const mastery = ref<MasteryEntry[]>(initialMastery.map((entry) => ({ ...entry })))
  const activeScenarioTaskId = ref(scenarioTasks[0]?.id ?? '')

  const completedTrainingCount = computed(() => completedTrainingStepIds.value.length)
  const allTrainingComplete = computed(() => completedTrainingCount.value >= trainingSteps.length)

  const activeScenarioTask = computed<ScenarioTask | undefined>(() =>
    scenarioTasks.find((task) => task.id === activeScenarioTaskId.value),
  )

  function updateMastery(keys: SkillKey[], amount: number) {
    mastery.value = mastery.value.map((entry) =>
      keys.includes(entry.key) ? { ...entry, value: increase(entry.value, amount) } : entry,
    )
  }

  function completeTrainingStep(stepId: string) {
    if (completedTrainingStepIds.value.includes(stepId)) return
    const step = trainingSteps.find((item) => item.id === stepId)
    completedTrainingStepIds.value.push(stepId)
    if (step) updateMastery(step.skillKeys, 5)
  }

  function completeMiniGame(gameId: string, keys: SkillKey[]) {
    if (!completedMiniGameIds.value.includes(gameId)) completedMiniGameIds.value.push(gameId)
    updateMastery(keys, 8)
  }

  function completeScenarioTask(taskId: string) {
    if (!completedScenarioTaskIds.value.includes(taskId)) completedScenarioTaskIds.value.push(taskId)
    const index = scenarioTasks.findIndex((task) => task.id === taskId)
    const next = scenarioTasks[index + 1]
    if (next) activeScenarioTaskId.value = next.id
    updateMastery(['invitation-pattern', 'response-understanding', 'conversation-closing'], 6)
  }

  function selectScenarioTask(taskId: string) {
    activeScenarioTaskId.value = taskId
  }

  function resetQuest() {
    completedTrainingStepIds.value = []
    completedMiniGameIds.value = []
    completedScenarioTaskIds.value = []
    mastery.value = initialMastery.map((entry) => ({ ...entry }))
    activeScenarioTaskId.value = scenarioTasks[0]?.id ?? ''
  }

  return {
    completedTrainingStepIds,
    completedMiniGameIds,
    completedScenarioTaskIds,
    mastery,
    activeScenarioTaskId,
    completedTrainingCount,
    allTrainingComplete,
    activeScenarioTask,
    completeTrainingStep,
    completeMiniGame,
    completeScenarioTask,
    selectScenarioTask,
    resetQuest,
  }
})
```

- [ ] **Step 2: Create progress composable**

Create `frontend/src/modules/english-quest/composables/useQuestProgress.ts`:

```ts
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { miniGames, scenarioTasks, trainingSteps } from '../data/questContent'
import { useEnglishQuestStore } from '../store'

export function useQuestProgress() {
  const store = useEnglishQuestStore()
  const {
    completedTrainingStepIds,
    completedMiniGameIds,
    completedScenarioTaskIds,
    mastery,
    allTrainingComplete,
    activeScenarioTask,
  } = storeToRefs(store)

  const trainingProgress = computed(() =>
    Math.round((completedTrainingStepIds.value.length / trainingSteps.length) * 100),
  )

  const scenarioProgress = computed(() =>
    Math.round((completedScenarioTaskIds.value.length / scenarioTasks.length) * 100),
  )

  const recommendation = computed(() => {
    const weakest = [...mastery.value].sort((a, b) => a.value - b.value)[0]
    if (!allTrainingComplete.value) return `建议先完成语言训练场。当前最需要补强：${weakest.label}。`
    if (completedScenarioTaskIds.value.length < scenarioTasks.length) return '主线训练已完成，推荐进入微信邀约实战。'
    return '本轮任务已完成，可以查看学习报告或继续支线练习。'
  })

  return {
    store,
    completedTrainingStepIds,
    completedMiniGameIds,
    completedScenarioTaskIds,
    mastery,
    allTrainingComplete,
    activeScenarioTask,
    trainingProgress,
    scenarioProgress,
    recommendation,
    trainingSteps,
    miniGames,
    scenarioTasks,
  }
}
```

- [ ] **Step 3: Run type-check**

```bash
cd frontend && npm run type-check
```

Expected: command exits with code `0`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/modules/english-quest/store frontend/src/modules/english-quest/composables
git commit -m "feat: add english quest progress store"
```

---

## Task 4: Build Zelda-Style Shared UI Primitives

**Files:**

- Create: `frontend/src/modules/english-quest/styles/quest.less`
- Create: `frontend/src/modules/english-quest/components/HyrulePanel.vue`
- Create: `frontend/src/modules/english-quest/components/MasteryMeter.vue`
- Create: `frontend/src/modules/english-quest/components/QuestEntryCard.vue`

- [ ] **Step 1: Create module style tokens**

Create `frontend/src/modules/english-quest/styles/quest.less`:

```less
@quest-bg: #66645d;
@quest-panel: rgba(0, 0, 0, 0.58);
@quest-sheikah: #3cd3fc;
@quest-gold: #fcc413;
@quest-text: #e9e1d1;
@quest-muted: rgba(233, 225, 209, 0.68);
@quest-border: rgba(226, 222, 211, 0.3);

.quest-screen {
  min-height: calc(100vh - 96px);
  margin: -@space-lg;
  padding: 32px;
  color: @quest-text;
  background:
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.025) 0 1px, transparent 1px 6px),
    radial-gradient(circle at 20% 10%, rgba(60, 211, 252, 0.16), transparent 26%),
    linear-gradient(160deg, rgba(8, 18, 36, 0.96), rgba(31, 34, 30, 0.96)),
    @quest-bg;
}

.quest-title {
  margin: 0;
  color: @quest-text;
  font-size: 34px;
  line-height: 1.1;
  letter-spacing: 0;
}

.quest-kicker {
  color: @quest-sheikah;
  font-size: 12px;
  font-style: italic;
}

.quest-copy {
  color: @quest-muted;
  font-style: italic;
  line-height: 1.5;
}
```

- [ ] **Step 2: Create HyrulePanel**

Create `frontend/src/modules/english-quest/components/HyrulePanel.vue`:

```vue
<script setup lang="ts">
defineProps<{
  title?: string
  tone?: 'blue' | 'gold' | 'plain'
}>()
</script>

<template>
  <section class="hyrule-panel" :class="`hyrule-panel--${tone || 'plain'}`">
    <header v-if="title" class="hyrule-panel__header">{{ title }}</header>
    <slot />
  </section>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.hyrule-panel {
  position: relative;
  padding: 18px;
  background: @quest-panel;
  border: 1px solid @quest-border;
  border-radius: 6px;
  box-shadow: inset 0 0 0 3px rgba(226, 222, 211, 0.08);

  &::after {
    content: '';
    position: absolute;
    inset: 3px;
    border: 1px solid rgba(226, 222, 211, 0.16);
    pointer-events: none;
  }

  &--blue {
    border-color: fade(@quest-sheikah, 78%);
    box-shadow: inset 0 0 0 3px rgba(226, 222, 211, 0.08), 0 0 24px rgba(60, 211, 252, 0.18);
  }

  &--gold {
    border-color: fade(@quest-gold, 68%);
    box-shadow: inset 0 0 0 3px rgba(226, 222, 211, 0.08), 0 0 22px rgba(252, 196, 19, 0.12);
  }

  &__header {
    margin-bottom: 12px;
    color: @quest-text;
    font-size: 20px;
  }
}
</style>
```

- [ ] **Step 3: Create MasteryMeter**

Create `frontend/src/modules/english-quest/components/MasteryMeter.vue`:

```vue
<script setup lang="ts">
defineProps<{
  label: string
  value: number
}>()
</script>

<template>
  <div class="mastery-meter">
    <div class="mastery-meter__meta">
      <span>{{ label }}</span>
      <strong>{{ value }}%</strong>
    </div>
    <div class="mastery-meter__track">
      <span :style="{ width: `${value}%` }" />
    </div>
  </div>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.mastery-meter {
  display: grid;
  gap: 6px;

  &__meta {
    display: flex;
    justify-content: space-between;
    color: @quest-muted;
    font-size: 12px;

    strong {
      color: @quest-gold;
    }
  }

  &__track {
    height: 10px;
    background: rgba(0, 0, 0, 0.72);
    border: 1px solid rgba(226, 222, 211, 0.24);

    span {
      display: block;
      height: 100%;
      background: @quest-sheikah;
    }
  }
}
</style>
```

- [ ] **Step 4: Create QuestEntryCard**

Create `frontend/src/modules/english-quest/components/QuestEntryCard.vue`:

```vue
<script setup lang="ts">
defineProps<{
  kicker: string
  title: string
  copy: string
  tone: 'blue' | 'gold'
  tag?: string
}>()
</script>

<template>
  <RouterLink class="quest-entry" :class="`quest-entry--${tone}`" to="#">
    <span class="quest-entry__kicker">{{ kicker }}</span>
    <strong>{{ title }}</strong>
    <p>{{ copy }}</p>
    <em v-if="tag">{{ tag }}</em>
    <slot />
  </RouterLink>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.quest-entry {
  display: block;
  min-height: 260px;
  padding: 20px;
  color: @quest-text;
  text-decoration: none;
  background: @quest-panel;
  border: 1px solid @quest-border;
  border-radius: 6px;
  box-shadow: inset 0 0 0 3px rgba(226, 222, 211, 0.08);

  &--blue {
    border-color: fade(@quest-sheikah, 80%);
  }

  &--gold {
    border-color: fade(@quest-gold, 72%);
  }

  &__kicker,
  em {
    color: @quest-sheikah;
    font-size: 12px;
    font-style: italic;
  }

  strong {
    display: block;
    margin-top: 10px;
    font-size: 24px;
  }

  p {
    color: @quest-muted;
    font-style: italic;
    line-height: 1.5;
  }
}
</style>
```

- [ ] **Step 5: Run type-check**

```bash
cd frontend && npm run type-check
```

Expected: command exits with code `0`.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/modules/english-quest/components frontend/src/modules/english-quest/styles
git commit -m "feat: add english quest UI primitives"
```

---

## Task 5: Build Quest Hub

**Files:**

- Modify: `frontend/src/modules/english-quest/views/QuestHubView.vue`
- Modify: `frontend/src/modules/english-quest/components/QuestEntryCard.vue`

- [ ] **Step 1: Allow QuestEntryCard destination**

Modify `QuestEntryCard.vue` script props:

```ts
defineProps<{
  to: string | { name: string }
  kicker: string
  title: string
  copy: string
  tone: 'blue' | 'gold'
  tag?: string
}>()
```

Modify template opening tag:

```vue
<RouterLink class="quest-entry" :class="`quest-entry--${tone}`" :to="to">
```

- [ ] **Step 2: Replace QuestHubView**

Replace `frontend/src/modules/english-quest/views/QuestHubView.vue`:

```vue
<script setup lang="ts">
import QuestEntryCard from '../components/QuestEntryCard.vue'
import MasteryMeter from '../components/MasteryMeter.vue'
import { useQuestProgress } from '../composables/useQuestProgress'

const { mastery, trainingProgress, scenarioProgress, recommendation } = useQuestProgress()
</script>

<template>
  <main class="quest-screen quest-hub">
    <header class="quest-hub__header">
      <span class="quest-kicker">AI Native English Quest</span>
      <h1 class="quest-title">周末邀约 · 语言冒险</h1>
      <p class="quest-copy">先在训练场获得语言技能，再进入微信实战完成邀约任务。</p>
    </header>

    <section class="quest-hub__entries">
      <QuestEntryCard
        :to="{ name: 'english-quest-training' }"
        kicker="入口 A"
        title="语言训练场"
        copy="点亮活动卡，解锁邀请句，完成听辨、匹配、跟读和迁移复现。"
        tone="blue"
        tag="推荐先开始"
      >
        <MasteryMeter label="主线进度" :value="trainingProgress" />
      </QuestEntryCard>

      <QuestEntryCard
        :to="{ name: 'english-quest-scenario' }"
        kicker="入口 B"
        title="真实场景任务"
        copy="进入微信式聊天，给不同朋友发出英文邀约并完成对话收束。"
        tone="gold"
        tag="可直接挑战"
      >
        <MasteryMeter label="场景进度" :value="scenarioProgress" />
      </QuestEntryCard>
    </section>

    <section class="quest-hub__recommendation">
      {{ recommendation }}
    </section>

    <section class="quest-hub__mastery" aria-label="技能掌握度">
      <MasteryMeter
        v-for="entry in mastery"
        :key="entry.key"
        :label="entry.label"
        :value="entry.value"
      />
    </section>
  </main>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.quest-hub {
  display: grid;
  gap: 24px;

  &__header {
    max-width: 760px;
  }

  &__entries {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  &__recommendation {
    max-width: 760px;
    padding: 12px 14px;
    color: @quest-gold;
    background: rgba(0, 0, 0, 0.42);
    border: 1px solid fade(@quest-gold, 45%);
  }

  &__mastery {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
  }
}

@media (max-width: 840px) {
  .quest-hub {
    &__entries,
    &__mastery {
      grid-template-columns: 1fr;
    }
  }
}
</style>
```

- [ ] **Step 3: Run type-check and lint**

```bash
cd frontend && npm run type-check && npm run lint
```

Expected: both commands exit with code `0`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/modules/english-quest
git commit -m "feat: build english quest hub"
```

---

## Task 6: Build Training Field Mainline

**Files:**

- Create: `frontend/src/modules/english-quest/components/ActivityCard.vue`
- Create: `frontend/src/modules/english-quest/components/TrainingStepCard.vue`
- Modify: `frontend/src/modules/english-quest/views/TrainingFieldView.vue`

- [ ] **Step 1: Create ActivityCard**

Create `frontend/src/modules/english-quest/components/ActivityCard.vue`:

```vue
<script setup lang="ts">
import type { ActivityChunk } from '../types'

defineProps<{
  activity: ActivityChunk
  lit?: boolean
}>()
</script>

<template>
  <article class="activity-card" :class="{ 'activity-card--lit': lit }">
    <div class="activity-card__emoji">{{ activity.emoji }}</div>
    <strong>{{ activity.text }}</strong>
    <span>{{ activity.zh }}</span>
    <small>{{ activity.imageLabel }}</small>
  </article>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.activity-card {
  display: grid;
  gap: 6px;
  min-height: 150px;
  padding: 14px;
  color: @quest-text;
  background: rgba(0, 0, 0, 0.46);
  border: 1px solid @quest-border;
  border-radius: 6px;

  &--lit {
    border-color: @quest-sheikah;
    box-shadow: 0 0 18px rgba(60, 211, 252, 0.22);
  }

  &__emoji {
    font-size: 34px;
  }

  span,
  small {
    color: @quest-muted;
  }
}
</style>
```

- [ ] **Step 2: Create TrainingStepCard**

Create `frontend/src/modules/english-quest/components/TrainingStepCard.vue`:

```vue
<script setup lang="ts">
import type { TrainingStep } from '../types'

defineProps<{
  step: TrainingStep
  complete: boolean
}>()

const emit = defineEmits<{
  complete: [stepId: string]
}>()
</script>

<template>
  <article class="training-step" :class="{ 'training-step--complete': complete }">
    <div>
      <strong>{{ step.title }}</strong>
      <p>{{ step.goal }}</p>
      <small>{{ step.interaction }}</small>
    </div>
    <button type="button" :disabled="complete" @click="emit('complete', step.id)">
      {{ complete ? '已完成' : '完成一次' }}
    </button>
  </article>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.training-step {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 14px;
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid @quest-border;

  &--complete {
    border-color: @quest-sheikah;
  }

  p,
  small {
    color: @quest-muted;
  }

  button {
    min-width: 96px;
    min-height: 36px;
    color: @quest-text;
    background: rgba(60, 211, 252, 0.18);
    border: 1px solid @quest-sheikah;
    cursor: pointer;

    &:disabled {
      cursor: default;
      color: rgba(233, 225, 209, 0.58);
      border-color: @quest-border;
      background: rgba(0, 0, 0, 0.24);
    }
  }
}
</style>
```

- [ ] **Step 3: Build TrainingFieldView**

Replace `frontend/src/modules/english-quest/views/TrainingFieldView.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ActivityCard from '../components/ActivityCard.vue'
import HyrulePanel from '../components/HyrulePanel.vue'
import MasteryMeter from '../components/MasteryMeter.vue'
import TrainingStepCard from '../components/TrainingStepCard.vue'
import { activities, miniGames } from '../data/questContent'
import { useQuestProgress } from '../composables/useQuestProgress'

const { store, completedTrainingStepIds, mastery, trainingProgress, trainingSteps } = useQuestProgress()

const missionOneSteps = computed(() => trainingSteps.filter((step) => step.missionId === 'mission-1'))
const missionTwoSteps = computed(() => trainingSteps.filter((step) => step.missionId === 'mission-2'))

function isComplete(stepId: string) {
  return completedTrainingStepIds.value.includes(stepId)
}
</script>

<template>
  <main class="quest-screen training-field">
    <header class="training-field__header">
      <span class="quest-kicker">Training Shrine</span>
      <h1 class="quest-title">周末邀约训练场</h1>
      <p class="quest-copy">主线负责标准学习流程，支线小游戏负责刷熟练度。</p>
      <MasteryMeter label="主线进度" :value="trainingProgress" />
    </header>

    <HyrulePanel title="活动卡墙" tone="blue">
      <div class="training-field__activities">
        <ActivityCard
          v-for="activity in activities"
          :key="activity.id"
          :activity="activity"
          :lit="trainingProgress > 0"
        />
      </div>
    </HyrulePanel>

    <section class="training-field__missions">
      <HyrulePanel title="Mission 1：点亮活动卡" tone="blue">
        <TrainingStepCard
          v-for="step in missionOneSteps"
          :key="step.id"
          :step="step"
          :complete="isComplete(step.id)"
          @complete="store.completeTrainingStep"
        />
      </HyrulePanel>

      <HyrulePanel title="Mission 2：解锁邀请语言" tone="gold">
        <TrainingStepCard
          v-for="step in missionTwoSteps"
          :key="step.id"
          :step="step"
          :complete="isComplete(step.id)"
          @complete="store.completeTrainingStep"
        />
      </HyrulePanel>
    </section>

    <HyrulePanel title="可选趣味练习" tone="plain">
      <div class="training-field__games">
        <RouterLink
          v-for="game in miniGames"
          :key="game.id"
          :to="{ name: game.routeName }"
          class="training-field__game"
        >
          <strong>{{ game.title }}</strong>
          <span>{{ game.description }}</span>
        </RouterLink>
      </div>
    </HyrulePanel>

    <HyrulePanel title="技能掌握度" tone="plain">
      <div class="training-field__mastery">
        <MasteryMeter v-for="entry in mastery" :key="entry.key" :label="entry.label" :value="entry.value" />
      </div>
    </HyrulePanel>
  </main>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.training-field {
  display: grid;
  gap: 20px;

  &__header {
    display: grid;
    max-width: 780px;
    gap: 10px;
  }

  &__activities,
  &__games,
  &__mastery {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
  }

  &__missions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  &__game {
    min-height: 110px;
    padding: 14px;
    color: @quest-text;
    text-decoration: none;
    background: rgba(0, 0, 0, 0.42);
    border: 1px solid @quest-border;

    span {
      display: block;
      margin-top: 8px;
      color: @quest-muted;
      line-height: 1.45;
    }
  }
}

@media (max-width: 1100px) {
  .training-field {
    &__activities,
    &__games,
    &__mastery,
    &__missions {
      grid-template-columns: 1fr;
    }
  }
}
</style>
```

- [ ] **Step 4: Run type-check and lint**

```bash
cd frontend && npm run type-check && npm run lint
```

Expected: both commands exit with code `0`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/english-quest
git commit -m "feat: build english quest training field"
```

---

## Task 7: Build Optional Mini-Games

**Files:**

- Modify: `frontend/src/modules/english-quest/views/ChunkMatchGameView.vue`
- Modify: `frontend/src/modules/english-quest/views/SentenceBlocksGameView.vue`

- [ ] **Step 1: Build ChunkMatchGameView**

Replace `frontend/src/modules/english-quest/views/ChunkMatchGameView.vue`:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import HyrulePanel from '../components/HyrulePanel.vue'
import { activities, closingExpressions, friendResponses, miniGames, timeExpressions } from '../data/questContent'
import { useEnglishQuestStore } from '../store'

const store = useEnglishQuestStore()
const selectedIds = ref<string[]>([])

const game = miniGames.find((item) => item.id === 'chunk-match')
const cards = computed(() => [
  ...activities.map((item) => ({ id: item.id, text: item.text, match: item.zh })),
  ...timeExpressions.map((item) => ({ id: item.id, text: item.text, match: item.zh })),
  ...friendResponses.map((item) => ({ id: item.id, text: item.text, match: item.zh })),
  ...closingExpressions.map((item) => ({ id: item.id, text: item.text, match: item.zh })),
])

function toggle(id: string) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((item) => item !== id)
    : [...selectedIds.value, id]
}

function completeGame() {
  if (game) store.completeMiniGame(game.id, game.skillKeys)
}
</script>

<template>
  <main class="quest-screen chunk-match">
    <header>
      <span class="quest-kicker">Optional Practice</span>
      <h1 class="quest-title">语块消消乐</h1>
      <p class="quest-copy">点击你认识的语块卡，完成本轮练习后提升对应掌握度。</p>
    </header>

    <section class="chunk-match__grid">
      <button
        v-for="card in cards"
        :key="card.id"
        type="button"
        class="chunk-match__card"
        :class="{ 'chunk-match__card--selected': selectedIds.includes(card.id) }"
        @click="toggle(card.id)"
      >
        <strong>{{ card.text }}</strong>
        <span>{{ card.match }}</span>
      </button>
    </section>

    <HyrulePanel tone="gold">
      <p>已选择 {{ selectedIds.length }} 张卡。第一版用点击模拟消除，不实现复杂游戏判定。</p>
      <button type="button" class="chunk-match__action" @click="completeGame">完成本轮练习</button>
      <RouterLink :to="{ name: 'english-quest-training' }" class="chunk-match__back">返回训练场</RouterLink>
    </HyrulePanel>
  </main>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.chunk-match {
  display: grid;
  gap: 20px;

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  &__card {
    min-height: 96px;
    padding: 12px;
    color: @quest-text;
    background: rgba(0, 0, 0, 0.46);
    border: 1px solid @quest-border;
    cursor: pointer;

    span {
      display: block;
      margin-top: 8px;
      color: @quest-muted;
    }

    &--selected {
      border-color: @quest-sheikah;
      box-shadow: 0 0 18px rgba(60, 211, 252, 0.2);
    }
  }

  &__action,
  &__back {
    display: inline-flex;
    margin-right: 12px;
    padding: 10px 14px;
    color: @quest-text;
    text-decoration: none;
    background: rgba(60, 211, 252, 0.16);
    border: 1px solid @quest-sheikah;
  }
}
</style>
```

- [ ] **Step 2: Build SentenceBlocksGameView**

Replace `frontend/src/modules/english-quest/views/SentenceBlocksGameView.vue`:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import HyrulePanel from '../components/HyrulePanel.vue'
import { activities, miniGames, timeExpressions } from '../data/questContent'
import { useEnglishQuestStore } from '../store'

const store = useEnglishQuestStore()
const activityId = ref(activities[0].id)
const timeId = ref(timeExpressions[0].id)
const game = miniGames.find((item) => item.id === 'sentence-blocks')

const activity = computed(() => activities.find((item) => item.id === activityId.value) || activities[0])
const time = computed(() => timeExpressions.find((item) => item.id === timeId.value) || timeExpressions[0])
const sentence = computed(() => `Do you want to ${activity.value.text} ${time.value.text}?`)

function completeGame() {
  if (game) store.completeMiniGame(game.id, game.skillKeys)
}
</script>

<template>
  <main class="quest-screen sentence-blocks">
    <header>
      <span class="quest-kicker">Optional Practice</span>
      <h1 class="quest-title">句型俄罗斯方块</h1>
      <p class="quest-copy">第一版用选择活动和时间模拟“抓词块填入句型槽”。</p>
    </header>

    <HyrulePanel title="任务" tone="blue">
      <p>邀请朋友：{{ activity.zh }} / {{ time.zh }}</p>
      <div class="sentence-blocks__sentence">{{ sentence }}</div>
    </HyrulePanel>

    <section class="sentence-blocks__choices">
      <HyrulePanel title="活动块" tone="plain">
        <button
          v-for="item in activities"
          :key="item.id"
          type="button"
          :class="{ selected: item.id === activityId }"
          @click="activityId = item.id"
        >
          {{ item.text }}
        </button>
      </HyrulePanel>

      <HyrulePanel title="时间块" tone="plain">
        <button
          v-for="item in timeExpressions"
          :key="item.id"
          type="button"
          :class="{ selected: item.id === timeId }"
          @click="timeId = item.id"
        >
          {{ item.text }}
        </button>
      </HyrulePanel>
    </section>

    <HyrulePanel tone="gold">
      <button type="button" @click="completeGame">完成本轮练习</button>
      <RouterLink :to="{ name: 'english-quest-training' }">返回训练场</RouterLink>
    </HyrulePanel>
  </main>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.sentence-blocks {
  display: grid;
  gap: 20px;

  &__sentence {
    margin-top: 12px;
    padding: 18px;
    color: @quest-gold;
    background: rgba(0, 0, 0, 0.48);
    border: 1px solid fade(@quest-gold, 48%);
    font-size: 24px;
  }

  &__choices {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  button,
  a {
    display: inline-flex;
    margin: 6px;
    padding: 10px 12px;
    color: @quest-text;
    text-decoration: none;
    background: rgba(0, 0, 0, 0.42);
    border: 1px solid @quest-border;
    cursor: pointer;

    &.selected {
      border-color: @quest-sheikah;
      background: rgba(60, 211, 252, 0.16);
    }
  }
}
</style>
```

- [ ] **Step 3: Run type-check and lint**

```bash
cd frontend && npm run type-check && npm run lint
```

Expected: both commands exit with code `0`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/modules/english-quest/views/ChunkMatchGameView.vue frontend/src/modules/english-quest/views/SentenceBlocksGameView.vue
git commit -m "feat: add english quest practice games"
```

---

## Task 8: Build WeChat-Style Scenario Quest

**Files:**

- Create: `frontend/src/modules/english-quest/components/MessageBubble.vue`
- Create: `frontend/src/modules/english-quest/components/ChatPhone.vue`
- Modify: `frontend/src/modules/english-quest/views/ScenarioQuestView.vue`

- [ ] **Step 1: Create MessageBubble**

Create `frontend/src/modules/english-quest/components/MessageBubble.vue`:

```vue
<script setup lang="ts">
defineProps<{
  mine?: boolean
}>()
</script>

<template>
  <div class="message-row" :class="{ 'message-row--mine': mine }">
    <div v-if="!mine" class="message-row__avatar" />
    <div class="message-row__bubble">
      <slot />
    </div>
  </div>
</template>

<style lang="less" scoped>
.message-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;

  &--mine {
    justify-content: flex-end;
  }

  &__avatar {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: #9ec8ff;
  }

  &__bubble {
    max-width: 260px;
    padding: 10px 12px;
    color: #1f2a26;
    background: #fff;
    border-radius: 5px 16px 16px 16px;
    line-height: 1.4;
  }

  &--mine &__bubble {
    background: #a9f0bc;
    border-radius: 16px 5px 16px 16px;
  }
}
</style>
```

- [ ] **Step 2: Create ChatPhone**

Create `frontend/src/modules/english-quest/components/ChatPhone.vue`:

```vue
<script setup lang="ts">
defineProps<{
  friendName: string
}>()
</script>

<template>
  <section class="chat-phone">
    <header class="chat-phone__header">{{ friendName }}</header>
    <div class="chat-phone__body">
      <slot />
    </div>
    <footer class="chat-phone__input">输入或按住说英语...</footer>
  </section>
</template>

<style lang="less" scoped>
.chat-phone {
  max-width: 430px;
  min-height: 640px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #1f2a26;
  background: #ededeb;
  border: 12px solid #1e1f22;
  border-radius: 26px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);

  &__header {
    min-height: 46px;
    display: grid;
    place-items: center;
    background: #f8f8f8;
    border-bottom: 1px solid #dedede;
    font-weight: 700;
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
  }

  &__input {
    min-height: 52px;
    display: flex;
    align-items: center;
    margin: 0 10px 10px;
    padding: 0 12px;
    color: #8b968f;
    background: #fff;
    border-radius: 8px;
  }
}
</style>
```

- [ ] **Step 3: Build ScenarioQuestView**

Replace `frontend/src/modules/english-quest/views/ScenarioQuestView.vue`:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ChatPhone from '../components/ChatPhone.vue'
import HyrulePanel from '../components/HyrulePanel.vue'
import MessageBubble from '../components/MessageBubble.vue'
import { closingExpressions, friendResponses, scenarioTasks } from '../data/questContent'
import { useQuestProgress } from '../composables/useQuestProgress'

const { store, completedScenarioTaskIds, activeScenarioTask } = useQuestProgress()
const phase = ref<'clue' | 'invite' | 'response' | 'follow-up' | 'complete'>('clue')

const response = computed(() => friendResponses.find((item) => item.id === activeScenarioTask.value?.responseId))
const followUp = computed(() =>
  closingExpressions.find((item) => item.text === activeScenarioTask.value?.expectedFollowUp),
)

function sendInvitation() {
  phase.value = 'response'
}

function sendFollowUp() {
  if (!activeScenarioTask.value) return
  store.completeScenarioTask(activeScenarioTask.value.id)
  phase.value = 'complete'
}

function nextTask(taskId: string) {
  store.selectScenarioTask(taskId)
  phase.value = 'clue'
}
</script>

<template>
  <main class="quest-screen scenario-quest">
    <header>
      <span class="quest-kicker">Scenario Quest</span>
      <h1 class="quest-title">微信邀约实战</h1>
      <p class="quest-copy">看朋友线索，在接近真实微信的场景里完成英文邀约。</p>
    </header>

    <section class="scenario-quest__layout" v-if="activeScenarioTask">
      <HyrulePanel title="任务板" tone="gold">
        <div class="scenario-quest__tasks">
          <button
            v-for="task in scenarioTasks"
            :key="task.id"
            type="button"
            :class="{ active: task.id === activeScenarioTask.id, complete: completedScenarioTaskIds.includes(task.id) }"
            @click="nextTask(task.id)"
          >
            {{ task.friendName }}
          </button>
        </div>
        <p>{{ activeScenarioTask.clue }}</p>
        <p>目标：发出邀请，并根据朋友回应完成收束。</p>
      </HyrulePanel>

      <ChatPhone :friend-name="activeScenarioTask.friendName">
        <MessageBubble>{{ activeScenarioTask.clue }}</MessageBubble>
        <MessageBubble v-if="phase !== 'clue'" mine>{{ activeScenarioTask.expectedInvitation }}</MessageBubble>
        <MessageBubble v-if="phase === 'response' || phase === 'follow-up' || phase === 'complete'">
          {{ response?.text }}
        </MessageBubble>
        <MessageBubble v-if="phase === 'complete'" mine>{{ activeScenarioTask.expectedFollowUp }}</MessageBubble>

        <div class="scenario-quest__actions">
          <button v-if="phase === 'clue'" type="button" @click="phase = 'invite'">准备发送邀请</button>
          <button v-if="phase === 'invite'" type="button" @click="sendInvitation">
            发送：{{ activeScenarioTask.expectedInvitation }}
          </button>
          <button v-if="phase === 'response'" type="button" @click="phase = 'follow-up'">看懂回应，选择收束</button>
          <button v-if="phase === 'follow-up'" type="button" @click="sendFollowUp">
            回复：{{ followUp?.text || activeScenarioTask.expectedFollowUp }}
          </button>
        </div>
      </ChatPhone>
    </section>

    <RouterLink :to="{ name: 'english-quest-report' }" class="scenario-quest__report">查看学习报告</RouterLink>
  </main>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.scenario-quest {
  display: grid;
  gap: 20px;

  &__layout {
    display: grid;
    grid-template-columns: minmax(260px, 0.9fr) minmax(360px, 1.1fr);
    gap: 22px;
    align-items: start;
  }

  &__tasks {
    display: grid;
    gap: 8px;
    margin-bottom: 14px;

    button {
      padding: 10px 12px;
      color: @quest-text;
      text-align: left;
      background: rgba(0, 0, 0, 0.38);
      border: 1px solid @quest-border;
      cursor: pointer;

      &.active {
        border-color: @quest-gold;
      }

      &.complete {
        border-color: @quest-sheikah;
      }
    }
  }

  &__actions {
    margin-top: auto;

    button {
      width: 100%;
      min-height: 42px;
      color: #1f2a26;
      background: #a9f0bc;
      border: 0;
      border-radius: 8px;
      cursor: pointer;
    }
  }

  &__report {
    justify-self: start;
    padding: 10px 14px;
    color: @quest-text;
    text-decoration: none;
    background: rgba(60, 211, 252, 0.16);
    border: 1px solid @quest-sheikah;
  }
}

@media (max-width: 920px) {
  .scenario-quest__layout {
    grid-template-columns: 1fr;
  }
}
</style>
```

- [ ] **Step 4: Run type-check and lint**

```bash
cd frontend && npm run type-check && npm run lint
```

Expected: both commands exit with code `0`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/english-quest
git commit -m "feat: build english quest scenario"
```

---

## Task 9: Build Learning Report and Adaptive Recommendations

**Files:**

- Modify: `frontend/src/modules/english-quest/views/LearningReportView.vue`

- [ ] **Step 1: Build LearningReportView**

Replace `frontend/src/modules/english-quest/views/LearningReportView.vue`:

```vue
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import HyrulePanel from '../components/HyrulePanel.vue'
import MasteryMeter from '../components/MasteryMeter.vue'
import { useQuestProgress } from '../composables/useQuestProgress'

const { mastery, completedScenarioTaskIds, scenarioTasks, recommendation, store } = useQuestProgress()
</script>

<template>
  <main class="quest-screen learning-report">
    <header>
      <span class="quest-kicker">Learning Report</span>
      <h1 class="quest-title">本轮学习报告</h1>
      <p class="quest-copy">报告展示前端可解释规则，不代表真实自适应算法。</p>
    </header>

    <section class="learning-report__grid">
      <HyrulePanel title="任务完成情况" tone="gold">
        <p>已完成 {{ completedScenarioTaskIds.length }} / {{ scenarioTasks.length }} 个微信邀约任务。</p>
        <p>{{ recommendation }}</p>
      </HyrulePanel>

      <HyrulePanel title="技能掌握度" tone="blue">
        <div class="learning-report__mastery">
          <MasteryMeter v-for="entry in mastery" :key="entry.key" :label="entry.label" :value="entry.value" />
        </div>
      </HyrulePanel>
    </section>

    <HyrulePanel title="下一步建议" tone="plain">
      <ul>
        <li>活动词块不稳时，回到语块消消乐。</li>
        <li>句型迁移不稳时，回到句型俄罗斯方块。</li>
        <li>主线训练完成后，继续挑战微信邀约。</li>
      </ul>
    </HyrulePanel>

    <nav class="learning-report__actions">
      <RouterLink :to="{ name: 'english-quest-hub' }">回到任务大厅</RouterLink>
      <button type="button" @click="store.resetQuest">重置演示进度</button>
    </nav>
  </main>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.learning-report {
  display: grid;
  gap: 20px;

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  &__mastery {
    display: grid;
    gap: 12px;
  }

  &__actions {
    display: flex;
    gap: 12px;

    a,
    button {
      padding: 10px 14px;
      color: @quest-text;
      text-decoration: none;
      background: rgba(60, 211, 252, 0.16);
      border: 1px solid @quest-sheikah;
      cursor: pointer;
    }
  }
}

@media (max-width: 840px) {
  .learning-report__grid {
    grid-template-columns: 1fr;
  }
}
</style>
```

- [ ] **Step 2: Run type-check and lint**

```bash
cd frontend && npm run type-check && npm run lint
```

Expected: both commands exit with code `0`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/modules/english-quest/views/LearningReportView.vue
git commit -m "feat: add english quest learning report"
```

---

## Task 10: Final Polish, Verification, and Manual QA

**Files:**

- Modify as needed: files under `frontend/src/modules/english-quest/`
- Do not modify backend unless verification exposes an unrelated existing issue that the user approves fixing.

- [ ] **Step 1: Run frontend checks**

```bash
cd frontend && npm run type-check
cd frontend && npm run lint
```

Expected: both commands exit with code `0`.

- [ ] **Step 2: Run repository verification**

```bash
bash .agents/skills/vibecoding-verify/scripts/verify.sh
```

Expected: output ends with `verify: ALL PASSED`.

- [ ] **Step 3: Start local app**

Run backend only if existing todo routes still need it for verify or unrelated pages. The `english-quest` module should work as a frontend-only prototype.

```bash
cd frontend && npm run dev
```

Expected: Vite prints a local URL, typically `http://localhost:5173/`.

- [ ] **Step 4: Manual route QA**

Open these routes:

- `http://localhost:5173/english-quest`
- `http://localhost:5173/english-quest/training`
- `http://localhost:5173/english-quest/practice/chunk-match`
- `http://localhost:5173/english-quest/practice/sentence-blocks`
- `http://localhost:5173/english-quest/scenario`
- `http://localhost:5173/english-quest/report`

Expected:

- Each route loads without blank screen.
- Home has two primary entries.
- Training field shows Mission 1, Mission 2, five activity cards, and optional practice.
- Mini-games can be completed and update mastery display.
- Scenario task can progress through clue, invitation, response, follow-up, and completion.
- Report shows scenario completion and mastery.

- [ ] **Step 5: Commit final polish**

```bash
git add frontend/src/modules/english-quest frontend/src/router/index.ts
git commit -m "chore: verify english quest prototype"
```

---

## Spec Coverage Self-Review

- Home / quest hub: Task 5.
- Training field Mission 1 and Mission 2: Tasks 2, 3, 6.
- Optional practice games: Tasks 2, 7.
- WeChat real scenario: Tasks 2, 8.
- Learning report and adaptive rules: Tasks 3, 9.
- Zelda / Sheikah visual direction: Tasks 4, 5, 6, 8, 9.
- Frontend-only boundary: Architecture Design and all tasks avoid backend work.
- Verification: Task 10.

No backend API, real persistence, real adaptive algorithm, speech scoring, phone-call feature, account system, or teacher dashboard is included.
