<template>
  <main class="quest-screen scenario-quest">
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
      :invitation-transcript="invitationTranscript"
      :follow-up-transcript="followUpTranscript"
      :message="message"
      :recording="isRecording"
      :fallback-available="fallbackAvailable"
      :hint-visible="hintVisible"
      @back="closeTask"
      @start-recording="startSpeech"
      @stop-recording="speech.stop"
      @show-hint="hintVisible = true"
      @simulate="simulateSpeech"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import ScenarioTaskBoard from '../components/ScenarioTaskBoard.vue'
import ScenarioWeChatChat from '../components/ScenarioWeChatChat.vue'
import { useQuestProgress } from '../composables/useQuestProgress'
import { evaluatePhrase, useScenarioSpeech } from '../composables/useScenarioSpeech'
import type { ScenarioChatPhase } from '../types'

const { completedScenarioTaskIds, scenarioTasks, store } = useQuestProgress()
const { scenarioRewardUnlocked } = storeToRefs(store)
const speech = useScenarioSpeech()
const selectedTaskId = ref('')
const phase = ref<ScenarioChatPhase>('invite')
const invitationTranscript = ref('')
const followUpTranscript = ref('')
const evaluationMessage = ref('')
const hintVisible = ref(false)

const selectedTask = computed(() => scenarioTasks.find((task) => task.id === selectedTaskId.value))
const isRecording = computed(() => speech.status.value === 'recording')
const fallbackAvailable = computed(
  () => speech.status.value === 'unsupported' || speech.status.value === 'denied' || Boolean(speech.errorMessage.value),
)
const message = computed(() => evaluationMessage.value || speech.errorMessage.value)

function resetChat() {
  phase.value = 'invite'
  invitationTranscript.value = ''
  followUpTranscript.value = ''
  evaluationMessage.value = ''
  hintVisible.value = false
}

function openTask(taskId: string) {
  store.selectScenarioTask(taskId)
  selectedTaskId.value = taskId
  resetChat()
}

function closeTask() {
  selectedTaskId.value = ''
  resetChat()
}

function submitSpeech(text: string) {
  if (!selectedTask.value) return

  const isInvitation = phase.value === 'invite'
  const groups = isInvitation ? selectedTask.value.invitationKeywordGroups : selectedTask.value.followUpKeywordGroups
  const result = evaluatePhrase(text, groups)

  if (isInvitation) invitationTranscript.value = text
  else followUpTranscript.value = text

  if (!result.passed) {
    evaluationMessage.value = isInvitation ? '再试试把活动和时间也说出来。' : '再试试用一句简短的话把对话收好。'
    return
  }

  evaluationMessage.value = ''
  hintVisible.value = false
  if (isInvitation) {
    phase.value = 'follow-up'
    return
  }

  phase.value = 'complete'
  store.completeScenarioTask(selectedTask.value.id)
}

function startSpeech() {
  speech.start(submitSpeech)
}

function simulateSpeech() {
  if (!selectedTask.value) return
  const answer = phase.value === 'invite' ? selectedTask.value.expectedInvitation : selectedTask.value.expectedFollowUp
  speech.simulate(answer, submitSpeech)
}
</script>

<style lang="less" scoped>
@import '../styles/quest.less';

.scenario-quest {
  min-height: 100%;
  padding-bottom: 30px;
}
</style>
