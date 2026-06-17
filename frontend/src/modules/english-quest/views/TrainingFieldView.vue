<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ActivityCard from '../components/ActivityCard.vue'
import HyrulePanel from '../components/HyrulePanel.vue'
import MasteryMeter from '../components/MasteryMeter.vue'
import TrainingStepCard from '../components/TrainingStepCard.vue'
import { activities, miniGames } from '../data/questContent'
import { useQuestProgress } from '../composables/useQuestProgress'

const { completedTrainingStepIds, mastery, store, trainingProgress, trainingSteps } = useQuestProgress()

const missionOneSteps = computed(() => trainingSteps.filter((step) => step.missionId === 'mission-1'))
const missionTwoSteps = computed(() => trainingSteps.filter((step) => step.missionId === 'mission-2'))

function isComplete(stepId: string) {
  return completedTrainingStepIds.value.includes(stepId)
}
</script>

<template>
  <main class="quest-screen training-field">
    <header class="training-field__header">
      <p class="quest-kicker">Training Shrine</p>
      <h2 class="quest-title">周末邀约训练场</h2>
      <p class="quest-copy">主线学标准流程，支线刷熟练度。</p>
      <MasteryMeter label="主线进度" :value="trainingProgress" />
    </header>

    <HyrulePanel title="活动卡墙" kicker="Mission 1">
      <div class="training-field__activities">
        <ActivityCard
          v-for="activity in activities"
          :key="activity.id"
          :activity="activity"
          :lit="trainingProgress > 0"
        />
      </div>
    </HyrulePanel>

    <HyrulePanel title="点亮活动卡" kicker="Mission 1">
      <TrainingStepCard
        v-for="step in missionOneSteps"
        :key="step.id"
        :step="step"
        :complete="isComplete(step.id)"
        @complete="store.completeTrainingStep"
      />
    </HyrulePanel>

    <HyrulePanel title="解锁邀请语言" kicker="Mission 2">
      <TrainingStepCard
        v-for="step in missionTwoSteps"
        :key="step.id"
        :step="step"
        :complete="isComplete(step.id)"
        @complete="store.completeTrainingStep"
      />
    </HyrulePanel>

    <HyrulePanel title="可选趣味练习" kicker="Side Quests">
      <div class="training-field__games">
        <RouterLink
          v-for="game in miniGames"
          :key="game.id"
          :to="{ name: game.routeName }"
          class="training-field__game"
        >
          <strong>{{ game.title }}</strong>
          <span>{{ game.description }}</span>
        </RouterLink>
      </div>
    </HyrulePanel>

    <HyrulePanel title="技能掌握度" kicker="Mastery" glow>
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
  gap: 16px;
}

.training-field__header {
  display: grid;
  gap: 10px;
}

.training-field__header p {
  margin: 0;
}

.training-field__activities {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.training-field__games,
.training-field__mastery {
  display: grid;
  gap: 10px;
}

.training-field__game {
  display: grid;
  min-height: 96px;
  align-content: center;
  gap: 7px;
  padding: 13px;
  color: @quest-text;
  text-decoration: none;
  background:
    linear-gradient(135deg, rgba(252, 196, 19, 0.1), transparent 48%),
    rgba(0, 0, 0, 0.42);
  border: 1px solid @quest-border;
}

.training-field__game:hover {
  color: @quest-text;
  border-color: rgba(252, 196, 19, 0.58);
}

.training-field__game strong {
  color: @quest-text;
  font-size: 15px;
  line-height: 1.2;
}

.training-field__game span {
  color: @quest-muted;
  font-size: 12px;
  font-style: italic;
  line-height: 1.4;
}
</style>
