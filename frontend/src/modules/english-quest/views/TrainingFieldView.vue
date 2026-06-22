<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import HyrulePanel from '../components/HyrulePanel.vue'
import MasteryMeter from '../components/MasteryMeter.vue'
import { useQuestProgress } from '../composables/useQuestProgress'
import linkBasketball from '../assets/link-basketball.png'
import linkMovie from '../assets/link-movie.png'
import linkShopping from '../assets/link-shopping.png'
import linkSwimming from '../assets/link-swimming.png'
import linkVideoGames from '../assets/link-video-games.png'
import linkV2Basketball from '../assets/link-v2-basketball.png'
import linkV2Movie from '../assets/link-v2-movie.png'
import linkV2Shopping from '../assets/link-v2-shopping.png'
import linkV2Swimming from '../assets/link-v2-swimming.png'
import linkV2VideoGames from '../assets/link-v2-video-games.png'

const { completedTrainingStepIds, mastery, miniGames, store, trainingLevels, trainingProgress } = useQuestProgress()

const levelIndex = ref(0)
const questionIndex = ref(0)
const selectedOptionId = ref('')
const revealed = ref(false)
const tappedOptionIds = ref<string[]>([])
const learningStarted = ref(false)
const audioPlayingId = ref('')
const activityImages: Record<string, string> = {
  'go-swimming': linkSwimming,
  'play-video-games': linkVideoGames,
  'play-basketball': linkBasketball,
  'watch-a-movie': linkMovie,
  'go-shopping': linkShopping,
}
const activityImagesByEmoji: Record<string, string> = {
  '🏊': linkSwimming,
  '🎮': linkVideoGames,
  '🏀': linkBasketball,
  '🎬': linkMovie,
  '🛍️': linkShopping,
}
const questionImages: Record<string, string> = {
  'go-swimming': linkSwimming,
  'play-video-games': linkVideoGames,
  'play-basketball': linkBasketball,
  'watch-a-movie': linkMovie,
  'go-shopping': linkShopping,
  'v2-swimming': linkV2Swimming,
  'v2-basketball': linkV2Basketball,
  'v2-movie': linkV2Movie,
  'v2-shopping': linkV2Shopping,
  'v2-video-games': linkV2VideoGames,
}
const matchingTranslationOrder = ['去购物', '看电影', '去游泳', '打电子游戏', '打篮球']

const selectedPairLeft = ref('')
const matchedPairLefts = ref<string[]>([])
const mismatchedPairRight = ref('')
const speakingStatus = ref<'idle' | 'recording' | 'result'>('idle')
let audioTimer: number | undefined
let speakingTimer: number | undefined

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
  if (currentLevel.value.kind === 'speaking') return speakingStatus.value === 'result'
  if (currentLevel.value.kind === 'matching') {
    return matchedPairLefts.value.length === (currentQuestion.value.pairs?.length ?? 0)
  }
  return revealed.value || isCurrentLevelComplete.value
})

watch([levelIndex, questionIndex], () => {
  selectedOptionId.value = ''
  revealed.value = false
  tappedOptionIds.value = []
  selectedPairLeft.value = ''
  matchedPairLefts.value = []
  mismatchedPairRight.value = ''
  speakingStatus.value = 'idle'
  if (speakingTimer) window.clearTimeout(speakingTimer)
})

function selectOption(optionId: string) {
  selectedOptionId.value = optionId
  if (optionId === currentQuestion.value.correctOptionId) revealed.value = true
}

function revealAnswer() {
  revealed.value = true
}

function startSpeaking() {
  if (speakingStatus.value === 'recording') return
  if (speakingTimer) window.clearTimeout(speakingTimer)
  speakingStatus.value = 'recording'
  speakingTimer = window.setTimeout(() => {
    speakingStatus.value = 'result'
    revealed.value = true
  }, 1400)
}

