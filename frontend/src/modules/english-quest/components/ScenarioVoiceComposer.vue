<template>
  <section class="voice-composer" aria-label="语音输入">
    <p v-if="message" class="voice-composer__message">{{ message }}</p>
    <p v-else-if="hintVisible" class="voice-composer__hint">{{ hint }}</p>
    <p v-else class="voice-composer__guide">点击录音，用英语说出来。</p>

    <div class="voice-composer__controls">
      <button type="button" class="voice-composer__record" :class="{ 'voice-composer__record--active': recording }" @click="recording ? $emit('stopRecording') : $emit('startRecording')">
        <span aria-hidden="true">●</span>
        {{ recording ? '结束录音' : '录音' }}
      </button>
      <button type="button" class="voice-composer__secondary" @click="$emit('showHint')">给点提示</button>
      <button v-if="fallbackAvailable" type="button" class="voice-composer__secondary" @click="$emit('simulate')">模拟识别成功</button>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  recording: boolean
  message: string
  hint: string
  hintVisible: boolean
  fallbackAvailable: boolean
}>()

defineEmits<{
  startRecording: []
  stopRecording: []
  showHint: []
  simulate: []
}>()
</script>

<style lang="less" scoped>
.voice-composer {
  display: grid;
  gap: 10px;
  padding: 14px 16px 16px;
  background: #f7f7f7;
  border-top: 1px solid #d7d7d7;
}

.voice-composer p {
  min-height: 20px;
  margin: 0;
  color: #7a7a7a;
  font-size: 13px;
}

.voice-composer__message {
  color: #a56520 !important;
}

.voice-composer__hint {
  color: #3f6d92 !important;
}

.voice-composer__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.voice-composer__record,
.voice-composer__secondary {
  min-height: 40px;
  padding: 0 14px;
  font: inherit;
  cursor: pointer;
}

.voice-composer__record {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  color: #fff;
  background: #07c160;
  border: 1px solid #05a650;
}

.voice-composer__record--active {
  color: #fff2f2;
  background: #df4b4b;
  border-color: #c33e3e;
}

.voice-composer__record--active span {
  animation: voice-pulse 0.9s ease-in-out infinite alternate;
}

.voice-composer__secondary {
  color: #4c4c4c;
  background: #fff;
  border: 1px solid #d2d2d2;
}

@keyframes voice-pulse {
  to {
    opacity: 0.35;
  }
}
</style>
