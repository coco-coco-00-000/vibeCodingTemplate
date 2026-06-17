<script setup lang="ts">
import type { ActivityChunk } from '../types'

defineProps<{
  activity: ActivityChunk
  lit?: boolean
}>()
</script>

<template>
  <article class="activity-card" :class="{ 'activity-card--lit': lit }">
    <div class="activity-card__image">
      <span aria-hidden="true">{{ activity.emoji }}</span>
    </div>
    <div class="activity-card__body">
      <strong>{{ activity.text }}</strong>
      <span>{{ activity.zh }}</span>
      <small>{{ activity.imageLabel }}</small>
    </div>
  </article>
</template>

<style lang="less" scoped>
@import '../styles/quest.less';

.activity-card {
  display: grid;
  min-height: 146px;
  overflow: hidden;
  color: @quest-text;
  background:
    linear-gradient(145deg, rgba(60, 211, 252, 0.08), transparent 44%),
    rgba(0, 0, 0, 0.42);
  border: 1px solid @quest-border;
  box-shadow: inset 0 0 0 1px rgba(252, 196, 19, 0.08);
}

.activity-card--lit {
  border-color: rgba(60, 211, 252, 0.72);
  box-shadow:
    inset 0 0 0 1px rgba(252, 196, 19, 0.14),
    0 0 18px rgba(60, 211, 252, 0.2);
}

.activity-card__image {
  display: grid;
  min-height: 68px;
  place-items: center;
  background:
    radial-gradient(circle, rgba(252, 196, 19, 0.14), transparent 62%),
    rgba(233, 225, 209, 0.06);
}

.activity-card__image span {
  font-size: 34px;
  line-height: 1;
}

.activity-card__body {
  display: grid;
  gap: 4px;
  padding: 10px;
}

.activity-card strong {
  color: @quest-text;
  font-size: 14px;
  line-height: 1.15;
}

.activity-card span,
.activity-card small {
  color: @quest-muted;
  font-size: 12px;
  font-style: italic;
  line-height: 1.25;
}
</style>
