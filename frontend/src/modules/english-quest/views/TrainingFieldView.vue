<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import HyrulePanel from '../components/HyrulePanel.vue'
import MasteryMeter from '../components/MasteryMeter.vue'
import { useQuestProgress } from '../composables/useQuestProgress'

const { completedTrainingStepIds, mastery, miniGames, store, trainingLevels, trainingProgress } = useQuestProgress()

const levelIndex = ref(0)
const questionIndex = ref(0)
const selectedOptionId = ref('')
const revealed = ref(false)
const tappedOptionIds = ref<string[]>([])

const currentLevel = computed(() => trainingLevels[levelIndex.value])
const currentQuestion = computed(() => currentLevel.value.questions[questionIndex.value])
const isLastQuestion = computed(() => questionIndex.value >= currentLevel.value.questions.length - 1)
const isCurrentLevelComplete = computed(() => completedTrainingStepIds.value.includes(currentLevel.value.id))
const levelCounter = computed(() => `${levelIndex.value + 1}/${trainingLevels.length}`)

const selectedCorrect = computed(() => {
  if (!currentQuestion.value.correctOptionId) return false
  return selectedOptionId.value === currentQuestion.value.correctOptionId
})

const canContinue = computed(() => {
  if (currentLevel.value.kind === 'activity-cards') {
    return tappedOptionIds.value.length === (currentQuestion.value.options?.length ?? 0)
  }
  if (currentLevel.value.kind === 'choice') return selectedCorrect.value
  return revealed.value || isCurrentLevelComplete.value
})

watch([levelIndex, questionIndex], () => {
  selectedOptionId.value = ''
  revealed.value = false
  tappedOptionIds.value = []
})

function selectOption(optionId: string) {
  selectedOptionId.value = optionId
  if (optionId === currentQuestion.value.correctOptionId) revealed.value = true
}

function revealAnswer() {
  revealed.value = true
}

function tapCard(optionId: string) {
  if (!tappedOptionIds.value.includes(optionId)) tappedOptionIds.value.push(optionId)
}

function completeLevel() {
  if (!isLastQuestion.value) {
    questionIndex.value += 1
    return
  }
  if (!isCurrentLevelComplete.value) store.completeTrainingStep(currentLevel.value.id)
  if (levelIndex.value < trainingLevels.length - 1) levelIndex.value += 1
}

function previousLevel() {
  if (levelIndex.value > 0) levelIndex.value -= 1
}

function nextLevel() {
  if (levelIndex.value < trainingLevels.length - 1) levelIndex.value += 1
}
</script>

