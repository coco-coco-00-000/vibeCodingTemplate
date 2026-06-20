<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { activities, miniGames, timeExpressions } from '../data/questContent'
import { useEnglishQuestStore } from '../store'

type TileCategory = 'activity' | 'time' | 'phrase'
type TilePosition = { id: number; x: number; y: number; z: number }
type PairDefinition = { id: string; english: string; match: string; category: TileCategory; matchKind: 'zh' | 'emoji' }
type MatchTile = {
  id: number
  pairId: string
  text: string
  category: TileCategory
  isEnglish: boolean
  isEmoji: boolean
  position: TilePosition
  matched: boolean
  vanishing: boolean
}

const tileWidth = 116
const tileHeight = 118
const store = useEnglishQuestStore()
const game = miniGames.find((item) => item.id === 'chunk-match')
const score = ref(0)
const selectedTileId = ref<number | null>(null)
const tiles = ref<MatchTile[]>([])
const message = ref('先找出没有被压住、也没有被左右夹住的牌。英文牌点击后会朗读。')
let matchTimer: ReturnType<typeof window.setTimeout> | undefined

const pairs: PairDefinition[] = [
  ...activities.map((activity) => ({
    id: `${activity.id}-zh`,
    english: activity.text,
    match: activity.zh,
    category: 'activity' as const,
    matchKind: 'zh' as const,
  })),
  ...activities.map((activity) => ({
    id: `${activity.id}-emoji`,
    english: activity.text,
    match: activity.emoji,
    category: 'activity' as const,
    matchKind: 'emoji' as const,
  })),
  ...timeExpressions.map((time) => ({
    id: `${time.id}-zh`,
    english: time.text,
    match: time.zh,
    category: 'time' as const,
    matchKind: 'zh' as const,
  })),
  { id: 'invite-pattern', english: 'Do you want to ...?', match: '你想要……吗？', category: 'phrase', matchKind: 'zh' },
  { id: 'sounds-good', english: 'Sounds good.', match: '听起来不错。', category: 'phrase', matchKind: 'zh' },
  { id: 'sorry-cant', english: "Sorry, I can't.", match: '抱歉，我不行。', category: 'phrase', matchKind: 'zh' },
  { id: 'see-you-then', english: 'Great! See you then.', match: '太好了，到时候见。', category: 'phrase', matchKind: 'zh' },
  { id: 'no-problem', english: 'No problem.', match: '没关系。', category: 'phrase', matchKind: 'zh' },
]

const activeTiles = computed(() => tiles.value.filter((tile) => !tile.matched))
const pairsLeft = computed(() => activeTiles.value.length / 2)
const allCleared = computed(() => activeTiles.value.length === 0)

function shuffle<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[randomIndex]] = [result[randomIndex], result[index]]
  }
  return result
}

function generatePositions(): TilePosition[] {
  const positions: TilePosition[] = []
  let id = 0
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 6; column += 1) positions.push({ id: id++, x: column + 1, y: row + 1, z: 0 })
  }
  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 4; column += 1) positions.push({ id: id++, x: column + 2, y: row + 2, z: 1 })
  }
  positions.push(
    { id: id++, x: 3, y: 2.5, z: 2 },
    { id: id++, x: 4, y: 2.5, z: 2 },
    { id: id++, x: 3, y: 3.5, z: 2 },
    { id: id++, x: 4, y: 3.5, z: 2 },
  )
  return positions
}

function isBlockedInList(target: TilePosition, list: TilePosition[]) {
  let hasLeft = false
  let hasRight = false
  for (const other of list) {
    if (other.id === target.id) continue
    if (other.z > target.z && Math.abs(other.x - target.x) < 0.8 && Math.abs(other.y - target.y) < 0.8) return true
    if (other.z === target.z && Math.abs(other.y - target.y) < 0.5) {
      if (other.x < target.x && target.x - other.x < 1.1) hasLeft = true
      if (other.x > target.x && other.x - target.x < 1.1) hasRight = true
    }
  }
  return hasLeft && hasRight
}

