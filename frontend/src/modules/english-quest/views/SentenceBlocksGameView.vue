<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { activities, miniGames, timeExpressions } from '../data/questContent'
import { useEnglishQuestStore } from '../store'

type SlotName = 'activity' | 'time'
type TokenRole = SlotName | 'distractor'

type FallingToken = {
  id: number
  text: string
  role: TokenRole
  needed: boolean
}

const store = useEnglishQuestStore()
const game = miniGames.find((item) => item.id === 'sentence-blocks')

const tasks = [
  { friend: 'Alex', zh: '邀请 Alex 这周六去游泳。', activity: 'go swimming', time: 'this Saturday' },
  { friend: 'Mia', zh: '邀请 Mia 这周日看电影。', activity: 'watch a movie', time: 'this Sunday' },
  { friend: 'Ben', zh: '邀请 Ben 明天打篮球。', activity: 'play basketball', time: 'tomorrow' },
  { friend: 'Lily', zh: '邀请 Lily 这周六打电子游戏。', activity: 'play video games', time: 'this Saturday' },
]

const running = ref(false)
const formedCount = ref(0)
const missedCount = ref(0)
const comboCount = ref(0)
const taskIndex = ref(0)
const tokenSeed = ref(0)
const fallingToken = ref<FallingToken | null>(null)
const selectedToken = ref<FallingToken | null>(null)
const slots = ref<Record<SlotName, string>>({ activity: '', time: '' })
const feedback = ref('教学意图：把“下落词块”接进完整句型槽，训练句型生成而不只是词块分类。')
const feedbackTone = ref<'default' | 'good' | 'bad'>('default')
let timer: ReturnType<typeof window.setInterval> | undefined
let nextTaskTimer: ReturnType<typeof window.setTimeout> | undefined

const task = computed(() => tasks[taskIndex.value])
const sentence = computed(() => `Do you want to ${slots.value.activity || 'activity'} ${slots.value.time || 'time'}?`)
const activityTokens = activities.map((item) => item.text)
const timeTokens = timeExpressions.map((item) => item.text)
const distractors = ['Sounds good.', "Sorry, I can't.", 'No problem.', 'Great! See you then.']

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function clearBoard() {
  fallingToken.value = null
  selectedToken.value = null
  slots.value = { activity: '', time: '' }
}

function renderTask() {
  clearBoard()
}

function getFallingToken(): FallingToken {
  const needed: Omit<FallingToken, 'id'>[] = [
    { text: task.value.activity, role: 'activity', needed: true },
    { text: task.value.time, role: 'time', needed: true },
  ].filter((token) => slots.value[token.role] !== token.text)

  const decoys: Omit<FallingToken, 'id'>[] = [
    ...activityTokens.filter((text) => text !== task.value.activity).map((text) => ({ text, role: 'activity' as const, needed: false })),
    ...timeTokens.filter((text) => text !== task.value.time).map((text) => ({ text, role: 'time' as const, needed: false })),
    ...distractors.map((text) => ({ text, role: 'distractor' as const, needed: false })),
  ]

  const token = needed.length && Math.random() < 0.62 ? randomItem(needed) : randomItem(decoys)
  return { ...token, id: tokenSeed.value++ }
}

function spawnToken() {
  if (!running.value || fallingToken.value) return
  fallingToken.value = getFallingToken()
}

function updateFeedback(message: string, tone: 'default' | 'good' | 'bad' = 'default') {
  feedback.value = message
  feedbackTone.value = tone
}

function startGame() {
  running.value = true
  updateFeedback('看任务，接住需要的活动和时间词块，把它们填进完整句型。')
  if (!timer) {
    spawnToken()
    timer = window.setInterval(spawnToken, 1500)
  }
}

function pauseGame() {
  running.value = false
  if (timer) window.clearInterval(timer)
  timer = undefined
  updateFeedback('已暂停。这个玩法适合短时高频练习，不宜太久。')
}