<template>
  <main class="quest-screen training-field">
    <header class="training-field__header">
      <p class="quest-kicker">Training Shrine · {{ levelCounter }}</p>
      <h2 class="quest-title">Level {{ currentLevel.levelNumber }}：{{ currentLevel.title }}</h2>
      <p class="quest-copy">{{ currentLevel.screenCopy }}</p>
      <MasteryMeter label="主线进度" :value="trainingProgress" />
    </header>

    <HyrulePanel :title="currentQuestion.prompt" :kicker="currentLevel.missionId === 'mission-1' ? 'Mission 1' : 'Mission 2'" glow>
      <section class="training-field__question" :class="`training-field__question--${currentLevel.kind}`">
        <div v-if="currentQuestion.audioText" class="training-field__audio">
          <span aria-hidden="true">🔊</span>
          <strong>{{ currentQuestion.audioText }}</strong>
        </div>

        <div v-if="currentQuestion.sentence" class="training-field__sentence">
          {{ currentQuestion.sentence }}
        </div>

        <div v-if="currentLevel.kind === 'activity-cards'" class="training-field__activity-grid">
          <button
            v-for="option in currentQuestion.options"
            :key="option.id"
            type="button"
            class="training-field__activity-card"
            :class="{ 'is-revealed': tappedOptionIds.includes(option.id) }"
            @click="tapCard(option.id)"
          >
            <span aria-hidden="true">{{ option.emoji }}</span>
            <strong>{{ option.label }}</strong>
            <small>{{ option.imageLabel }}</small>
          </button>
        </div>

        <div v-else-if="currentLevel.kind === 'choice'" class="training-field__options">
          <button
            v-for="option in currentQuestion.options"
            :key="option.id"
            type="button"
            class="training-field__option"
            :class="{
              'is-selected': selectedOptionId === option.id,
              'is-correct': revealed && option.id === currentQuestion.correctOptionId,
              'is-wrong': selectedOptionId === option.id && selectedOptionId !== currentQuestion.correctOptionId,
            }"
            @click="selectOption(option.id)"
          >
            <span v-if="option.emoji" aria-hidden="true">{{ option.emoji }}</span>
            <b>{{ option.id }}</b>
            <strong>{{ option.label }}</strong>
          </button>
        </div>

        <div v-else-if="currentLevel.kind === 'matching' || currentLevel.kind === 'tagging'" class="training-field__pairs">
          <button
            v-for="pair in currentQuestion.pairs"
            :key="pair.left"
            type="button"
            class="training-field__pair"
            :class="{ 'is-revealed': revealed }"
            @click="revealAnswer"
          >
            <strong>{{ pair.left }}</strong>
            <span>{{ revealed ? pair.right : '点击查看匹配' }}</span>
          </button>
        </div>

        <div v-else-if="currentLevel.kind === 'sentence-build'" class="training-field__blocks">
          <p>乱序语块</p>
          <div class="training-field__block-row">
            <span v-for="item in currentQuestion.orderedItems" :key="item">{{ item }}</span>
          </div>
          <button type="button" class="training-field__ghost-button" @click="revealAnswer">检查排序</button>
          <div v-if="revealed" class="training-field__answer">
            {{ currentQuestion.correctOrder?.join(' ') }}?
          </div>
        </div>

        <div v-else-if="currentLevel.kind === 'repeat'" class="training-field__repeat">
          <button type="button" @click="revealAnswer">🔊 播放句子</button>
          <button type="button" @click="revealAnswer">开始录音</button>
        </div>

        <div v-else-if="currentLevel.kind === 'chat-explore'" class="training-field__chat">
          <div class="training-field__bubble training-field__bubble--me">
            {{ currentQuestion.sentence || currentQuestion.prompt }}
          </div>
          <button
            v-for="pair in currentQuestion.pairs"
            :key="pair.left"
            type="button"
            class="training-field__bubble training-field__bubble--friend"
            @click="revealAnswer"
          >
            {{ pair.left }}
            <small v-if="revealed">{{ pair.right }}</small>
          </button>
          <button v-if="!currentQuestion.pairs" type="button" class="training-field__ghost-button" @click="revealAnswer">
            点击听整句
          </button>
        </div>

        <div v-else-if="currentLevel.kind === 'dialogue-order'" class="training-field__blocks">
          <p>{{ currentQuestion.prompt }} · 乱序气泡</p>
          <div class="training-field__block-row">
            <span v-for="item in currentQuestion.orderedItems" :key="item">{{ item }}</span>
          </div>
          <button type="button" class="training-field__ghost-button" @click="revealAnswer">查看正确顺序</button>
          <ol v-if="revealed" class="training-field__order">
            <li v-for="item in currentQuestion.correctOrder" :key="item">{{ item }}</li>
          </ol>
        </div>

        <div class="training-field__feedback" :class="{ 'is-visible': revealed || selectedOptionId }">
          <template v-if="selectedOptionId && !selectedCorrect">再试一次，看看题目里的线索。</template>
          <template v-else-if="revealed">{{ currentLevel.feedback }}</template>
          <template v-else>{{ currentLevel.completion }}</template>
        </div>
      </section>
    </HyrulePanel>

    <section class="training-field__actions">
      <button type="button" :disabled="levelIndex === 0" @click="previousLevel">上一关</button>
      <button type="button" class="training-field__primary" :disabled="!canContinue" @click="completeLevel">
        {{ isLastQuestion ? '完成本关' : '下一题' }}
      </button>
      <button type="button" :disabled="levelIndex === trainingLevels.length - 1" @click="nextLevel">下一关</button>
    </section>

    <HyrulePanel v-if="levelIndex === trainingLevels.length - 1 && isCurrentLevelComplete" title="训练场完成" kicker="Unlocked">
      <div class="training-field__finish">
        <p>语言技能已准备好。现在去场景任务里，给不同朋友发出真实邀约。</p>
        <RouterLink :to="{ name: 'english-quest-scenario' }">进入场景任务</RouterLink>
        <RouterLink v-for="game in miniGames" :key="game.id" :to="{ name: game.routeName }">{{ game.title }}</RouterLink>
      </div>
    </HyrulePanel>

    <HyrulePanel title="技能掌握度" kicker="Mastery">
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
  align-content: start;
  gap: 14px;
}

