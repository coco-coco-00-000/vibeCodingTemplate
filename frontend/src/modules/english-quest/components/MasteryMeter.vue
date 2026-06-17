<template>
  <div class="mastery-meter">
    <div class="mastery-meter__top">
      <span>{{ label }}</span>
      <strong>{{ clampedValue }}%</strong>
    </div>
    <div class="mastery-meter__track" role="meter" :aria-valuenow="clampedValue" aria-valuemin="0" aria-valuemax="100">
      <span class="mastery-meter__fill" :style="{ width: `${clampedValue}%` }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: number
}>()

const clampedValue = computed(() => Math.max(0, Math.min(100, Math.round(props.value))))
</script>

<style lang="less" scoped>
@import '../styles/quest.less';

.mastery-meter {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.mastery-meter__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: @quest-muted;
  font-size: 13px;
  font-style: italic;
}

.mastery-meter__top span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mastery-meter__top strong {
  color: @quest-gold;
  font-size: 12px;
}

.mastery-meter__track {
  position: relative;
  height: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.34);
  border: 1px solid rgba(233, 225, 209, 0.22);
}

.mastery-meter__fill {
  position: absolute;
  inset: 0 auto 0 0;
  background:
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.24) 0 2px, transparent 2px 9px),
    linear-gradient(90deg, @quest-sheikah, @quest-gold);
  box-shadow: 0 0 18px rgba(60, 211, 252, 0.4);
}
</style>
