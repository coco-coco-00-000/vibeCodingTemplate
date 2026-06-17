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