function resetGame() {
  pauseGame()
  if (nextTaskTimer) window.clearTimeout(nextTaskTimer)
  nextTaskTimer = undefined
  formedCount.value = 0
  missedCount.value = 0
  comboCount.value = 0
  taskIndex.value = 0
  tokenSeed.value = 0
  renderTask()
  updateFeedback('教学意图：把“下落词块”接进完整句型槽，训练句型生成而不只是词块分类。')
}

function selectToken(token: FallingToken) {
  selectedToken.value = token
}

function handleTokenMiss(token: FallingToken) {
  if (!fallingToken.value || fallingToken.value.id !== token.id) return
  if (token.needed) {
    missedCount.value += 1
    comboCount.value = 0
    updateFeedback(`漏接了关键块「${token.text}」。它本来可以填进当前句型。`, 'bad')
  } else {
    updateFeedback(`放过干扰块「${token.text}」也可以，继续等当前任务需要的词块。`)
  }
  fallingToken.value = null
  selectedToken.value = null
}

function completeSentenceIfReady() {
  if (slots.value.activity !== task.value.activity || slots.value.time !== task.value.time) return

  formedCount.value += 1
  comboCount.value += 1
  updateFeedback(`成句成功：${sentence.value} 下一题马上出现。`, 'good')
  if (formedCount.value >= 3 && game) store.completeMiniGame(game.id, game.skillKeys)

  nextTaskTimer = window.setTimeout(() => {
    taskIndex.value = (taskIndex.value + 1) % tasks.length
    renderTask()
    if (running.value) spawnToken()
  }, 1200)
}

function fillSlot(slotName: SlotName) {
  const token = selectedToken.value
  if (!token) return

  const expected = task.value[slotName]
  if (token.role === slotName && token.text === expected) {
    slots.value = { ...slots.value, [slotName]: token.text }
    updateFeedback(`填入正确：${token.text}。继续补全另一格。`, 'good')
  } else {
    missedCount.value += 1
    comboCount.value = 0
    updateFeedback(`这个位置需要「${expected}」，不是「${token.text}」。`, 'bad')
  }

  fallingToken.value = null
  selectedToken.value = null
  completeSentenceIfReady()
}

onBeforeUnmount(() => {
  pauseGame()
  if (nextTaskTimer) window.clearTimeout(nextTaskTimer)
})
</script>

<template>
  <main class="quest-screen sentence-tetris">
    <header class="sentence-tetris__header">
      <div>
        <h2 class="quest-title">句子俄罗斯方块</h2>
        <p class="quest-copy">目标句型：<strong>Do you want to + activity + time?</strong>。在下落干扰中抓住关键活动和时间词块，把它们填进句型槽。</p>
      </div>
      <span class="sentence-tetris__badge">Weekend Invite · Demo</span>
    </header>

    <section class="sentence-tetris__panel" aria-label="下落词块填句型槽">
      <h3>下落词块填句型槽</h3>
      <p class="sentence-tetris__hint">词块会从上方下落。先点击当前任务需要的词块，再点击句型轨道里的 activity 或 time 槽。</p>

      <section class="sentence-tetris__stats" aria-label="本局数据">
        <div><span>成句</span><strong>{{ formedCount }}</strong></div>
        <div><span>漏接</span><strong>{{ missedCount }}</strong></div>
        <div><span>连击</span><strong>{{ comboCount }}</strong></div>
      </section>

      <p class="sentence-tetris__task">任务：{{ task.zh }}</p>

      <div class="sentence-tetris__drop-zone" aria-label="下落词块区域">
        <button
          v-if="fallingToken"
          :key="fallingToken.id"
          type="button"
          class="sentence-tetris__falling"
          :class="{ 'is-selected': selectedToken?.id === fallingToken.id }"
          @click="selectToken(fallingToken)"
          @animationend="handleTokenMiss(fallingToken)"
        >
          {{ fallingToken.text }}
        </button>
      </div>

      <section class="sentence-tetris__frame" aria-label="邀约句型">
        <div class="sentence-tetris__fixed">Do you want to</div>
        <button type="button" class="sentence-tetris__slot" :class="{ filled: slots.activity }" @click="fillSlot('activity')">
          {{ slots.activity || 'activity' }}
        </button>
        <button type="button" class="sentence-tetris__slot" :class="{ filled: slots.time }" @click="fillSlot('time')">
          {{ slots.time || 'time' }}
        </button>
        <div class="sentence-tetris__qmark">?</div>
      </section>

      <div class="sentence-tetris__controls">
        <button type="button" class="sentence-tetris__start" @click="startGame">开始下落</button>
        <button type="button" @click="pauseGame">暂停</button>
        <button type="button" @click="resetGame">重置</button>
      </div>

      <p class="sentence-tetris__feedback" :class="`is-${feedbackTone}`">{{ feedback }}</p>
    </section>

    <RouterLink :to="{ name: 'english-quest-training' }" class="sentence-tetris__back">返回语言训练场</RouterLink>
  </main>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.sentence-tetris {
  width: min(1180px, calc(100vw - 48px));
  display: grid;
  gap: 22px;
  padding-bottom: 46px;
}

