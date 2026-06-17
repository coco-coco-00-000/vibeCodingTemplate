<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import HyrulePanel from '../components/HyrulePanel.vue'
import { activities, miniGames, timeExpressions } from '../data/questContent'
import { useEnglishQuestStore } from '../store'

type SlotName = 'activity' | 'time'

type FallingBlock = {
  id: string
  text: string
  type: SlotName
  lane: number
  top: number
}

const store = useEnglishQuestStore()
const game = miniGames.find((item) => item.id === 'sentence-blocks')
const running = ref(false)
const formedCount = ref(0)
const missedCount = ref(0)
const comboCount = ref(0)
const targetIndex = ref(0)
const blockSeed = ref(0)
const heldBlock = ref<FallingBlock | null>(null)
const activeBlocks = ref<FallingBlock[]>([])
const slots = ref<Record<SlotName, string>>({ activity: '', time: '' })
let timer: ReturnType<typeof window.setInterval> | undefined

const tasks = [
  { friend: 'Alex', activityId: 'go-swimming', timeId: 'this-saturday', zh: '邀请 Alex 这周六去游泳。' },
  { friend: 'Mia', activityId: 'watch-a-movie', timeId: 'tomorrow', zh: '邀请 Mia 明天去看电影。' },
  { friend: 'Leo', activityId: 'play-video-games', timeId: 'this-sunday', zh: '邀请 Leo 这周日打电子游戏。' },
]

const target = computed(() => tasks[targetIndex.value])
const targetActivity = computed(() => activities.find((item) => item.id === target.value.activityId) ?? activities[0])
const targetTime = computed(() => timeExpressions.find((item) => item.id === target.value.timeId) ?? timeExpressions[0])
const sentence = computed(() => `Do you want to ${slots.value.activity || 'activity'} ${slots.value.time || 'time'}?`)
const isCompleteSentence = computed(
  () => slots.value.activity === targetActivity.value.text && slots.value.time === targetTime.value.text,
)

const blockPool = computed(() => [
  ...activities.map((item) => ({ text: item.text, type: 'activity' as const })),
  ...timeExpressions.map((item) => ({ text: item.text, type: 'time' as const })),
])

function nextBlock() {
  const targetItems = [
    { text: targetActivity.value.text, type: 'activity' as const },
    { text: targetTime.value.text, type: 'time' as const },
  ]
  const shouldDropTarget = blockSeed.value % 3 !== 2
  const pool = shouldDropTarget ? targetItems : blockPool.value
  const item = pool[blockSeed.value % pool.length]
  const block: FallingBlock = {
    id: `block-${blockSeed.value}`,
    text: item.text,
    type: item.type,
    lane: blockSeed.value % 3,
    top: 0,
  }
  blockSeed.value += 1
  activeBlocks.value = [...activeBlocks.value, block].slice(-5)
}

function tick() {
  activeBlocks.value = activeBlocks.value
    .map((block) => ({ ...block, top: block.top + 14 }))
    .filter((block) => {
      if (block.top <= 84) return true
      missedCount.value += 1
      comboCount.value = 0
      return false
    })
  if (activeBlocks.value.length < 4) nextBlock()
}

function startGame() {
  if (running.value) return
  running.value = true
  if (!activeBlocks.value.length) nextBlock()
  timer = window.setInterval(tick, 720)
}

function pauseGame() {
  running.value = false
  if (timer) window.clearInterval(timer)
}

function resetGame() {
  pauseGame()
  formedCount.value = 0
  missedCount.value = 0
  comboCount.value = 0
  blockSeed.value = 0
  heldBlock.value = null
  activeBlocks.value = []
  slots.value = { activity: '', time: '' }
}

function catchBlock(block: FallingBlock) {
  heldBlock.value = block
  activeBlocks.value = activeBlocks.value.filter((item) => item.id !== block.id)
}

function placeHeldBlock(slotName: SlotName) {
  if (!heldBlock.value) return
  if (heldBlock.value.type !== slotName) {
    missedCount.value += 1
    comboCount.value = 0
    heldBlock.value = null
    return
  }
  slots.value = { ...slots.value, [slotName]: heldBlock.value.text }
  heldBlock.value = null
  if (slots.value.activity && slots.value.time) checkSentence()
}

function checkSentence() {
  if (!isCompleteSentence.value) {
    missedCount.value += 1
    comboCount.value = 0
    slots.value = { activity: '', time: '' }
    return
  }

  formedCount.value += 1
  comboCount.value += 1
  slots.value = { activity: '', time: '' }
  targetIndex.value = (targetIndex.value + 1) % tasks.length
  if (formedCount.value >= 3 && game) store.completeMiniGame(game.id, game.skillKeys)
}

onBeforeUnmount(() => {
  pauseGame()
})
</script>

