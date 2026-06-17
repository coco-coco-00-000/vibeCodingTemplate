import type { RouteRecordRaw } from 'vue-router'

export const englishQuestRoutes: RouteRecordRaw[] = [
  {
    path: 'english-quest',
    name: 'english-quest-hub',
    component: () => import('./views/QuestHubView.vue'),
  },
  {
    path: 'english-quest/training',
    name: 'english-quest-training',
    component: () => import('./views/TrainingFieldView.vue'),
  },
  {
    path: 'english-quest/practice/chunk-match',
    name: 'english-quest-chunk-match',
    component: () => import('./views/ChunkMatchGameView.vue'),
  },
  {
    path: 'english-quest/practice/sentence-blocks',
    name: 'english-quest-sentence-blocks',
    component: () => import('./views/SentenceBlocksGameView.vue'),
  },
  {
    path: 'english-quest/scenario',
    name: 'english-quest-scenario',
    component: () => import('./views/ScenarioQuestView.vue'),
  },
  {
    path: 'english-quest/report',
    name: 'english-quest-report',
    component: () => import('./views/LearningReportView.vue'),
  },
]