function selectPairLeft(left: string) {
  if (matchedPairLefts.value.includes(left)) return
  selectedPairLeft.value = left
  mismatchedPairRight.value = ''
}

function selectPairRight(right: string) {
  if (!selectedPairLeft.value) return

  const selectedPair = currentQuestion.value.pairs?.find((pair) => pair.left === selectedPairLeft.value)
  if (!selectedPair) return

  mismatchedPairRight.value = ''

  if (selectedPair.right === right) {
    matchedPairLefts.value.push(selectedPair.left)
    selectedPairLeft.value = ''
    return
  }

  mismatchedPairRight.value = right
}

function playAudio(text: string, playingId = '') {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }
  if (audioTimer) window.clearTimeout(audioTimer)
  audioPlayingId.value = playingId
  audioTimer = window.setTimeout(() => {
    audioPlayingId.value = ''
  }, 900)
}

function tapCard(optionId: string, text: string) {
  playAudio(text, optionId)
  if (!tappedOptionIds.value.includes(optionId)) tappedOptionIds.value.push(optionId)
}

function playInviteMessage() {
  if (!currentQuestion.value.sentence) return
  playAudio(currentQuestion.value.sentence, `invite-${currentQuestion.value.id}`)
  revealAnswer()
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

function startLearning() {
  learningStarted.value = true
}

onBeforeUnmount(() => {
  if (audioTimer) window.clearTimeout(audioTimer)
  if (speakingTimer) window.clearTimeout(speakingTimer)
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
})
</script>

<template>
  <main class="quest-screen training-field">
    <header v-if="learningStarted" class="training-field__header">
      <p class="quest-kicker">Training Shrine · {{ levelCounter }}</p>
      <h2 class="quest-title">Level {{ currentLevel.levelNumber }}：{{ currentLevel.title }}</h2>
      <p class="quest-copy">{{ currentLevel.screenCopy }}</p>
      <MasteryMeter label="主线进度" :value="trainingProgress" />
    </header>

    <section v-if="!learningStarted" class="training-field__lobby" aria-label="语言训练场">
      <header class="training-field__lobby-header">
        <p class="quest-kicker">Training Shrine</p>
        <h2 class="quest-title">语言训练场</h2>
        <p class="quest-copy">先完成主线学习流程，再按需要用小游戏练得更熟。</p>
      </header>

      <HyrulePanel title="语言学习" kicker="Main Path" glow>
        <div class="training-field__lobby-section">
          <div>
            <p class="training-field__section-copy">按关卡学习活动词块、邀约句、朋友回应和对话收尾。</p>
            <MasteryMeter label="主线进度" :value="trainingProgress" />
          </div>
          <button type="button" class="training-field__start-button" @click="startLearning">开始主线学习</button>
        </div>
      </HyrulePanel>

      <HyrulePanel title="趣味练习" kicker="Practice">
        <div class="training-field__practice-grid">
          <RouterLink
            v-for="game in miniGames"
            :key="game.id"
            :to="{ name: game.routeName }"
            class="training-field__practice-card"
          >
            <span class="training-field__practice-mark" aria-hidden="true">{{ game.id === 'chunk-match' ? '✦' : '▦' }}</span>
            <strong>{{ game.title }}</strong>
            <small>{{ game.id === 'chunk-match' ? '快速配对常用语块' : '拼出完整邀约句' }}</small>
          </RouterLink>
        </div>
      </HyrulePanel>

      <HyrulePanel title="技能掌握度" kicker="Mastery">
        <div class="training-field__mastery">
          <MasteryMeter v-for="entry in mastery" :key="entry.key" :label="entry.label" :value="entry.value" />
        </div>
      </HyrulePanel>
    </section>

    <template v-else>
      <HyrulePanel :title="currentQuestion.prompt" :kicker="currentLevel.missionId === 'mission-1' ? 'Mission 1' : 'Mission 2'" glow>
      <section class="training-field__question" :class="`training-field__question--${currentLevel.kind}`">
        <button
          v-if="currentQuestion.audioText"
          type="button"
          class="training-field__audio"
          :class="{ 'is-playing': audioPlayingId === `audio-${currentQuestion.id}` }"
          :aria-label="`播放 ${currentQuestion.audioText}`"
          @click="playAudio(currentQuestion.audioText, `audio-${currentQuestion.id}`)"
        >
          <span aria-hidden="true">🔊</span>
          <strong>点击播放英文</strong>
        </button>

        <div v-if="currentQuestion.sentence && currentLevel.id !== 'level-7-invite-function'" class="training-field__sentence">
          {{ currentQuestion.sentence }}
        </div>

        <img
          v-if="currentQuestion.imageId"
          class="training-field__transfer-image"
          :src="questionImages[currentQuestion.imageId]"
          :alt="'活动场景图'"
        />

        <div v-if="currentLevel.kind === 'activity-cards'" class="training-field__activity-grid">
          <button
            v-for="option in currentQuestion.options"
            :key="option.id"
            type="button"
            class="training-field__activity-card"
            :class="{
              'is-revealed': tappedOptionIds.includes(option.id),
              'is-playing': audioPlayingId === option.id,
            }"
            @click="tapCard(option.id, option.label)"
          >
            <img
              class="training-field__activity-image"
              :src="activityImages[option.id]"
              :alt="option.imageLabel"
            />
            <strong>{{ option.label }}</strong>
            <small>{{ option.imageLabel }}</small>
            <em v-if="tappedOptionIds.includes(option.id)">已点亮</em>
          </button>
        </div>

        <div v-else-if="currentLevel.id === 'level-2-word-audio-image'" class="training-field__image-options">
          <button
            v-for="option in currentQuestion.options"
            :key="option.id"
            type="button"
            class="training-field__image-option"
            :class="{
              'is-selected': selectedOptionId === option.id,
              'is-correct': revealed && option.id === currentQuestion.correctOptionId,
              'is-wrong': selectedOptionId === option.id && selectedOptionId !== currentQuestion.correctOptionId,
            }"
            :aria-label="option.label"
            @click="selectOption(option.id)"
          >
            <img :src="activityImagesByEmoji[option.emoji ?? '']" :alt="option.label" />
            <b>{{ option.id }}</b>
          </button>
        </div>

        <div v-else-if="currentLevel.kind === 'speaking'" class="training-field__speaking">
          <button
            type="button"
            class="training-field__record-button"
            :class="{ 'is-recording': speakingStatus === 'recording', 'is-finished': speakingStatus === 'result' }"
            :disabled="speakingStatus === 'recording'"
            @click="startSpeaking"
          >
            <span aria-hidden="true">●</span>
            <strong>{{ speakingStatus === 'recording' ? '正在收音...' : speakingStatus === 'result' ? '重新录音' : '录音' }}</strong>
          </button>
          <p v-if="speakingStatus === 'recording'" class="training-field__speaking-status">听一听你的英文表达...</p>
          <p v-else-if="speakingStatus === 'result'" class="training-field__speaking-result">
            识别结果：<strong>{{ currentQuestion.spokenAnswer }}</strong>。说得很好！
          </p>
          <p v-else class="training-field__speaking-status">点击录音，开口说出你看到的活动。</p>
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

        <div v-else-if="currentLevel.kind === 'matching'" class="training-field__matching">
          <div class="training-field__matching-column">
            <p>英文词块</p>
            <button
              v-for="pair in currentQuestion.pairs"
              :key="pair.left"
              type="button"
              class="training-field__match-word"
              :class="{
                'is-selected': selectedPairLeft === pair.left,
                'is-matched': matchedPairLefts.includes(pair.left),
              }"
              :disabled="matchedPairLefts.includes(pair.left)"
              @click="selectPairLeft(pair.left)"
            >
              <strong>{{ pair.left }}</strong>
              <small v-if="matchedPairLefts.includes(pair.left)">已连线</small>
            </button>
          </div>

          <div class="training-field__matching-column">
            <p>中文翻译</p>
            <button
              v-for="right in matchingTranslationOrder"
              :key="right"
              type="button"
              class="training-field__match-translation"
              :class="{
                'is-wrong': mismatchedPairRight === right,
                'is-matched': currentQuestion.pairs?.some((pair) => pair.right === right && matchedPairLefts.includes(pair.left)),
              }"
              :disabled="currentQuestion.pairs?.some((pair) => pair.right === right && matchedPairLefts.includes(pair.left))"
              :aria-label="right"
              @click="selectPairRight(right)"
            >
              <strong>{{ right }}</strong>
            </button>
          </div>

          <p class="training-field__matching-hint">
            <template v-if="matchedPairLefts.length === currentQuestion.pairs?.length">5 组已经全部连线。</template>
            <template v-else-if="mismatchedPairRight">这组没有连对，换一张图片试试。</template>
            <template v-else-if="selectedPairLeft">现在选择右侧对应的活动图片。</template>
            <template v-else>先点击一个英文词块，再选择右侧对应的活动图片。</template>
          </p>
        </div>

        <div v-else-if="currentLevel.kind === 'tagging'" class="training-field__pairs">
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

        <div v-else-if="currentLevel.id === 'level-7-invite-function'" class="training-field__invite-chat">
          <div class="training-field__chat-header">
            <strong>公主</strong>
          </div>
          <div class="training-field__invite-row">
            <button
              type="button"
              class="training-field__invite-message"
              :class="{ 'is-playing': audioPlayingId === `invite-${currentQuestion.id}` }"
              title="点击播放英文"
              @click="playInviteMessage"
            >
              {{ currentQuestion.sentence }}
            </button>
            <img :src="linkSwimming" alt="林克" class="training-field__invite-avatar" />
          </div>
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
    </template>
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

