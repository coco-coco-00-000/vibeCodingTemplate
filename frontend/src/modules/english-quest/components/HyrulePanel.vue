<template>
  <section class="hyrule-panel" :class="{ 'hyrule-panel--glow': glow }">
    <div v-if="$slots.header || title" class="hyrule-panel__header">
      <slot name="header">
        <p v-if="kicker" class="hyrule-panel__kicker">{{ kicker }}</p>
        <h2>{{ title }}</h2>
      </slot>
    </div>
    <div class="hyrule-panel__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    kicker?: string
    glow?: boolean
  }>(),
  {
    title: '',
    kicker: '',
    glow: false,
  },
)
</script>

<style lang="less" scoped>
@import '../styles/quest.less';

.hyrule-panel {
  position: relative;
  overflow: hidden;
  padding: 20px;
  color: @quest-text;
  background:
    linear-gradient(135deg, rgba(60, 211, 252, 0.09), transparent 32%),
    @quest-panel;
  border: 1px solid @quest-border;
  box-shadow:
    inset 0 0 0 1px rgba(252, 196, 19, 0.2),
    0 18px 42px rgba(0, 0, 0, 0.28);
}

.hyrule-panel::before,
.hyrule-panel::after {
  position: absolute;
  width: 34px;
  height: 34px;
  border-color: fade(@quest-gold, 75%);
  border-style: solid;
  content: '';
}

.hyrule-panel::before {
  top: 8px;
  left: 8px;
  border-width: 1px 0 0 1px;
}

.hyrule-panel::after {
  right: 8px;
  bottom: 8px;
  border-width: 0 1px 1px 0;
}

.hyrule-panel--glow {
  box-shadow:
    inset 0 0 0 1px rgba(252, 196, 19, 0.26),
    0 0 28px rgba(60, 211, 252, 0.18),
    0 18px 42px rgba(0, 0, 0, 0.3);
}

.hyrule-panel__header {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 4px;
  margin-bottom: 14px;
}

.hyrule-panel__header h2 {
  margin: 0;
  color: @quest-text;
  font-size: 21px;
  line-height: 1.2;
  letter-spacing: 0;
}

.hyrule-panel__kicker {
  margin: 0;
  color: @quest-sheikah;
  font-size: 12px;
  font-style: italic;
}

.hyrule-panel__body {
  position: relative;
  z-index: 1;
}
</style>