function assignSolvableTiles() {
  const available = generatePositions()
  const assigned: MatchTile[] = []
  for (const pair of shuffle(pairs)) {
    const freeIndexes = available.reduce<number[]>((indexes, position, index) => {
      if (!isBlockedInList(position, available)) indexes.push(index)
      return indexes
    }, [])
    const firstIndex = freeIndexes.splice(Math.floor(Math.random() * freeIndexes.length), 1)[0]
    const secondIndex = freeIndexes[Math.floor(Math.random() * freeIndexes.length)]
    const firstPosition = available[firstIndex]
    const secondPosition = available[secondIndex]

    assigned.push(
      { id: firstPosition.id, pairId: pair.id, text: pair.english, category: pair.category, isEnglish: true, isEmoji: false, position: firstPosition, matched: false, vanishing: false },
      { id: secondPosition.id, pairId: pair.id, text: pair.match, category: pair.category, isEnglish: false, isEmoji: pair.matchKind === 'emoji', position: secondPosition, matched: false, vanishing: false },
    )
    for (const index of [firstIndex, secondIndex].sort((a, b) => b - a)) available.splice(index, 1)
  }
  return assigned
}

function isBlocked(tile: MatchTile) {
  return isBlockedInList(tile.position, activeTiles.value.map((item) => item.position))
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
}

function newGame() {
  if (matchTimer) window.clearTimeout(matchTimer)
  matchTimer = undefined
  score.value = 0
  selectedTileId.value = null
  tiles.value = assignSolvableTiles()
  message.value = '先找出没有被压住、也没有被左右夹住的牌。英文牌点击后会朗读。'
}

function finishMatch(first: MatchTile, second: MatchTile) {
  tiles.value = tiles.value.map((tile) => (tile.id === first.id || tile.id === second.id ? { ...tile, vanishing: true } : tile))
  message.value = '匹配成功，继续找下一对。'
  matchTimer = window.setTimeout(() => {
    tiles.value = tiles.value.map((tile) => (tile.id === first.id || tile.id === second.id ? { ...tile, matched: true } : tile))
    selectedTileId.value = null
    score.value += 100
    if (allCleared.value) {
      message.value = '本轮全部消除，掌握度已提升。'
      if (game) store.completeMiniGame(game.id, game.skillKeys)
    }
  }, 300)
}

function selectTile(tile: MatchTile) {
  if (tile.matched || tile.vanishing || isBlocked(tile)) return
  if (tile.isEnglish) speak(tile.text)
  if (selectedTileId.value === tile.id) {
    selectedTileId.value = null
    return
  }
  const selectedTile = activeTiles.value.find((item) => item.id === selectedTileId.value)
  if (!selectedTile) {
    selectedTileId.value = tile.id
    return
  }
  if (selectedTile.pairId === tile.pairId) {
    finishMatch(selectedTile, tile)
    return
  }
  selectedTileId.value = tile.id
  message.value = '这两张不是一组，已切换到新选择的牌。'
}

newGame()

onBeforeUnmount(() => {
  if (matchTimer) window.clearTimeout(matchTimer)
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
})
</script>

<template>
  <main class="quest-screen chunk-match">
    <header class="chunk-match__header">
      <div class="chunk-match__stat"><span>得分</span><strong>{{ score }}</strong></div>
      <div class="chunk-match__stat"><span>剩余对数</span><strong>{{ pairsLeft }}</strong></div>
      <button type="button" class="chunk-match__restart" @click="newGame">新开一局</button>
    </header>

    <section class="chunk-match__intro">
      <p class="quest-kicker">Optional Practice</p>
      <h2 class="quest-title">语块消消乐</h2>
      <p class="quest-copy">消掉没有被挡住的配对牌。英文牌会朗读，英文可与中文或 emoji 配对。</p>
    </section>

    <p class="chunk-match__message" :class="{ 'is-complete': allCleared }">{{ message }}</p>

    <section class="chunk-match__board" aria-label="语块消消乐牌局">
      <button
        v-for="tile in activeTiles"
        :key="tile.id"
        type="button"
        class="chunk-match__tile"
        :class="[
          `chunk-match__tile--${tile.category}`,
          {
            'is-selected': selectedTileId === tile.id,
            'is-blocked': isBlocked(tile),
            'is-emoji': tile.isEmoji,
            'is-vanishing': tile.vanishing,
          },
        ]"
        :style="{
          left: `${tile.position.x * tileWidth}px`,
          top: `${tile.position.y * tileHeight}px`,
          zIndex: tile.position.z * 10 + 1,
        }"
        @click="selectTile(tile)"
      >
        <span class="chunk-match__tile-index">{{ tile.position.id + 1 }}</span>
        <strong>{{ tile.text }}</strong>
        <small>{{ tile.isEnglish ? 'EN' : tile.isEmoji ? '图示' : '中文' }}</small>
      </button>
    </section>

    <RouterLink :to="{ name: 'english-quest-training' }" class="chunk-match__back">返回语言训练场</RouterLink>
  </main>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.chunk-match {
  display: grid;
  justify-items: center;
  gap: 16px;
  padding-bottom: 40px;
}

