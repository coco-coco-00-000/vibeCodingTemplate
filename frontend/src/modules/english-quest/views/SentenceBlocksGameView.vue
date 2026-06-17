<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import HyrulePanel from '../components/HyrulePanel.vue'
import { activities, miniGames, timeExpressions } from '../data/questContent'
import { useEnglishQuestStore } from '../store'

const store = useEnglishQuestStore()
const activityId = ref(activities[0].id)
const timeId = ref(timeExpressions[0].id)
const completed = ref(false)
const game = miniGames.find((item) => item.id === 'sentence-blocks')

const activity = computed(() => activities.find((item) => item.id === activityId.value) ?? activities[0])
const time = computed(() => timeExpressions.find((item) => item.id === timeId.value) ?? timeExpressions[0])
const sentence = computed(() => `Do you want to ${activity.value.text} ${time.value.text}?`)

function completeGame() {
  if (game) store.completeMiniGame(game.id, game.skillKeys)
  completed.value = true
}
</script>

<template>
  <main class="quest-screen sentence-blocks">
    <header class="sentence-blocks__header">
      <p class="quest-kicker">Optional Practice</p>
      <h2 class="quest-title">句型小游戏</h2>
      <p class="quest-copy">抓住活动块和时间块，放进邀请句。</p>
    </header>

    <HyrulePanel title="任务目标" kicker="Quest" glow>
      <div class="sentence-blocks__target">
        <span aria-hidden="true">{{ activity.emoji }}</span>
        <strong>{{ activity.zh }}</strong>
        <small>{{ time.zh }}</small>
      </div>
    </HyrulePanel>

    <section class="sentence-blocks__sentence" aria-label="完整邀请句">
      <span>Do you want to</span>
      <strong>{{ activity.text }}</strong>
      <strong>{{ time.text }}</strong>
      <span>?</span>
    </section>

    <HyrulePanel title="选择活动块" kicker="Activity">
      <div class="sentence-blocks__choices">
        <button
          v-for="item in activities"
          :key="item.id"
          type="button"
          :class="{ selected: item.id === activityId }"
          @click="activityId = item.id"
        >
          <span aria-hidden="true">{{ item.emoji }}</span>
          <strong>{{ item.text }}</strong>
        </button>
      </div>
    </HyrulePanel>

    <HyrulePanel title="选择时间块" kicker="Time">
      <div class="sentence-blocks__choices sentence-blocks__choices--time">
        <button
          v-for="item in timeExpressions"
          :key="item.id"
          type="button"
          :class="{ selected: item.id === timeId }"
          @click="timeId = item.id"
        >
          {{ item.text }}
        </button>
      </div>
    </HyrulePanel>

    <HyrulePanel title="练习结算" kicker="Result">
      <div class="sentence-blocks__actions">
        <p>{{ completed ? '本轮练习完成，掌握度已提升。' : sentence }}</p>
        <button type="button" @click="completeGame">完成本轮练习</button>
        <RouterLink :to="{ name: 'english-quest-training' }">返回训练场</RouterLink>
      </div>
    </HyrulePanel>
  </main>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.sentence-blocks {
  display: grid;
  align-content: start;
  gap: 14px;
}

.sentence-blocks__header {
  display: grid;
  gap: 10px;
}

.sentence-blocks__header p {
  margin: 0;
}

.sentence-blocks__target {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.sentence-blocks__target span {
  font-size: 28px;
}

.sentence-blocks__target small {
  color: @quest-muted;
  font-style: italic;
}

.sentence-blocks__sentence {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 14px;
  color: @quest-text;
  background: rgba(0, 0, 0, 0.46);
  border: 1px solid rgba(252, 196, 19, 0.42);
  box-shadow: inset 0 0 0 1px rgba(60, 211, 252, 0.14);
}

.sentence-blocks__sentence strong {
  padding: 8px 10px;
  color: @quest-gold;
  background: rgba(252, 196, 19, 0.1);
  border: 1px solid rgba(252, 196, 19, 0.42);
}

.sentence-blocks__choices,
.sentence-blocks__actions {
  display: grid;
  gap: 8px;
}

.sentence-blocks__choices {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.sentence-blocks__choices--time {
  grid-template-columns: 1fr;
}

.sentence-blocks__choices button,
.sentence-blocks__actions button,
.sentence-blocks__actions a {
  min-height: 42px;
  display: grid;
  align-items: center;
  gap: 5px;
  padding: 10px;
  color: @quest-text;
  text-align: left;
  text-decoration: none;
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid @quest-border;
  cursor: pointer;
}

.sentence-blocks__choices button.selected {
  border-color: @quest-sheikah;
  background: rgba(60, 211, 252, 0.16);
}

.sentence-blocks__choices span {
  font-size: 22px;
}

.sentence-blocks__choices strong {
  font-size: 13px;
}

.sentence-blocks__actions p {
  color: @quest-muted;
  font-size: 12px;
  font-style: italic;
  line-height: 1.4;
}

.sentence-blocks__actions button,
.sentence-blocks__actions a {
  text-align: center;
  place-items: center;
  background: rgba(60, 211, 252, 0.16);
  border-color: @quest-sheikah;
}
</style>