.training-field__lobby {
  display: grid;
  gap: 16px;
}

.training-field__lobby-header {
  display: grid;
  gap: 10px;
}

.training-field__lobby-header p {
  margin: 0;
}

.training-field__lobby-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-items: end;
}

.training-field__section-copy {
  margin: 0 0 18px;
  color: rgba(233, 225, 209, 0.72);
  line-height: 1.7;
}

.training-field__start-button {
  min-width: 150px;
  min-height: 46px;
  padding: 0 18px;
  color: #1e1d17;
  font-weight: 700;
  background: @quest-gold;
  border: 1px solid rgba(255, 242, 194, 0.82);
}

.training-field__practice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.training-field__practice-card {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 14px;
  align-items: center;
  min-height: 108px;
  padding: 18px;
  color: @quest-text;
  text-decoration: none;
  background: rgba(60, 211, 252, 0.06);
  border: 1px solid rgba(60, 211, 252, 0.28);
}

.training-field__practice-card:hover {
  border-color: @quest-sheikah;
  background: rgba(60, 211, 252, 0.12);
}

.training-field__practice-card strong,
.training-field__practice-card small {
  grid-column: 2;
}

.training-field__practice-card strong {
  font-size: 18px;
}

.training-field__practice-card small {
  margin-top: 6px;
  color: rgba(233, 225, 209, 0.66);
}

