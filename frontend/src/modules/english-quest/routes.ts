import type { RouteRecordRaw } from 'vue-router'

export const englishQuestRoutes: RouteRecordRaw[] = [
  {
    path: '/english-quest',
    component: () => import('./layouts/QuestMobileLayout.vue'),
    children: [
      {
        path: '',
        name: 'english-quest-hub',
        component: () => import('./views/QuestHubView.vue'),
      },
      {
        path: 'training',
        name: 'english-quest-training',
        component: () => import('./views/TrainingFieldView.vue'),
      },
      {
        path: 'practice/chunk-match',
        name: 'english-quest-chunk-match',
        component: () => import('./views/ChunkMatchGameView.vue'),
      },
      {
        path: 'practice/sentence-blocks',
        name: 'english-quest-sentence-blocks',
        component: () => import('./views/SentenceBlocksGameView.vue'),
      },
      {
        path: 'scenario',
        name: 'english-quest-scenario',
        component: () => import('./views/ScenarioQuestView.vue'),
      },
      {
        path: 'report',
        name: 'english-quest-report',
        component: () => import('./views/LearningReportView.vue'),
      },
    ],
  },
]