<template>
  <main class="quest-screen sentence-tetris">
    <header class="sentence-tetris__header">
      <p class="quest-kicker">Weekend Invite · Demo</p>
      <h2 class="quest-title">句子俄罗斯方块</h2>
      <p class="quest-copy">抓住下落词块，填进 activity 和 time 槽。</p>
    </header>

    <section class="sentence-tetris__stats">
      <div>
        <span>成句</span>
        <strong>{{ formedCount }}</strong>
      </div>
      <div>
        <span>漏接</span>
        <strong>{{ missedCount }}</strong>
      </div>
      <div>
        <span>连击</span>
        <strong>{{ comboCount }}</strong>
      </div>
    </section>

    <section class="sentence-tetris__task">任务：{{ target.zh }}</section>

    <section class="sentence-tetris__board" aria-label="下落词块区域">
      <button
        v-for="block in activeBlocks"
        :key="block.id"
        type="button"
        class="sentence-tetris__falling"
        :class="`sentence-tetris__falling--${block.type}`"
        :style="{ left: `${block.lane * 31 + 4}%`, top: `${block.top}%` }"
        @click="catchBlock(block)"
      >
        {{ block.text }}
      </button>
      <div v-if="!running && !activeBlocks.length" class="sentence-tetris__empty">点击开始下落</div>
    </section>

    <HyrulePanel title="句型槽" kicker="Pattern">
      <div class="sentence-tetris__slots">
        <div class="sentence-tetris__fixed">Do you want to</div>
        <button type="button" class="sentence-tetris__slot" :class="{ filled: slots.activity }" @click="placeHeldBlock('activity')">
          {{ slots.activity || 'activity' }}
        </button>
        <button type="button" class="sentence-tetris__slot" :class="{ filled: slots.time }" @click="placeHeldBlock('time')">
          {{ slots.time || 'time' }}
        </button>
        <div class="sentence-tetris__fixed">?</div>
      </div>
      <p class="sentence-tetris__held">当前抓住：{{ heldBlock?.text || '无' }}</p>
      <p class="sentence-tetris__preview">{{ sentence }}</p>
    </HyrulePanel>

    <section class="sentence-tetris__controls">
      <button type="button" @click="startGame">开始下落</button>
      <button type="button" @click="pauseGame">暂停</button>
      <button type="button" @click="resetGame">重置</button>
    </section>

    <RouterLink :to="{ name: 'english-quest-training' }" class="sentence-tetris__back">返回训练场</RouterLink>
  </main>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.sentence-tetris {
  display: grid;
  align-content: start;
  gap: 12px;
}

.sentence-tetris__header {
  display: grid;
  gap: 8px;
}

.sentence-tetris__header p {
  margin: 0;
}

.sentence-tetris__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.sentence-tetris__stats div,
.sentence-tetris__task,
.sentence-tetris__board,
.sentence-tetris__controls,
.sentence-tetris__back {
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid @quest-border;
}

.sentence-tetris__stats div {
  display: grid;
  gap: 4px;
  padding: 10px;
}

.sentence-tetris__stats span {
  color: @quest-muted;
  font-size: 12px;
  font-style: italic;
}

.sentence-tetris__stats strong {
  color: @quest-gold;
  font-size: 24px;
  line-height: 1;
}

.sentence-tetris__task {
  padding: 11px;
  color: @quest-gold;
  font-size: 13px;
  line-height: 1.35;
  border-color: rgba(252, 196, 19, 0.38);
}

.sentence-tetris__board {
  position: relative;
  height: 260px;
  overflow: hidden;
  background:
    linear-gradient(rgba(60, 211, 252, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(60, 211, 252, 0.06) 1px, transparent 1px),
    rgba(0, 0, 0, 0.5);
  background-size: 38px 38px;
  border-color: rgba(60, 211, 252, 0.38);
}

.sentence-tetris__falling {
  position: absolute;
  width: 29%;
  min-height: 42px;
  padding: 8px;
  color: @quest-text;
  font-size: 12px;
  font-weight: 700;
  background: rgba(60, 211, 252, 0.16);
  border: 1px solid @quest-sheikah;
  cursor: pointer;
}

.sentence-tetris__falling--time {
  color: @quest-gold;
  background: rgba(252, 196, 19, 0.12);
  border-color: rgba(252, 196, 19, 0.52);
}

.sentence-tetris__empty {
  display: grid;
  height: 100%;
  place-items: center;
  color: @quest-muted;
  font-style: italic;
}

.sentence-tetris__slots {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.sentence-tetris__fixed,
.sentence-tetris__slot {
  min-height: 42px;
  display: grid;
  place-items: center;
  padding: 9px;
  color: @quest-text;
  text-align: center;
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid @quest-border;
}

.sentence-tetris__fixed {
  border-color: rgba(60, 211, 252, 0.42);
}

.sentence-tetris__slot {
  color: rgba(233, 225, 209, 0.64);
  border-style: dashed;
  cursor: pointer;
}

.sentence-tetris__slot.filled {
  color: @quest-gold;
  border-style: solid;
  border-color: rgba(252, 196, 19, 0.54);
}

.sentence-tetris__held,
.sentence-tetris__preview {
  margin: 10px 0 0;
  color: @quest-muted;
  font-size: 12px;
  font-style: italic;
}

.sentence-tetris__preview {
  color: @quest-gold;
}

.sentence-tetris__controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 10px;
}

.sentence-tetris__controls button,
.sentence-tetris__back {
  min-height: 40px;
  display: grid;
  place-items: center;
  padding: 9px;
  color: @quest-text;
  text-align: center;
  text-decoration: none;
  background: rgba(60, 211, 252, 0.16);
  border: 1px solid @quest-sheikah;
  cursor: pointer;
}
</style>
