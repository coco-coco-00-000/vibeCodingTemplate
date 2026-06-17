import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { miniGames, scenarioTasks, trainingSteps } from '../data/questContent'
import { useEnglishQuestStore } from '../store'

export function useQuestProgress() {
  const store = useEnglishQuestStore()
  const {
    completedTrainingStepIds,
    completedMiniGameIds,
    completedScenarioTaskIds,
    mastery,
    allTrainingComplete,
    activeScenarioTask,
  } = storeToRefs(store)

  const trainingProgress = computed(() =>
    Math.round((completedTrainingStepIds.value.length / trainingSteps.length) * 100),
  )

  const scenarioProgress = computed(() =>
    Math.round((completedScenarioTaskIds.value.length / scenarioTasks.length) * 100),
  )

  const recommendation = computed(() => {
    const weakest = [...mastery.value].sort((a, b) => a.value - b.value)[0]
    if (!allTrainingComplete.value) return `建议先完成语言训练场。当前最需要补强：${weakest.label}。`
    if (completedScenarioTaskIds.value.length < scenarioTasks.length) return '主线训练已完成，推荐进入微信邀约实战。'
    return '本轮任务已完成，可以查看学习报告或继续支线练习。'
  })

  return {
    store,
    completedTrainingStepIds,
    completedMiniGameIds,
    completedScenarioTaskIds,
    mastery,
    allTrainingComplete,
    activeScenarioTask,
    trainingProgress,
    scenarioProgress,
    recommendation,
    trainingSteps,
    miniGames,
    scenarioTasks,
  }
}
