<template>
  <div class="quest-device-stage">
    <div class="quest-device" role="application" aria-label="周末邀约手机原型">
      <div class="quest-device__bezel">
        <div class="quest-device__screen">
          <header class="quest-device__status" aria-label="手机状态栏">
            <span>9:41</span>
            <span class="quest-device__signals">●●● 5G ▰</span>
          </header>

          <section class="quest-device__appbar" :class="{ 'quest-device__appbar--compact': !currentTitle }">
            <div>
              <p>{{ currentKicker }}</p>
              <h1 v-if="currentTitle">{{ currentTitle }}</h1>
            </div>
          </section>

          <main class="quest-device__content">
            <RouterView />
          </main>

          <nav class="quest-device__nav" aria-label="底部导航">
            <RouterLink :to="{ name: 'english-quest-hub' }" active-class="is-active">
              <span aria-hidden="true">⌂</span>
              <b>首页</b>
            </RouterLink>
            <RouterLink :to="{ name: 'english-quest-training' }" active-class="is-active">
              <span aria-hidden="true">✦</span>
              <b>训练</b>
            </RouterLink>
            <RouterLink :to="{ name: 'english-quest-scenario' }" active-class="is-active">
              <span aria-hidden="true">☎</span>
              <b>任务</b>
            </RouterLink>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

const pageMeta = {
  'english-quest-hub': ['weekend invitation', ''],
  'english-quest-training': ['Training Field', '语言训练场'],
  'english-quest-chunk-match': ['Mini Game', '语块消消乐'],
  'english-quest-sentence-blocks': ['Mini Game', '句型方块'],
  'english-quest-scenario': ['Scenario Quest', '微信邀约任务'],
  'english-quest-report': ['Report', '学习报告'],
} as const

const currentMeta = computed(() => pageMeta[route.name as keyof typeof pageMeta] ?? pageMeta['english-quest-hub'])
const currentKicker = computed(() => currentMeta.value[0])
const currentTitle = computed(() => currentMeta.value[1])
</script>

<style lang="less" scoped>
@import '../styles/quest.less';

.quest-device-stage {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 28px;
  background:
    radial-gradient(circle at 50% 0%, rgba(60, 211, 252, 0.16), transparent 26%),
    linear-gradient(160deg, #171815, #34342f 46%, #111722);
}

.quest-device {
  width: min(100%, 414px);
  height: min(900px, calc(100vh - 56px));
  min-height: 720px;
  padding: 12px;
  background: linear-gradient(145deg, #1c1c1a, #060807);
  border: 1px solid rgba(233, 225, 209, 0.18);
  border-radius: 36px;
  box-shadow:
    0 34px 86px rgba(0, 0, 0, 0.5),
    inset 0 0 0 2px rgba(233, 225, 209, 0.08);
}

.quest-device__bezel,
.quest-device__screen {
  width: 100%;
  height: 100%;
}

.quest-device__bezel {
  padding: 6px;
  background: #0d100e;
  border: 1px solid rgba(252, 196, 19, 0.2);
  border-radius: 28px;
}

.quest-device__screen {
  overflow: hidden;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  color: @quest-text;
  background:
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.025) 0 1px, transparent 1px 6px),
    radial-gradient(circle at 18% 10%, rgba(60, 211, 252, 0.18), transparent 30%),
    linear-gradient(160deg, rgba(8, 18, 36, 0.98), rgba(31, 34, 30, 0.98)),
    @quest-bg;
  border-radius: 22px;
}

.quest-device__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 34px;
  padding: 0 18px;
  color: rgba(233, 225, 209, 0.82);
  font-size: 12px;
  font-weight: 700;
}

.quest-device__signals {
  color: @quest-sheikah;
  font-size: 11px;
  letter-spacing: 0;
}

.quest-device__appbar {
  display: flex;
  align-items: center;
  min-height: 72px;
  padding: 12px 18px 16px;
  border-bottom: 1px solid rgba(233, 225, 209, 0.14);
}

.quest-device__appbar--compact {
  min-height: 48px;
  padding-block: 8px 10px;
}

.quest-device__appbar p {
  margin: 0 0 4px;
  color: @quest-sheikah;
  font-size: 11px;
  font-style: italic;
}

.quest-device__appbar h1 {
  margin: 0;
  color: @quest-text;
  font-size: 22px;
  line-height: 1.12;
  letter-spacing: 0;
}

.quest-device__content {
  min-height: 0;
  overflow: auto;
}

.quest-device__nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  padding: 9px 12px 14px;
  background: rgba(6, 8, 7, 0.82);
  border-top: 1px solid rgba(233, 225, 209, 0.14);
}

.quest-device__nav a {
  display: grid;
  min-width: 0;
  height: 50px;
  place-items: center;
  align-content: center;
  gap: 2px;
  color: rgba(233, 225, 209, 0.66);
  border: 1px solid transparent;
}

.quest-device__nav span {
  color: inherit;
  font-size: 18px;
  line-height: 1;
}

.quest-device__nav b {
  color: inherit;
  font-size: 11px;
  font-style: italic;
  font-weight: 700;
}

.quest-device__nav a.is-active {
  color: @quest-gold;
  background: rgba(252, 196, 19, 0.08);
  border-color: rgba(252, 196, 19, 0.36);
}

@media (max-width: 520px) {
  .quest-device-stage {
    padding: 0;
  }

  .quest-device {
    width: 100%;
    height: 100vh;
    min-height: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
  }

  .quest-device__bezel,
  .quest-device__screen {
    border-radius: 0;
  }

  .quest-device__bezel {
    padding: 0;
    border: 0;
  }
}
</style>