.training-field__practice-mark {
  grid-row: span 2;
  color: @quest-gold;
  font-size: 34px;
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
  width: fit-content;
  padding: 10px 14px;
  color: @quest-text;
  cursor: pointer;
  background: rgba(60, 211, 252, 0.1);
  border: 1px solid rgba(60, 211, 252, 0.5);
}

.training-field__audio span {
  font-size: 22px;
}

.training-field__audio.is-playing {
  color: #bff6ff;
  box-shadow: 0 0 18px rgba(60, 211, 252, 0.42);
}

.training-field__transfer-image {
  display: block;
  width: min(100%, 520px);
  max-height: 460px;
  margin: 0 auto;
  object-fit: contain;
  background: rgba(4, 10, 14, 0.62);
  border: 1px solid rgba(60, 211, 252, 0.42);
}

.training-field__activity-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
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
  grid-template-rows: auto auto auto auto;
  min-height: 420px;
  align-content: start;
  gap: 7px;
  padding: 0 0 14px;
  text-align: center;
  overflow: hidden;
}

.training-field__activity-image {
  width: 100%;
  aspect-ratio: 3 / 4;
  display: block;
  object-fit: contain;
  object-position: center;
  background: rgba(7, 18, 25, 0.78);
  border-bottom: 1px solid rgba(60, 211, 252, 0.24);
  filter: brightness(0.72) saturate(0.8);
  transition: filter 0.22s ease, transform 0.22s ease;
}

