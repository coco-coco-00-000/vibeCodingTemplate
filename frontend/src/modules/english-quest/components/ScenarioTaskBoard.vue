<template>
  <section class="scenario-board" aria-label="场景任务">
    <header class="scenario-board__header">
      <p class="scenario-board__kicker">Scenario Quest</p>
      <h1>给朋友发出周末邀约</h1>
      <p>选择一位朋友，像真的聊天一样完成一次语音邀约。</p>
      <div class="scenario-board__progress">
        <span>邀约徽章册</span>
        <strong>{{ completedTaskIds.length }}/{{ tasks.length }}</strong>
      </div>
    </header>

    <div class="scenario-board__tasks">
      <button v-for="task in tasks" :key="task.id" type="button" class="scenario-task-card" @click="$emit('select', task.id)">
        <img :src="avatarMap[task.friendAvatar]" :alt="task.friendName" />
        <span class="scenario-task-card__status">{{ completedTaskIds.includes(task.id) ? '已完成' : '待邀约' }}</span>
        <span class="scenario-task-card__name">{{ task.friendName }}</span>
        <span class="scenario-task-card__role">{{ task.friendRole }}</span>
        <span class="scenario-task-card__prompt">{{ task.taskPrompt }}</span>
        <span class="scenario-task-card__badge">
          <b>{{ task.badgeIcon }}</b>
          {{ completedTaskIds.includes(task.id) ? `已获得 ${task.badgeTitle}` : task.badgeTitle }}
        </span>
      </button>
    </div>

    <section v-if="rewardUnlocked" class="scenario-board__reward">
      <span class="scenario-board__reward-mark">★</span>
      <div>
        <p>奖励已解锁</p>
        <h2>周末邀约大师</h2>
        <span>你已经完成了三次真实邀约。</span>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import princessAvatar from '../assets/princess-selfie.png'
import purahAvatar from '../assets/purah-avatar.png'
import tulinAvatar from '../assets/tulin-avatar.png'
import type { ScenarioTask } from '../types'

defineProps<{
  tasks: ScenarioTask[]
  completedTaskIds: string[]
  rewardUnlocked: boolean
}>()

defineEmits<{
  select: [taskId: string]
}>()

const avatarMap: Record<ScenarioTask['friendAvatar'], string> = {
  princess: princessAvatar,
  purah: purahAvatar,
  tulin: tulinAvatar,
}
</script>

<style lang="less" scoped>
@import '../styles/quest.less';

.scenario-board {
  display: grid;
  gap: 20px;
  max-width: 1160px;
  margin: 0 auto;
}

.scenario-board__header {
  display: grid;
  gap: 9px;
  padding: 26px 28px;
  color: @quest-text;
  background:
    linear-gradient(120deg, rgba(252, 196, 19, 0.16), transparent 40%),
    @quest-panel;
  border: 1px solid @quest-border;
  box-shadow: inset 0 0 0 1px rgba(60, 211, 252, 0.14);
}

.scenario-board__header h1,
.scenario-board__header p {
  margin: 0;
}

.scenario-board__header h1 {
  font-size: 30px;
  line-height: 1.15;
}

.scenario-board__header > p:not(.scenario-board__kicker) {
  color: @quest-muted;
}

.scenario-board__kicker {
  color: @quest-sheikah;
  font-size: 13px;
  font-style: italic;
}

.scenario-board__progress {
  display: flex;
  gap: 10px;
  align-items: center;
  width: fit-content;
  margin-top: 6px;
  padding: 8px 11px;
  color: @quest-text;
  background: rgba(8, 18, 36, 0.48);
  border: 1px solid rgba(60, 211, 252, 0.44);
}

.scenario-board__progress strong {
  color: @quest-gold;
}

.scenario-board__tasks {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 14px;
}

.scenario-task-card {
  position: relative;
  display: grid;
  gap: 7px;
  min-width: 0;
  padding: 16px;
  overflow: hidden;
  color: @quest-text;
  text-align: left;
  cursor: pointer;
  background:
    linear-gradient(140deg, rgba(60, 211, 252, 0.11), transparent 42%),
    @quest-panel;
  border: 1px solid @quest-border;
  box-shadow: inset 0 0 0 1px rgba(252, 196, 19, 0.12);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.scenario-task-card:hover {
  border-color: @quest-sheikah;
  box-shadow:
    inset 0 0 0 1px rgba(252, 196, 19, 0.28),
    0 0 24px rgba(60, 211, 252, 0.14);
  transform: translateY(-3px);
}

.scenario-task-card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border: 1px solid rgba(60, 211, 252, 0.58);
}

.scenario-task-card__status {
  position: absolute;
  top: 26px;
  left: 26px;
  padding: 4px 7px;
  color: @quest-text;
  font-size: 12px;
  background: rgba(8, 18, 36, 0.78);
  border: 1px solid rgba(233, 225, 209, 0.38);
}

.scenario-task-card__name {
  font-size: 22px;
  font-weight: 700;
}

.scenario-task-card__role,
.scenario-task-card__prompt {
  color: @quest-muted;
  line-height: 1.5;
}

.scenario-task-card__badge {
  display: flex;
  gap: 7px;
  align-items: center;
  margin-top: 5px;
  color: @quest-gold;
  font-size: 13px;
}

.scenario-task-card__badge b {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  color: @quest-panel;
  background: @quest-gold;
}

.scenario-board__reward {
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 18px 22px;
  color: @quest-text;
  background: rgba(252, 196, 19, 0.12);
  border: 1px solid rgba(252, 196, 19, 0.64);
}

.scenario-board__reward p,
.scenario-board__reward h2 {
  margin: 0;
}

.scenario-board__reward p {
  color: @quest-gold;
  font-size: 12px;
}

.scenario-board__reward h2 {
  margin: 2px 0 4px;
  font-size: 22px;
}

.scenario-board__reward > span:last-child {
  color: @quest-muted;
}

.scenario-board__reward-mark {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  color: @quest-panel;
  font-size: 24px;
  background: @quest-gold;
}

@media (max-width: 820px) {
  .scenario-board__tasks {
    grid-template-columns: 1fr;
  }

  .scenario-task-card {
    grid-template-columns: 132px minmax(0, 1fr);
    grid-template-rows: auto auto auto;
    align-items: start;
  }

  .scenario-task-card img {
    grid-row: 1 / -1;
  }
}
</style>
