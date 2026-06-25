<template>
  <section class="wechat-chat" aria-label="微信邀约实战">
    <header class="wechat-chat__header">
      <button type="button" aria-label="返回任务列表" @click="$emit('back')">←</button>
      <div>
        <strong>{{ task.friendName }}</strong>
        <span>{{ task.friendRole }}</span>
      </div>
      <img :src="friendAvatar" :alt="task.friendName" />
    </header>

    <div class="wechat-chat__thread">
      <p class="wechat-chat__notice">{{ task.taskPrompt }}</p>

      <div v-if="phase !== 'invite'" class="wechat-message wechat-message--self">
        <div class="wechat-message__body wechat-message__body--self">
          <span class="wechat-message__voice">语音消息 <i></i><i></i><i></i></span>
          <small>{{ invitationTranscript }}</small>
        </div>
        <img :src="linkAvatar" alt="林克" />
      </div>

      <div v-if="phase !== 'invite'" class="wechat-message wechat-message--friend">
        <img :src="friendAvatar" :alt="task.friendName" />
        <div class="wechat-message__body">
          <strong>{{ task.responseText }}</strong>
          <small>{{ task.responseZh }}</small>
        </div>
      </div>

      <template v-if="phase === 'complete'">
        <div class="wechat-message wechat-message--self">
          <div class="wechat-message__body wechat-message__body--self">
            <span class="wechat-message__voice">语音消息 <i></i><i></i><i></i></span>
            <small>{{ followUpTranscript }}</small>
          </div>
          <img :src="linkAvatar" alt="林克" />
        </div>
        <div class="wechat-message wechat-message--self wechat-message--sticker">
          <img :src="reactionImage" :alt="task.responseText.includes('Sorry') ? '林克遗憾' : '林克开心'" />
          <img :src="linkAvatar" alt="林克" />
        </div>
        <p class="wechat-chat__notice wechat-chat__notice--complete">邀约完成，已获得 {{ task.badgeTitle }}。</p>
        <button type="button" class="wechat-chat__finish" @click="$emit('back')">返回任务列表</button>
      </template>
    </div>

    <ScenarioVoiceComposer
      v-if="phase !== 'complete'"
      :recording="recording"
      :message="message"
      :hint="hint"
      :hint-visible="hintVisible"
      :fallback-available="fallbackAvailable"
      @start-recording="$emit('startRecording')"
      @stop-recording="$emit('stopRecording')"
      @show-hint="$emit('showHint')"
      @simulate="$emit('simulate')"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import linkAvatar from '../assets/link-swimming.png'
import linkReactionHappy from '../assets/link-reaction-happy.png'
import linkReactionSad from '../assets/link-reaction-sad.png'
import princessAvatar from '../assets/princess-selfie.png'
import purahAvatar from '../assets/purah-avatar.png'
import tulinAvatar from '../assets/tulin-avatar.png'
import type { ScenarioChatPhase, ScenarioTask } from '../types'
import ScenarioVoiceComposer from './ScenarioVoiceComposer.vue'

const props = defineProps<{
  task: ScenarioTask
  phase: ScenarioChatPhase
  invitationTranscript: string
  followUpTranscript: string
  message: string
  recording: boolean
  fallbackAvailable: boolean
  hintVisible: boolean
}>()

defineEmits<{
  back: []
  startRecording: []
  stopRecording: []
  showHint: []
  simulate: []
}>()

const avatarMap: Record<ScenarioTask['friendAvatar'], string> = {
  princess: princessAvatar,
  purah: purahAvatar,
  tulin: tulinAvatar,
}

const friendAvatar = computed(() => avatarMap[props.task.friendAvatar])
const hint = computed(() =>
  props.phase === 'invite'
    ? `Do you want to ${props.task.activityLabel} ${props.task.timeLabel}?`
    : props.task.expectedFollowUp,
)
const reactionImage = computed(() => (props.task.responseText.includes('Sorry') ? linkReactionSad : linkReactionHappy))
</script>

<style lang="less" scoped>
.wechat-chat {
  display: grid;
  grid-template-rows: auto minmax(460px, 1fr) auto;
  width: min(760px, 100%);
  min-height: 680px;
  margin: 0 auto;
  overflow: hidden;
  color: #1d1d1d;
  background: #ededed;
  border: 1px solid #c8c8c8;
  box-shadow: 0 22px 48px rgba(0, 0, 0, 0.28);
}

.wechat-chat__header {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 42px;
  gap: 10px;
  align-items: center;
  padding: 12px 16px;
  background: #f7f7f7;
  border-bottom: 1px solid #d4d4d4;
}

.wechat-chat__header button {
  width: 34px;
  height: 34px;
  padding: 0;
  color: #202020;
  font-size: 24px;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.wechat-chat__header div {
  display: grid;
  gap: 1px;
}

.wechat-chat__header strong {
  font-size: 17px;
}

.wechat-chat__header span {
  color: #8b8b8b;
  font-size: 12px;
}

.wechat-chat__header img,
.wechat-message > img {
  width: 42px;
  height: 42px;
  object-fit: cover;
}

.wechat-chat__thread {
  display: grid;
  align-content: start;
  gap: 15px;
  min-height: 0;
  padding: 18px;
  overflow-y: auto;
  background: #ededed;
}

.wechat-chat__notice {
  justify-self: center;
  max-width: 86%;
  margin: 0 0 4px;
  padding: 6px 10px;
  color: #818181;
  font-size: 12px;
  line-height: 1.4;
  text-align: center;
  background: rgba(255, 255, 255, 0.62);
}

.wechat-chat__notice--complete {
  color: #4f6d3d;
}

.wechat-message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.wechat-message--self {
  justify-self: end;
}

.wechat-message__body {
  display: grid;
  gap: 5px;
  max-width: min(440px, calc(100vw - 150px));
  padding: 11px 13px;
  background: #fff;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.08);
}

.wechat-message__body--self {
  background: #95ec69;
}

.wechat-message__body strong {
  font-size: 17px;
  font-weight: 500;
}

.wechat-message__body small {
  color: #757575;
  font-size: 12px;
}

.wechat-message__voice {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  min-width: 120px;
  color: #2d3f26;
}

.wechat-message__voice i {
  display: block;
  width: 3px;
  height: 10px;
  background: currentColor;
}

.wechat-message__voice i:nth-child(3) {
  height: 15px;
}

.wechat-message__voice i:nth-child(4) {
  height: 7px;
}

.wechat-message--sticker {
  gap: 10px;
  align-items: flex-end;
}

.wechat-message--sticker > img:first-child {
  width: 100px;
  height: 100px;
  border: 1px solid #d2d2d2;
}

.wechat-chat__finish {
  justify-self: center;
  padding: 10px 16px;
  color: #fff;
  font: inherit;
  cursor: pointer;
  background: #07c160;
  border: 1px solid #05a650;
}

@media (max-width: 720px) {
  .wechat-chat {
    min-height: 600px;
  }
}
</style>