.training-field__activity-card strong,
.training-field__activity-card small,
.training-field__activity-card em {
  padding-inline: 12px;
}

.training-field__activity-card strong {
  margin-top: 4px;
  font-size: 20px;
  line-height: 1.2;
}

.training-field__activity-card em {
  justify-self: center;
  padding: 3px 8px;
  color: #bff6ff;
  font-size: 11px;
  font-style: normal;
  background: rgba(60, 211, 252, 0.16);
  border: 1px solid rgba(60, 211, 252, 0.42);
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

.training-field__image-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.training-field__image-option {
  position: relative;
  display: grid;
  min-height: 360px;
  place-items: center;
  padding: 12px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(7, 18, 25, 0.82);
  border: 1px solid @quest-border;
}

.training-field__image-option img {
  width: 100%;
  height: 316px;
  object-fit: contain;
  background: rgba(4, 10, 14, 0.62);
}

.training-field__image-option b {
  position: absolute;
  top: 12px;
  left: 12px;
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  color: @quest-text;
  background: rgba(7, 18, 25, 0.8);
  border: 1px solid rgba(233, 225, 209, 0.34);
}

.training-field__image-option.is-selected {
  border-color: @quest-sheikah;
  box-shadow: 0 0 18px rgba(60, 211, 252, 0.26);
}

.training-field__image-option.is-correct {
  border-color: #8ff38a;
  box-shadow: 0 0 22px rgba(143, 243, 138, 0.3);
}

.training-field__image-option.is-wrong {
  border-color: rgba(252, 196, 19, 0.72);
}

.training-field__speaking {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 10px 0;
  text-align: center;
}

.training-field__record-button {
  display: inline-flex;
  min-width: 160px;
  min-height: 54px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  color: @quest-text;
  font-size: 17px;
  background: rgba(60, 211, 252, 0.14);
  border: 1px solid rgba(60, 211, 252, 0.58);
  cursor: pointer;
}

.training-field__record-button span {
  color: #ff7368;
  font-size: 22px;
  line-height: 1;
}

.training-field__record-button.is-recording {
  color: #fff2cf;
  border-color: @quest-gold;
  box-shadow: 0 0 20px rgba(252, 196, 19, 0.28);
}

.training-field__record-button.is-recording span {
  animation: recording-pulse 0.8s ease-in-out infinite alternate;
}

.training-field__record-button.is-finished {
  border-color: #8ff38a;
}

.training-field__speaking-status,
.training-field__speaking-result {
  margin: 0;
  color: @quest-muted;
}

.training-field__speaking-result {
  color: #bff6ff;
}

@keyframes recording-pulse {
  from { transform: scale(0.76); opacity: 0.55; }
  to { transform: scale(1.12); opacity: 1; }
}

.training-field__matching {
  display: grid;
  grid-template-columns: minmax(220px, 0.78fr) minmax(0, 1.22fr);
  gap: 20px;
}

.training-field__matching-column {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  align-content: start;
}

.training-field__matching-column > p,
.training-field__matching-hint {
  grid-column: 1 / -1;
  margin: 0;
  color: rgba(233, 225, 209, 0.68);
}

.training-field__match-word,
.training-field__match-translation {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid @quest-border;
  background: rgba(7, 18, 25, 0.82);
}

.training-field__match-word {
  display: grid;
  min-height: 88px;
  place-items: center;
  padding: 12px;
  color: @quest-text;
  text-align: center;
}

.training-field__match-word strong {
  font-size: 19px;
  line-height: 1.25;
}

.training-field__match-word small {
  margin-top: 6px;
  color: #aaf5b2;
}

.training-field__match-translation {
  display: grid;
  min-height: 88px;
  place-items: center;
  padding: 12px;
  color: @quest-text;
  text-align: center;
}

.training-field__match-translation strong {
  font-size: 19px;
  line-height: 1.25;
}

.training-field__match-word.is-selected,
.training-field__match-translation:hover:not(:disabled) {
  border-color: @quest-sheikah;
  box-shadow: 0 0 18px rgba(60, 211, 252, 0.28);
}

.training-field__match-word.is-matched,
.training-field__match-translation.is-matched {
  border-color: #8ff38a;
  box-shadow: 0 0 18px rgba(143, 243, 138, 0.24);
}

.training-field__match-translation.is-wrong {
  border-color: rgba(252, 196, 19, 0.82);
  box-shadow: 0 0 18px rgba(252, 196, 19, 0.2);
}

.training-field__match-word:disabled,
.training-field__match-translation:disabled {
  cursor: default;
  opacity: 0.75;
}

.training-field__matching-hint {
  margin-top: 2px;
  padding: 11px 12px;
  background: rgba(60, 211, 252, 0.06);
  border: 1px solid rgba(60, 211, 252, 0.22);
}

.training-field__option b {
  color: @quest-gold;
}

.training-field__option.is-correct,
.training-field__pair.is-revealed,
.training-field__activity-card.is-revealed {
  border-color: rgba(60, 211, 252, 0.92);
  background: rgba(60, 211, 252, 0.08);
  box-shadow: 0 0 22px rgba(60, 211, 252, 0.3), inset 0 0 22px rgba(60, 211, 252, 0.08);
}

.training-field__activity-card.is-revealed .training-field__activity-image {
  filter: brightness(1.08) saturate(1.12);
}

.training-field__activity-card.is-playing .training-field__activity-image {
  transform: scale(1.04);
}

.training-field__activity-card.is-playing {
  box-shadow: 0 0 0 2px rgba(60, 211, 252, 0.9), 0 0 28px rgba(60, 211, 252, 0.42);
}

@media (max-width: 1100px) {
  .training-field__activity-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
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

.training-field__invite-chat {
  display: grid;
  gap: 18px;
  max-width: 720px;
  margin: 0 auto;
  min-height: 260px;
  padding: 0 18px 24px;
  background: #ededed;
  border: 1px solid rgba(233, 225, 209, 0.2);
}

.training-field__chat-header {
  display: grid;
  min-height: 54px;
  place-items: center;
  margin: 0 -18px;
  color: #111;
  background: #f7f7f7;
  border-bottom: 1px solid #d9d9d9;
}

.training-field__invite-row {
  display: flex;
  justify-content: end;
  align-items: start;
  gap: 10px;
  padding-top: 18px;
}

.training-field__invite-avatar {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  object-fit: cover;
  object-position: center 28%;
  border-radius: 4px;
}

.training-field__invite-message {
  max-width: min(78%, 500px);
  padding: 11px 13px;
  color: #1f2b1d;
  font-size: 18px;
  line-height: 1.45;
  text-align: left;
  background: #95ec69;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
}

.training-field__invite-message.is-playing {
  background: #b3f48d;
  box-shadow: 0 0 0 2px rgba(103, 173, 78, 0.34);
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