.training-field__header {
  display: grid;
  gap: 10px;
}

.training-field__header p {
  margin: 0;
}

.training-field__question,
.training-field__options,
.training-field__pairs,
.training-field__blocks,
.training-field__chat,
.training-field__finish,
.training-field__mastery {
  display: grid;
  gap: 10px;
}

.training-field__audio,
.training-field__sentence,
.training-field__answer,
.training-field__feedback {
  padding: 12px;
  color: @quest-text;
  background: rgba(0, 0, 0, 0.38);
  border: 1px solid @quest-border;
}

.training-field__audio {
  display: flex;
  align-items: center;
  gap: 10px;
}

.training-field__activity-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.training-field__activity-card,
.training-field__option,
.training-field__pair,
.training-field__ghost-button,
.training-field__repeat button,
.training-field__actions button,
.training-field__finish a {
  min-height: 42px;
  padding: 10px;
  color: @quest-text;
  text-align: left;
  text-decoration: none;
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid @quest-border;
  cursor: pointer;
}

.training-field__activity-card {
  display: grid;
  min-height: 132px;
  place-items: center;
  align-content: center;
  gap: 6px;
  text-align: center;
}

.training-field__activity-card span {
  font-size: 34px;
}

.training-field__activity-card small,
.training-field__pair span,
.training-field__feedback,
.training-field__blocks p,
.training-field__bubble small,
.training-field__finish p {
  color: @quest-muted;
  font-size: 12px;
  font-style: italic;
  line-height: 1.4;
}

.training-field__option {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.training-field__option b {
  color: @quest-gold;
}

.training-field__option.is-correct,
.training-field__pair.is-revealed,
.training-field__activity-card.is-revealed {
  border-color: rgba(60, 211, 252, 0.76);
  box-shadow: 0 0 16px rgba(60, 211, 252, 0.16);
}

.training-field__option.is-wrong {
  border-color: rgba(252, 196, 19, 0.72);
}

.training-field__pair {
  display: grid;
  gap: 5px;
}

.training-field__block-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.training-field__block-row span {
  padding: 8px 10px;
  color: @quest-text;
  background: rgba(60, 211, 252, 0.13);
  border: 1px solid rgba(60, 211, 252, 0.42);
}

.training-field__repeat {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.training-field__bubble {
  display: grid;
  gap: 5px;
  max-width: 86%;
  border-radius: 8px;
}

.training-field__bubble--me {
  justify-self: end;
  background: rgba(60, 211, 252, 0.16);
}

.training-field__bubble--friend {
  justify-self: start;
}

.training-field__order {
  display: grid;
  gap: 8px;
  padding-left: 20px;
  color: @quest-text;
}

.training-field__feedback.is-visible {
  color: @quest-gold;
  border-color: rgba(252, 196, 19, 0.42);
}

.training-field__actions {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 8px;
}

.training-field__actions button {
  text-align: center;
}

.training-field__actions button:disabled {
  cursor: default;
  opacity: 0.45;
}

.training-field__primary {
  border-color: @quest-sheikah !important;
  background: rgba(60, 211, 252, 0.18) !important;
}
</style>
