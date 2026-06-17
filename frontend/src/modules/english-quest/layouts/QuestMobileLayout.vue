<template>
  <div class="quest-desktop" role="application" aria-label="周末邀约英语学习演示">
    <header class="quest-desktop__topbar">
      <RouterLink :to="{ name: 'english-quest-hub' }" class="quest-desktop__brand">
        <span>weekend invitation</span>
        <strong>周末邀约</strong>
      </RouterLink>

      <nav class="quest-desktop__nav" aria-label="主导航">
        <RouterLink :to="{ name: 'english-quest-hub' }" active-class="is-active">首页</RouterLink>
        <RouterLink :to="{ name: 'english-quest-training' }" active-class="is-active">训练场</RouterLink>
        <RouterLink :to="{ name: 'english-quest-chunk-match' }" active-class="is-active">语块消消乐</RouterLink>
        <RouterLink :to="{ name: 'english-quest-sentence-blocks' }" active-class="is-active">句子俄罗斯方块</RouterLink>
        <RouterLink :to="{ name: 'english-quest-scenario' }" active-class="is-active">场景任务</RouterLink>
      </nav>
    </header>

    <main class="quest-desktop__content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style lang="less" scoped>
@import '../styles/quest.less';

.quest-desktop {
  min-height: 100%;
  color: @quest-text;
  background:
    radial-gradient(circle at 12% 8%, rgba(60, 211, 252, 0.14), transparent 28%),
    radial-gradient(circle at 88% 0%, rgba(252, 196, 19, 0.08), transparent 22%),
    linear-gradient(160deg, #171815, #34342f 46%, #111722);
}

.quest-desktop__topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 24px;
  align-items: center;
  min-height: 72px;
  padding: 14px 40px;
  background: rgba(6, 8, 7, 0.82);
  border-bottom: 1px solid rgba(233, 225, 209, 0.14);
  backdrop-filter: blur(16px);
}

.quest-desktop__brand {
  display: grid;
  color: @quest-text;
  text-decoration: none;
}

.quest-desktop__brand span {
  color: @quest-sheikah;
  font-size: 12px;
  font-style: italic;
}

.quest-desktop__brand strong {
  color: @quest-text;
  font-size: 22px;
  line-height: 1.1;
}

.quest-desktop__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.quest-desktop__nav a {
  min-height: 38px;
  display: inline-grid;
  place-items: center;
  padding: 0 14px;
  color: rgba(233, 225, 209, 0.72);
  font-size: 13px;
  font-style: italic;
  text-decoration: none;
  border: 1px solid transparent;
}

.quest-desktop__nav a.is-active {
  color: @quest-gold;
  background: rgba(252, 196, 19, 0.08);
  border-color: rgba(252, 196, 19, 0.36);
}

.quest-desktop__content {
  min-height: calc(100vh - 72px);
}

@media (max-width: 860px) {
  .quest-desktop__topbar {
    grid-template-columns: 1fr;
    padding: 14px 18px;
  }

  .quest-desktop__nav {
    justify-content: flex-start;
  }
}
</style>