.chunk-match__header {
  width: min(930px, 100%);
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 54px;
  padding: 10px 20px;
  background: rgba(7, 18, 25, 0.78);
  border: 1px solid rgba(60, 211, 252, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.22);
}

.chunk-match__stat {
  display: grid;
  justify-items: center;
}

.chunk-match__stat span {
  color: @quest-muted;
  font-size: 11px;
}

.chunk-match__stat strong {
  color: @quest-text;
  font-size: 20px;
}

.chunk-match__restart {
  padding: 9px 18px;
  color: @quest-text;
  font-weight: 700;
  cursor: pointer;
  background: rgba(60, 211, 252, 0.12);
  border: 1px solid rgba(60, 211, 252, 0.38);
  border-radius: 999px;
}

.chunk-match__intro {
  width: min(930px, 100%);
  display: grid;
  gap: 7px;
}

.chunk-match__intro p {
  margin: 0;
}

.chunk-match__message {
  width: min(930px, 100%);
  min-height: 48px;
  margin: 0;
  padding: 13px 18px;
  color: @quest-muted;
  font-size: 14px;
  line-height: 1.45;
  background: rgba(7, 18, 25, 0.72);
  border-left: 4px solid @quest-sheikah;
}

.chunk-match__message.is-complete { border-left-color: #8ff38a; }

.chunk-match__board {
  position: relative;
  width: 930px;
  height: 720px;
  overflow: hidden;
  background:
    linear-gradient(rgba(60, 211, 252, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(60, 211, 252, 0.05) 1px, transparent 1px),
    rgba(4, 10, 14, 0.46);
  background-size: 40px 40px;
  border: 1px solid rgba(60, 211, 252, 0.22);
  border-radius: 8px;
}

.chunk-match__tile {
  position: absolute;
  width: 116px;
  height: 118px;
  display: grid;
  place-items: center;
  padding: 17px 8px 15px;
  color: @quest-text;
  cursor: pointer;
  background: #26312c;
  border: 1px solid rgba(233, 225, 209, 0.52);
  border-top: 5px solid @quest-sheikah;
  border-radius: 8px;
  box-shadow: -1px -1px 0 rgba(255, 255, 255, 0.1), 3px 4px 0 #111a16, 4px 5px 8px rgba(0, 0, 0, 0.42);
  transition: transform 0.1s, filter 0.2s;
}

.chunk-match__tile--phrase { border-top-color: #8ff38a; }

.chunk-match__tile strong {
  width: 100%;
  font-size: 14px;
  line-height: 1.25;
  text-align: center;
  overflow-wrap: anywhere;
  white-space: normal;
}

.chunk-match__tile.is-emoji strong {
  font-size: 38px;
  line-height: 1;
  overflow-wrap: normal;
}

.chunk-match__tile-index,
.chunk-match__tile small {
  position: absolute;
  color: rgba(233, 225, 209, 0.5);
  font-size: 9px;
}

.chunk-match__tile-index { top: 4px; left: 6px; }
.chunk-match__tile small { right: 6px; bottom: 4px; }

.chunk-match__tile:hover:not(.is-blocked) { transform: translate(-1px, -1px); }

.chunk-match__tile.is-selected {
  z-index: 999 !important;
  background: #3a3926;
  box-shadow: 0 0 0 2px @quest-gold, 3px 4px 0 #111a16, 4px 5px 8px rgba(0, 0, 0, 0.42);
  transform: translateY(-5px);
}

.chunk-match__tile.is-blocked {
  cursor: not-allowed;
  filter: brightness(0.55) grayscale(0.45);
}

.chunk-match__tile.is-vanishing { animation: chunk-match-vanish 0.3s forwards; }

.chunk-match__back {
  color: @quest-muted;
  font-size: 14px;
  text-decoration: none;
}

.chunk-match__back:hover { color: @quest-sheikah; }

@keyframes chunk-match-vanish {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.1); }
}

@media (max-width: 860px) {
  .chunk-match__board { transform: scale(0.75); transform-origin: top center; margin-bottom: -150px; }
}
</style>