.sentence-tetris__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
}

.sentence-tetris__header .quest-copy {
  max-width: 760px;
}

.sentence-tetris__badge {
  padding: 12px 16px;
  color: @quest-sheikah;
  font-style: italic;
  white-space: nowrap;
  background: rgba(60, 211, 252, 0.08);
  border: 1px solid rgba(60, 211, 252, 0.38);
  border-radius: 999px;
  box-shadow: inset 0 0 24px rgba(60, 211, 252, 0.08);
}

.sentence-tetris__panel {
  position: relative;
  width: min(760px, 100%);
  min-height: 610px;
  margin: 0 auto;
  padding: 22px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(11, 29, 39, 0.82), rgba(6, 15, 21, 0.9));
  border: 1px solid rgba(60, 211, 252, 0.38);
  border-radius: 28px;
  box-shadow: 0 18px 70px rgba(0, 0, 0, 0.48), inset 0 0 50px rgba(60, 211, 252, 0.04);
}

.sentence-tetris__panel::after {
  position: absolute;
  top: -88px;
  right: -88px;
  width: 220px;
  height: 220px;
  content: '';
  pointer-events: none;
  border: 1px solid rgba(60, 211, 252, 0.16);
  border-radius: 50%;
  box-shadow: 0 0 80px rgba(60, 211, 252, 0.12);
}

.sentence-tetris__panel h3 {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 26px;
}

.sentence-tetris__hint,
.sentence-tetris__feedback {
  margin: 8px 0 18px;
  color: @quest-muted;
  font-size: 14px;
  line-height: 1.6;
}

.sentence-tetris__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 14px 0;
}

.sentence-tetris__stats div {
  padding: 12px;
  background: rgba(7, 18, 25, 0.58);
  border: 1px solid rgba(60, 211, 252, 0.18);
  border-radius: 16px;
}

.sentence-tetris__stats span {
  color: @quest-muted;
  font-size: 14px;
}

.sentence-tetris__stats strong {
  display: block;
  margin-top: 3px;
  color: @quest-gold;
  font-size: 22px;
}

.sentence-tetris__task {
  margin: 12px 0;
  padding: 13px 15px;
  color: #ffe6a7;
  font-size: 14px;
  line-height: 1.55;
  background: rgba(252, 196, 19, 0.08);
  border: 1px solid rgba(252, 196, 19, 0.28);
  border-radius: 18px;
}

