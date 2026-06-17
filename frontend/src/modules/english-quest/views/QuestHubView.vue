<template>
  <main class="quest-screen quest-hub">
    <header class="quest-hub__header">
      <h2 class="quest-title">周末邀约冒险</h2>
      <p class="quest-copy">先刷熟语言技能，再进入微信实战。</p>
    </header>

    <section class="quest-hub__entries" aria-label="学习入口">
      <QuestEntryCard
        title="语言训练场"
        eyebrow="Training Field"
        summary="活动词块、邀请句、朋友回应和礼貌收尾。"
        icon="⚔️"
        :status="`${trainingProgress}%`"
        :to="{ name: 'english-quest-training' }"
      />
      <QuestEntryCard
        title="场景任务"
        eyebrow="Scenario Quest"
        summary="像真的微信聊天一样，完成周末邀约。"
        icon="📱"
        :status="scenarioStatus"
        :to="{ name: 'english-quest-scenario' }"
        :locked="!allTrainingComplete"
      />
    </section>

    <HyrulePanel title="当前掌握度" kicker="Mastery" glow>
      <div class="quest-hub__meters">
        <MasteryMeter v-for="entry in mastery" :key="entry.key" :label="entry.label" :value="entry.value" />
      </div>
    </HyrulePanel>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HyrulePanel from '../components/HyrulePanel.vue'
import MasteryMeter from '../components/MasteryMeter.vue'
import QuestEntryCard from '../components/QuestEntryCard.vue'
import { useQuestProgress } from '../composables/useQuestProgress'

const { allTrainingComplete, mastery, scenarioProgress, trainingProgress } = useQuestProgress()

const scenarioStatus = computed(() => (allTrainingComplete.value ? `${scenarioProgress.value}%` : '建议先训练'))
</script>

<style lang="less" scoped>
@import '../styles/quest.less';

.quest-hub {
  display: grid;
  align-content: start;
  gap: 16px;
}

.quest-hub__header {
  display: grid;
  max-width: 720px;
  gap: 10px;
}

.quest-hub__header p {
  margin: 0;
}

.quest-hub__entries {
  display: grid;
  gap: 12px;
}

.quest-hub__meters {
  display: grid;
  gap: 12px;
}
</style>
