<script setup lang="ts">
import type { TrainingStep } from '../types'

defineProps<{
  step: TrainingStep
  complete: boolean
}>()

const emit = defineEmits<{
  complete: [stepId: string]
}>()
</script>

<template>
  <article class="training-step" :class="{ 'training-step--complete': complete }">
    <div class="training-step__marker" aria-hidden="true">
      {{ complete ? '✓' : '✦' }}
    </div>
    <div class="training-step__copy">
      <strong>{{ step.title }}</strong>
      <p>{{ step.goal }}</p>
      <small>{{ step.interaction }}</small>
    </div>
    <button type="button" :disabled="complete" @click="emit('complete', step.id)">
      {{ complete ? '已完成' : '完成一次' }}
    </button>
  </article>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.training-step {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  padding: 12px;
  color: @quest-text;
  background: rgba(0, 0, 0, 0.42);
  border: 1px solid @quest-border;
}

.training-step + .training-step {
  margin-top: 10px;
}

.training-step--complete {
  border-color: rgba(60, 211, 252, 0.72);
  box-shadow: 0 0 16px rgba(60, 211, 252, 0.14);
}

.training-step__marker {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  color: @quest-gold;
  background: rgba(252, 196, 19, 0.1);
  border: 1px solid rgba(252, 196, 19, 0.38);
}

.training-step__copy {
  display: grid;
  min-width: 0;
  gap: 5px;
}

.training-step strong {
  color: @quest-text;
  font-size: 14px;
  line-height: 1.25;
}

.training-step p,
.training-step small {
  color: @quest-muted;
  font-size: 12px;
  font-style: italic;
  line-height: 1.35;
}

.training-step button {
  grid-column: 2;
  justify-self: start;
  min-height: 32px;
  padding: 0 12px;
  color: @quest-text;
  font-size: 12px;
  font-style: italic;
  background: rgba(60, 211, 252, 0.16);
  border: 1px solid @quest-sheikah;
  cursor: pointer;
}

.training-step button:disabled {
  cursor: default;
  color: rgba(233, 225, 209, 0.58);
  background: rgba(0, 0, 0, 0.22);
  border-color: @quest-border;
}
</style>
