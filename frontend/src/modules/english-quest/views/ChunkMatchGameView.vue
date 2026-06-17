<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import HyrulePanel from '../components/HyrulePanel.vue'
import { activities, closingExpressions, friendResponses, miniGames, timeExpressions } from '../data/questContent'
import { useEnglishQuestStore } from '../store'

type MatchCard = {
  id: string
  pairId: string
  text: string
  side: 'en' | 'zh'
}

const store = useEnglishQuestStore()
const selectedCardIds = ref<string[]>([])
const matchedPairIds = ref<string[]>([])
const message = ref('先点一张英文卡，再点对应中文卡。')

const game = miniGames.find((item) => item.id === 'chunk-match')
const sourcePairs = [
  ...activities.map((item) => ({ id: item.id, en: item.text, zh: item.zh })),
  ...timeExpressions.map((item) => ({ id: item.id, en: item.text, zh: item.zh })),
  ...friendResponses.map((item) => ({ id: item.id, en: item.text, zh: item.zh })),
  ...closingExpressions.map((item) => ({ id: item.id, en: item.text, zh: item.zh })),
]

const cards = computed<MatchCard[]>(() =>
  sourcePairs.flatMap((pair) => [
    { id: `${pair.id}-en`, pairId: pair.id, text: pair.en, side: 'en' },
    { id: `${pair.id}-zh`, pairId: pair.id, text: pair.zh, side: 'zh' },
  ]).sort((a, b) => ((a.id.length + a.text.length) % 7) - ((b.id.length + b.text.length) % 7)),
)

const activeCards = computed(() => cards.value.filter((card) => !matchedPairIds.value.includes(card.pairId)))
const cleared = computed(() => matchedPairIds.value.length === sourcePairs.length)

function selectCard(card: MatchCard) {
  if (matchedPairIds.value.includes(card.pairId)) return
  if (selectedCardIds.value.includes(card.id)) {
    selectedCardIds.value = selectedCardIds.value.filter((id) => id !== card.id)
    return
  }

  const next = [...selectedCardIds.value, card.id].slice(-2)
  selectedCardIds.value = next
  if (next.length < 2) return

  const selectedCards = cards.value.filter((item) => next.includes(item.id))
  const isMatch = selectedCards[0]?.pairId === selectedCards[1]?.pairId && selectedCards[0]?.side !== selectedCards[1]?.side
  if (isMatch) {
    matchedPairIds.value.push(card.pairId)
    selectedCardIds.value = []
    message.value = '匹配成功！'
    return
  }

  message.value = '这两张不是一组，再试一次。'
  selectedCardIds.value = []
}

function completeGame() {
  if (game) store.completeMiniGame(game.id, game.skillKeys)
  message.value = '本轮练习完成，掌握度已提升。'
}
</script>

<template>
  <main class="quest-screen chunk-match">
    <header class="chunk-match__header">
      <p class="quest-kicker">Optional Practice</p>
      <h2 class="quest-title">语块消消乐</h2>
      <p class="quest-copy">匹配英文和中文，消掉全部语块卡。</p>
    </header>

    <section class="chunk-match__status">
      <span>{{ matchedPairIds.length }}/{{ sourcePairs.length }}</span>
      <strong>{{ message }}</strong>
    </section>

    <section class="chunk-match__grid" aria-label="语块消消乐卡片">
      <button
        v-for="card in activeCards"
        :key="card.id"
        type="button"
        class="chunk-match__card"
        :class="[`chunk-match__card--${card.side}`, { 'is-selected': selectedCardIds.includes(card.id) }]"
        @click="selectCard(card)"
      >
        <small>{{ card.side === 'en' ? 'EN' : '中文' }}</small>
        <strong>{{ card.text }}</strong>
      </button>
    </section>

    <HyrulePanel title="练习结算" kicker="Result" :glow="cleared">
      <div class="chunk-match__actions">
        <button type="button" :disabled="!cleared" @click="completeGame">完成本轮练习</button>
        <RouterLink :to="{ name: 'english-quest-training' }">返回训练场</RouterLink>
      </div>
    </HyrulePanel>
  </main>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.chunk-match {
  display: grid;
  align-content: start;
  gap: 14px;
}

.chunk-match__header {
  display: grid;
  gap: 10px;
}

.chunk-match__header p {
  margin: 0;
}

.chunk-match__status {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 11px;
  color: @quest-text;
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid @quest-border;
}

.chunk-match__status span {
  color: @quest-gold;
  font-weight: 700;
}

.chunk-match__status strong {
  color: @quest-muted;
  font-size: 12px;
  font-style: italic;
}

.chunk-match__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.chunk-match__card {
  display: grid;
  min-height: 86px;
  align-content: center;
  gap: 6px;
  padding: 10px;
  color: @quest-text;
  text-align: left;
  background: rgba(0, 0, 0, 0.44);
  border: 1px solid @quest-border;
  cursor: pointer;
}

.chunk-match__card small {
  color: @quest-sheikah;
  font-size: 10px;
  font-style: italic;
}

.chunk-match__card strong {
  font-size: 13px;
  line-height: 1.25;
}

.chunk-match__card--zh small {
  color: @quest-gold;
}

.chunk-match__card.is-selected {
  border-color: @quest-sheikah;
  box-shadow: 0 0 16px rgba(60, 211, 252, 0.2);
}

.chunk-match__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}

.chunk-match__actions button,
.chunk-match__actions a {
  min-height: 42px;
  display: grid;
  place-items: center;
  padding: 10px;
  color: @quest-text;
  text-align: center;
  text-decoration: none;
  background: rgba(60, 211, 252, 0.16);
  border: 1px solid @quest-sheikah;
}

.chunk-match__actions button:disabled {
  cursor: default;
  opacity: 0.45;
}
</style>