.sentence-tetris__drop-zone {
  position: relative;
  height: 268px;
  overflow: hidden;
  background:
    linear-gradient(rgba(60, 211, 252, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(60, 211, 252, 0.06) 1px, transparent 1px),
    rgba(4, 10, 14, 0.56);
  background-size: 34px 34px;
  border: 1px solid rgba(60, 211, 252, 0.22);
  border-radius: 22px;
}

.sentence-tetris__falling {
  position: absolute;
  top: 0;
  left: 50%;
  width: max-content;
  max-width: 88%;
  padding: 12px 16px;
  color: @quest-text;
  font-weight: 800;
  cursor: pointer;
  background: rgba(15, 45, 58, 0.96);
  border: 1px solid @quest-sheikah;
  border-radius: 16px;
  box-shadow: 0 0 30px rgba(60, 211, 252, 0.18);
  transform: translateX(-50%);
  animation: sentence-tetris-fall 4.4s linear forwards;
}

.sentence-tetris__falling.is-selected {
  border-color: @quest-gold;
  box-shadow: 0 0 34px rgba(252, 196, 19, 0.28);
}

.sentence-tetris__frame {
  display: grid;
  grid-template-columns: 1.25fr 1fr 1fr 44px;
  gap: 10px;
  align-items: center;
  margin-top: 14px;
  padding: 14px;
  background: rgba(4, 10, 14, 0.55);
  border: 1px solid rgba(60, 211, 252, 0.18);
  border-radius: 22px;
}

.sentence-tetris__fixed,
.sentence-tetris__slot,
.sentence-tetris__qmark {
  display: grid;
  min-height: 94px;
  place-items: center;
  padding: 8px;
  font-weight: 900;
  text-align: center;
  border-radius: 18px;
}

.sentence-tetris__fixed {
  color: @quest-sheikah;
  background: rgba(60, 211, 252, 0.1);
  border: 1px solid rgba(60, 211, 252, 0.32);
}

.sentence-tetris__slot {
  color: rgba(255, 230, 167, 0.74);
  font-size: 15px;
  cursor: pointer;
  background: rgba(252, 196, 19, 0.07);
  border: 1px dashed rgba(252, 196, 19, 0.46);
}

.sentence-tetris__slot.filled {
  color: @quest-text;
  background: rgba(252, 196, 19, 0.16);
  border-style: solid;
  box-shadow: 0 0 24px rgba(252, 196, 19, 0.12);
}

.sentence-tetris__qmark {
  padding: 0;
  color: @quest-gold;
  font-size: 28px;
}

.sentence-tetris__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.sentence-tetris__controls button {
  padding: 11px 16px;
  color: @quest-text;
  font-weight: 800;
  cursor: pointer;
  background: rgba(60, 211, 252, 0.12);
  border: 1px solid rgba(60, 211, 252, 0.35);
  border-radius: 999px;
}

.sentence-tetris__controls button:hover {
  border-color: @quest-sheikah;
  box-shadow: 0 0 24px rgba(60, 211, 252, 0.16);
  transform: translateY(-1px);
}

.sentence-tetris__controls .sentence-tetris__start {
  color: #ffe6a7;
  background: rgba(252, 196, 19, 0.16);
  border-color: rgba(252, 196, 19, 0.42);
}

.sentence-tetris__feedback {
  min-height: 46px;
  margin: 16px 0 0;
}

.sentence-tetris__feedback.is-good { color: #8ff38a; }
.sentence-tetris__feedback.is-bad { color: #ff6f7d; }

.sentence-tetris__back {
  justify-self: center;
  color: @quest-muted;
  font-size: 14px;
  text-decoration: none;
}

.sentence-tetris__back:hover { color: @quest-sheikah; }

@keyframes sentence-tetris-fall {
  from { top: -52px; }
  to { top: 292px; }
}

@media (max-width: 980px) {
  .sentence-tetris__header { grid-template-columns: 1fr; }
  .sentence-tetris__frame { grid-template-columns: 1fr; }
  .sentence-tetris__qmark { min-height: 34px; }
}
</style>
