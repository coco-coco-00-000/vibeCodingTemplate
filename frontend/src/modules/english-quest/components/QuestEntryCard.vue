<template>
  <RouterLink
    class="quest-entry-card"
    :class="[`quest-entry-card--${tone}`, { 'quest-entry-card--locked': locked }]"
    :to="to"
    :aria-disabled="locked"
  >
    <span class="quest-entry-card__icon" aria-hidden="true">{{ icon }}</span>
    <span class="quest-entry-card__content">
      <span class="quest-entry-card__eyebrow">{{ kicker }}</span>
      <span class="quest-entry-card__title">{{ title }}</span>
      <span class="quest-entry-card__summary">{{ copy }}</span>
      <slot />
    </span>
    <span v-if="tag" class="quest-entry-card__status">{{ tag }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

withDefaults(
  defineProps<{
    title: string
    copy: string
    kicker: string
    icon: string
    to: RouteLocationRaw
    tone: 'blue' | 'gold'
    tag?: string
    locked?: boolean
  }>(),
  {
    tag: '',
    locked: false,
  },
)
</script>

<style lang="less" scoped>
@import '../styles/quest.less';

.quest-entry-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  min-height: 146px;
  padding: 18px;
  color: @quest-text;
  text-decoration: none;
  background:
    linear-gradient(145deg, rgba(8, 18, 36, 0.86), rgba(42, 44, 39, 0.86));
  border: 1px solid rgba(233, 225, 209, 0.28);
  box-shadow:
    inset 0 0 0 1px rgba(60, 211, 252, 0.18),
    0 16px 34px rgba(0, 0, 0, 0.24);
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.quest-entry-card--blue {
  background:
    linear-gradient(135deg, rgba(60, 211, 252, 0.14), transparent 42%),
    linear-gradient(145deg, rgba(8, 18, 36, 0.88), rgba(42, 44, 39, 0.86));
}

.quest-entry-card--gold {
  background:
    linear-gradient(135deg, rgba(252, 196, 19, 0.16), transparent 42%),
    linear-gradient(145deg, rgba(31, 28, 18, 0.9), rgba(42, 44, 39, 0.86));
}

.quest-entry-card:hover {
  color: @quest-text;
  border-color: fade(@quest-sheikah, 70%);
  box-shadow:
    inset 0 0 0 1px rgba(252, 196, 19, 0.24),
    0 0 26px rgba(60, 211, 252, 0.18),
    0 18px 38px rgba(0, 0, 0, 0.28);
  transform: translateY(-2px);
}

.quest-entry-card--locked {
  opacity: 0.74;
}

.quest-entry-card__icon {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  font-size: 30px;
  background: rgba(60, 211, 252, 0.12);
  border: 1px solid rgba(60, 211, 252, 0.42);
  box-shadow: inset 0 0 0 1px rgba(252, 196, 19, 0.16);
}

.quest-entry-card__content {
  display: grid;
  min-width: 0;
  gap: 8px;
}

.quest-entry-card__eyebrow,
.quest-entry-card__status {
  color: @quest-sheikah;
  font-size: 12px;
  font-style: italic;
}

.quest-entry-card__title {
  color: @quest-text;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
}

.quest-entry-card__summary {
  color: @quest-muted;
  font-size: 14px;
  font-style: italic;
  line-height: 1.4;
}

.quest-entry-card__status {
  justify-self: end;
  padding: 7px 10px;
  color: @quest-gold;
  border: 1px solid rgba(252, 196, 19, 0.42);
}

@media (max-width: 720px) {
  .quest-entry-card {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .quest-entry-card__status {
    grid-column: 1 / -1;
    justify-self: start;
  }
}
</style>
