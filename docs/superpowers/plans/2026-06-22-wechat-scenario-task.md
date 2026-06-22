# 微信场景任务 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a desktop WeChat-style invitation practice where students send voice invitations to Princess Zelda, Purah, and Tulin, react to their replies, and collect three badges.

**Architecture:** Replace the empty `ScenarioQuestView.vue` with a two-state feature: a task selection board and one real-chat simulation. Keep task content declarative in `questContent.ts`, task completion in Pinia, and separate browser speech capture from the pure phrase-evaluation rule so a future service-side evaluator can replace it without rewriting UI state.

**Tech Stack:** Vue 3 Composition API, TypeScript, Pinia, Less, Web Speech API, Vitest, existing English Quest components and assets.

---

## File Structure

- Modify: `frontend/package.json` — add a focused unit-test command and Vitest development dependency.
- Modify: `frontend/vite.config.ts` — add the Vitest configuration while retaining the existing Vite setup.
- Modify: `frontend/src/modules/english-quest/types/index.ts` — define scenario chat phases, richer declarative task data, and speech-evaluation result types.
- Modify: `frontend/src/modules/english-quest/data/questContent.ts` — replace the four placeholder scenario records with the three confirmed Zelda-world tasks.
- Modify: `frontend/src/modules/english-quest/store/index.ts` — keep selection free after completion and expose a derived reward-unlocked flag.
- Create: `frontend/src/modules/english-quest/composables/useScenarioSpeech.ts` — wrap browser speech recognition and export pure evaluation helpers.
- Create: `frontend/src/modules/english-quest/composables/useScenarioSpeech.spec.ts` — test invitation and closing phrase acceptance, including tolerant wording.
- Create: `frontend/src/modules/english-quest/components/ScenarioTaskBoard.vue` — show three freely selectable friend cards, badges, and the final reward card.
- Create: `frontend/src/modules/english-quest/components/ScenarioWeChatChat.vue` — render the message thread and emit chat actions.
- Create: `frontend/src/modules/english-quest/components/ScenarioVoiceComposer.vue` — render microphone state, helpful retry copy, transcript, hint, and the demo fallback.
- Modify: `frontend/src/modules/english-quest/views/ScenarioQuestView.vue` — coordinate board, chat, voice phases, and task completion.
- Create: `frontend/src/modules/english-quest/assets/purah-avatar.png` — generated illustrated avatar consistent with existing Link and Princess assets.
- Create: `frontend/src/modules/english-quest/assets/tulin-avatar.png` — generated illustrated avatar consistent with existing Link and Princess assets.

### Task 1: Add Test Support

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.ts`

- [ ] **Step 1: Add the failing speech-rule test file**

Create `frontend/src/modules/english-quest/composables/useScenarioSpeech.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { evaluatePhrase } from './useScenarioSpeech'

describe('evaluatePhrase', () => {
  it('accepts an invitation when intent, activity, and time are present', () => {
    expect(
      evaluatePhrase('Do you want to go swimming this Saturday?', [
        ['do you want to', 'want to'],
        ['go swimming', 'go swim'],
        ['this saturday', 'saturday'],
      ]),
    ).toEqual({ passed: true, missing: [] })
  })
})
```

- [ ] **Step 2: Configure the test runner**

Install Vitest:

Run:

```bash
npm --prefix frontend install --save-dev vitest
```

In `frontend/package.json`, add:

```json
"test": "vitest run"
```

In `frontend/vite.config.ts`, extend the `defineConfig` object with:

```ts
test: {
  environment: 'node',
  include: ['src/**/*.spec.ts'],
},
```

- [ ] **Step 3: Run the failing test**

Run:

```bash
npm --prefix frontend run test -- useScenarioSpeech.spec.ts
```

Expected: FAIL because `evaluatePhrase` is not yet exported.

- [ ] **Step 4: Leave the failing test unstaged until Task 3 makes it pass**

Do not commit this red state. Task 3 stages the test configuration, lockfile, test, and implementation together only after the test is green.

### Task 2: Define the Three Scenario Tasks and Reward State

**Files:**
- Modify: `frontend/src/modules/english-quest/types/index.ts`
- Modify: `frontend/src/modules/english-quest/data/questContent.ts`
- Modify: `frontend/src/modules/english-quest/store/index.ts`

- [ ] **Step 1: Extend scenario task types**

Replace the current `ScenarioTask` with:

```ts
export type ScenarioChatPhase = 'invite' | 'follow-up' | 'complete'

export interface ScenarioTask {
  id: string
  friendName: string
  friendRole: string
  friendAvatar: 'princess' | 'purah' | 'tulin'
  activityId: string
  activityLabel: string
  timeLabel: string
  taskPrompt: string
  responseText: string
  responseZh: string
  expectedInvitation: string
  invitationKeywordGroups: string[][]
  expectedFollowUp: string
  followUpKeywordGroups: string[][]
  badgeTitle: string
  badgeIcon: string
}

export interface SpeechEvaluation {
  passed: boolean
  missing: number[]
}
```

- [ ] **Step 2: Replace placeholder task records with confirmed content**

Set `scenarioTasks` to these records:

```ts
{
  id: 'princess-swimming',
  friendName: '公主',
  friendRole: '海拉鲁的公主',
  friendAvatar: 'princess',
  activityId: 'go-swimming',
  activityLabel: 'go swimming',
  timeLabel: 'this Saturday',
  taskPrompt: '邀请公主这周六去游泳。',
  responseText: 'Sounds good.',
  responseZh: '听上去不错。',
  expectedInvitation: 'Do you want to go swimming this Saturday?',
  invitationKeywordGroups: [['do you want to', 'want to'], ['go swimming', 'go swim'], ['this saturday', 'saturday']],
  expectedFollowUp: 'Great! See you then.',
  followUpKeywordGroups: [['great'], ['see you then', 'see you']],
  badgeTitle: '水花邀约章',
  badgeIcon: '水',
},
{
  id: 'purah-video-games',
  friendName: '普尔亚',
  friendRole: '海拉鲁研究者',
  friendAvatar: 'purah',
  activityId: 'play-video-games',
  activityLabel: 'play video games',
  timeLabel: 'this Sunday',
  taskPrompt: '邀请普尔亚这周日打电子游戏。',
  responseText: "Sorry, I can't.",
  responseZh: '不好意思，我不能去。',
  expectedInvitation: 'Do you want to play video games this Sunday?',
  invitationKeywordGroups: [['do you want to', 'want to'], ['play video games', 'play games'], ['this sunday', 'sunday']],
  expectedFollowUp: 'No problem.',
  followUpKeywordGroups: [['no problem']],
  badgeTitle: '希卡电玩章',
  badgeIcon: '机',
},
{
  id: 'tulin-movie',
  friendName: '丘栗',
  friendRole: '利特族小伙伴',
  friendAvatar: 'tulin',
  activityId: 'watch-a-movie',
  activityLabel: 'watch a movie',
  timeLabel: 'tomorrow',
  taskPrompt: '邀请丘栗明天看电影。',
  responseText: 'Sounds good.',
  responseZh: '听上去不错。',
  expectedInvitation: 'Do you want to watch a movie tomorrow?',
  invitationKeywordGroups: [['do you want to', 'want to'], ['watch a movie', 'watch movie'], ['tomorrow']],
  expectedFollowUp: 'Great! See you then.',
  followUpKeywordGroups: [['great'], ['see you then', 'see you']],
  badgeTitle: '天空观影章',
  badgeIcon: '风',
}
```

- [ ] **Step 3: Update the store without forced next-task navigation**

Delete the `scenarioTasks[index + 1]` lookup from `completeScenarioTask`. Add:

```ts
const scenarioRewardUnlocked = computed(
  () => completedScenarioTaskIds.value.length >= scenarioTasks.length,
)
```

Return `scenarioRewardUnlocked` from the store.

- [ ] **Step 4: Type-check the data and store**

Run:

```bash
npm --prefix frontend run type-check
```

Expected: PASS.

- [ ] **Step 5: Commit data and state**

```bash
git add frontend/src/modules/english-quest/types/index.ts frontend/src/modules/english-quest/data/questContent.ts frontend/src/modules/english-quest/store/index.ts
git commit -m "feat: define Zelda scenario tasks"
```

### Task 3: Implement Speech Evaluation and Browser Fallback

**Files:**
- Create: `frontend/src/modules/english-quest/composables/useScenarioSpeech.ts`
- Modify: `frontend/src/modules/english-quest/composables/useScenarioSpeech.spec.ts`

- [ ] **Step 1: Add the remaining failing tests**

Append:

```ts
it('accepts tolerant variants and reports only missing meaning groups', () => {
  expect(evaluatePhrase('I want to go swim Saturday', [['want to'], ['go swimming', 'go swim'], ['this saturday', 'saturday']])).toEqual({
    passed: true,
    missing: [],
  })
  expect(evaluatePhrase('Do you want to go swimming?', [['do you want to'], ['go swimming'], ['this saturday']])).toEqual({
    passed: false,
    missing: [2],
  })
})
```

- [ ] **Step 2: Run tests and verify the new expectation fails**

Run:

```bash
npm --prefix frontend run test -- useScenarioSpeech.spec.ts
```

Expected: FAIL because `evaluatePhrase` is not implemented.

- [ ] **Step 3: Implement the pure evaluator and recognition wrapper**

Create `useScenarioSpeech.ts` with these stable public contracts:

```ts
export function evaluatePhrase(transcript: string, keywordGroups: string[][]): SpeechEvaluation {
  const normalized = transcript.toLowerCase().replace(/[?.!,']/g, ' ').replace(/\s+/g, ' ').trim()
  const missing = keywordGroups
    .map((alternatives, index) => (alternatives.some((word) => normalized.includes(word)) ? -1 : index))
    .filter((index) => index >= 0)
  return { passed: missing.length === 0, missing }
}

export function useScenarioSpeech() {
  const status = ref<'idle' | 'recording' | 'processing' | 'unsupported' | 'denied'>('idle')
  const transcript = ref('')
  const errorMessage = ref('')

  function start(onResult: (text: string) => void): void
  function stop(): void
  function simulate(text: string, onResult: (text: string) => void): void

  return { status, transcript, errorMessage, start, stop, simulate }
}
```

Use `window.SpeechRecognition ?? window.webkitSpeechRecognition` through a local typed constructor. Set `recognition.lang = 'en-US'`, `interimResults = false`, and `continuous = false`. If unavailable, set `status` to `unsupported`; if permission errors occur, set `status` to `denied`; never throw into the view. `simulate` must set `transcript.value = text`, set `status.value = 'idle'`, then call `onResult(text)`.

- [ ] **Step 4: Run focused tests**

Run:

```bash
npm --prefix frontend run test -- useScenarioSpeech.spec.ts
```

Expected: PASS with two tests.

- [ ] **Step 5: Commit speech behavior**

```bash
git add frontend/package.json frontend/package-lock.json frontend/vite.config.ts frontend/src/modules/english-quest/composables/useScenarioSpeech.ts frontend/src/modules/english-quest/composables/useScenarioSpeech.spec.ts
git commit -m "feat: add tolerant scenario speech evaluation"
```

### Task 4: Create Character Assets

**Files:**
- Create: `frontend/src/modules/english-quest/assets/purah-avatar.png`
- Create: `frontend/src/modules/english-quest/assets/tulin-avatar.png`

- [ ] **Step 1: Generate Purah's avatar**

Generate a square Japanese anime-style portrait: a cheerful young Sheikah researcher inspired by Purah, white bob haircut, round glasses, Sheikah-tech blue accents, close-up selfie composition, no text, high readability at 48 pixels, consistent with `princess-selfie.png`.

- [ ] **Step 2: Generate Tulin's avatar**

Generate a square Japanese anime-style portrait: a friendly young Rito archer inspired by Tulin, bird-like features, small bow and sky-blue scarf, close-up selfie composition, no text, high readability at 48 pixels, consistent with `princess-selfie.png`.

- [ ] **Step 3: Copy and inspect both images**

Place the generated files at the paths above. Verify both are square, their faces remain visible at avatar size, and no generated text appears.

- [ ] **Step 4: Commit the assets**

```bash
git add frontend/src/modules/english-quest/assets/purah-avatar.png frontend/src/modules/english-quest/assets/tulin-avatar.png
git commit -m "feat: add scenario friend avatars"
```

### Task 5: Build the Friend Task Board

**Files:**
- Create: `frontend/src/modules/english-quest/components/ScenarioTaskBoard.vue`

- [ ] **Step 1: Define the component contract**

Use these props and event:

```ts
defineProps<{
  tasks: ScenarioTask[]
  completedTaskIds: string[]
  rewardUnlocked: boolean
}>()

defineEmits<{
  select: [taskId: string]
}>()
```

- [ ] **Step 2: Render the board state**

Render a full-width scene section with:

```vue
<header class="scenario-board__header">
  <p>Scenario Quest</p>
  <h1>给朋友发出周末邀约</h1>
  <strong>邀约徽章册 {{ completedTaskIds.length }}/{{ tasks.length }}</strong>
</header>
<button v-for="task in tasks" :key="task.id" type="button" @click="$emit('select', task.id)">
  <img :src="avatarMap[task.friendAvatar]" :alt="task.friendName" />
  <span>{{ task.friendName }}</span>
  <small>{{ task.taskPrompt }}</small>
  <em>{{ completedTaskIds.includes(task.id) ? '已获得徽章' : task.badgeTitle }}</em>
</button>
```

Show a gold reward panel only when `rewardUnlocked` is true, titled `周末邀约大师` and summarizing that all three friends have been invited.

- [ ] **Step 3: Add desktop visual styling**

Use a three-column grid at desktop widths, `minmax(220px, 1fr)` cards, 8px-or-less corners, existing quest colors, and a subtle icon-based completed state. Keep each full prompt in the card without truncation.

- [ ] **Step 4: Type-check the component**

Run:

```bash
npm --prefix frontend run type-check
```

Expected: PASS.

- [ ] **Step 5: Commit the task board**

```bash
git add frontend/src/modules/english-quest/components/ScenarioTaskBoard.vue
git commit -m "feat: add scenario task board"
```

### Task 6: Build the WeChat Conversation Surface

**Files:**
- Create: `frontend/src/modules/english-quest/components/ScenarioWeChatChat.vue`
- Create: `frontend/src/modules/english-quest/components/ScenarioVoiceComposer.vue`

- [ ] **Step 1: Define chat component props and events**

Use:

```ts
defineProps<{
  task: ScenarioTask
  phase: ScenarioChatPhase
  transcript: string
  evaluationMessage: string
  recording: boolean
  speechUnavailable: boolean
  hintVisible: boolean
}>()

defineEmits<{
  back: []
  startRecording: []
  stopRecording: []
  showHint: []
  simulate: []
}>()
```

- [ ] **Step 2: Render deterministic chat history**

Render the task prompt as a quiet system note. Then conditionally render:

```vue
<div v-if="phase !== 'invite'" class="wechat-message wechat-message--self">
  <div class="voice-bubble">语音消息</div>
  <small>{{ transcript }}</small>
  <img :src="linkAvatar" alt="林克" />
</div>
<div v-if="phase === 'follow-up' || phase === 'complete'" class="wechat-message wechat-message--friend">
  <img :src="friendAvatar" :alt="task.friendName" />
  <div>
    <p>{{ task.responseText }}</p>
    <small>{{ task.responseZh }}</small>
  </div>
</div>
```

When `phase === 'complete'`, append the student's closing voice bubble, Link's happy or sad reaction image based on the task response, and a task-complete system note.

- [ ] **Step 3: Implement the voice composer UI**

Show one familiar microphone icon button that toggles between `开始录音` and `结束录音`. Keep status, short retry guidance, transcript, a `给点提示` button, and a `模拟识别成功` button inside the composer. The fallback button is visible only when recognition is unsupported, denied, or fails to return text.

Use phase-specific hints:

```ts
const inviteHint = `Do you want to ${task.activityLabel} ${task.timeLabel}?`
const followUpHint = task.expectedFollowUp
```

- [ ] **Step 4: Style as a real chat, not a training card**

Use a white top bar with friend name, `#ededed` message background, left white bubbles, right `#95ec69` bubbles, 44px avatars, and a fixed-looking but layout-safe bottom composer. Preserve the larger desktop shell from the rest of the product and confine the chat to a readable `max-width: 760px` surface.

- [ ] **Step 5: Commit the chat components**

```bash
git add frontend/src/modules/english-quest/components/ScenarioWeChatChat.vue frontend/src/modules/english-quest/components/ScenarioVoiceComposer.vue
git commit -m "feat: add scenario chat interface"
```

### Task 7: Connect Page, Speech, Completion, and Rewards

**Files:**
- Modify: `frontend/src/modules/english-quest/views/ScenarioQuestView.vue`

- [ ] **Step 1: Replace the placeholder page with explicit state**

Create these state values in the script setup:

```ts
const selectedTaskId = ref('')
const phase = ref<ScenarioChatPhase>('invite')
const transcript = ref('')
const evaluationMessage = ref('')
const hintVisible = ref(false)

const selectedTask = computed(() => scenarioTasks.find((task) => task.id === selectedTaskId.value))
```

Use the store's `completedScenarioTaskIds`, `scenarioRewardUnlocked`, `selectScenarioTask`, and `completeScenarioTask`.

- [ ] **Step 2: Connect the invitation evaluation**

Implement this exact transition:

```ts
function submitSpeech(text: string) {
  if (!selectedTask.value) return
  transcript.value = text
  const groups = phase.value === 'invite'
    ? selectedTask.value.invitationKeywordGroups
    : selectedTask.value.followUpKeywordGroups
  const result = evaluatePhrase(text, groups)
  if (!result.passed) {
    evaluationMessage.value = phase.value === 'invite'
      ? '再试试把活动和时间也说出来。'
      : '再试试用一句简短的话把对话收好。'
    return
  }
  evaluationMessage.value = ''
  if (phase.value === 'invite') phase.value = 'follow-up'
  else {
    phase.value = 'complete'
    store.completeScenarioTask(selectedTask.value.id)
  }
}
```

- [ ] **Step 3: Reset state on task selection and return**

On selecting a card, set the selected ID, call `store.selectScenarioTask(taskId)`, clear transcript/message/hint, and set `phase` to `invite`. On return, clear only the view-local state so completed badges remain visible.

- [ ] **Step 4: Render selection versus chat view**

Use:

```vue
<ScenarioTaskBoard
  v-if="!selectedTask"
  :tasks="scenarioTasks"
  :completed-task-ids="completedScenarioTaskIds"
  :reward-unlocked="scenarioRewardUnlocked"
  @select="openTask"
/>
<ScenarioWeChatChat
  v-else
  :task="selectedTask"
  :phase="phase"
  :transcript="transcript"
  :evaluation-message="evaluationMessage"
  :recording="isRecording"
  :speech-unavailable="speechUnavailable"
  :hint-visible="hintVisible"
  @back="closeTask"
  @start-recording="startSpeech"
  @stop-recording="speech.stop"
  @show-hint="hintVisible = true"
  @simulate="simulateSpeech"
/>
```

Define the two template-safe computed values in script setup:

```ts
const isRecording = computed(() => speech.status.value === 'recording')
const speechUnavailable = computed(
  () => speech.status.value === 'unsupported' || speech.status.value === 'denied',
)
```

- [ ] **Step 5: Verify the full app build**

Run:

```bash
npm --prefix frontend run test
npm --prefix frontend run type-check
npm --prefix frontend run lint
npm --prefix frontend run build
```

Expected: all commands exit with status 0.

- [ ] **Step 6: Verify the three manual flows in the browser**

At `/english-quest/scenario` verify:

1. Each of Princess, Purah, and Tulin can be opened in any order.
2. A partial invite displays the retry copy and keeps recording controls available.
3. The demo fallback completes both chat turns for an accept task and a refusal task.
4. Completing all three cards shows `周末邀约大师` and `3/3` badges.
5. The hub's scenario progress is 100% and training still displays 13 levels.

- [ ] **Step 7: Commit the integrated scene**

```bash
git add frontend/src/modules/english-quest/views/ScenarioQuestView.vue
git commit -m "feat: build voice invitation scenario quest"
```

### Task 8: Final Review and Clean Verification

**Files:**
- No planned production-code changes.

- [ ] **Step 1: Check the final diff is scoped**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only scenario-task implementation files are staged or newly changed.

- [ ] **Step 2: Run the release checks again**

Run:

```bash
npm --prefix frontend run test
npm --prefix frontend run type-check
npm --prefix frontend run lint
npm --prefix frontend run build
```

Expected: all commands exit with status 0.

- [ ] **Step 3: Record the final verification result in the implementation handoff**

Report the four command outcomes and the five manual browser-flow outcomes. Do not create a commit unless a previously verified implementation change is made to fix a specific failed check.
