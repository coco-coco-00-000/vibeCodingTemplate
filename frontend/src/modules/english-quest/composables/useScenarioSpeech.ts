import { ref } from 'vue'
import type { SpeechEvaluation } from '../types'

interface RecognitionResultItem {
  transcript: string
}

interface RecognitionEvent {
  results: ArrayLike<ArrayLike<RecognitionResultItem>>
}

interface RecognitionErrorEvent {
  error: string
}

interface RecognitionInstance {
  lang: string
  interimResults: boolean
  continuous: boolean
  onstart: (() => void) | null
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: ((event: RecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

interface RecognitionConstructor {
  new (): RecognitionInstance
}

type RecognitionWindow = Window & {
  SpeechRecognition?: RecognitionConstructor
  webkitSpeechRecognition?: RecognitionConstructor
}

export function evaluatePhrase(transcript: string, keywordGroups: string[][]): SpeechEvaluation {
  const normalized = transcript.toLowerCase().replace(/[?.!,']/g, ' ').replace(/\s+/g, ' ').trim()
  const missing = keywordGroups
    .map((alternatives, index) => (alternatives.some((word) => normalized.includes(word)) ? -1 : index))
    .filter((index) => index >= 0)

  return { passed: missing.length === 0, missing }
}

export function useScenarioSpeech() {
  const status = ref<'idle' | 'recording' | 'processing' | 'unsupported' | 'denied'>('idle')
  const transcript = ref('')
  const errorMessage = ref('')
  let recognition: RecognitionInstance | undefined

  function start(onResult: (text: string) => void) {
    const recognitionWindow = window as RecognitionWindow
    const Recognition = recognitionWindow.SpeechRecognition ?? recognitionWindow.webkitSpeechRecognition

    if (!Recognition) {
      status.value = 'unsupported'
      errorMessage.value = '当前浏览器暂不支持语音识别。'
      return
    }

    transcript.value = ''
    errorMessage.value = ''
    recognition = new Recognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = false
    recognition.onstart = () => {
      status.value = 'recording'
    }
    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript.trim() ?? ''
      status.value = 'processing'
      if (!text) {
        errorMessage.value = '没有听清，再说一遍也没关系。'
        status.value = 'idle'
        return
      }
      transcript.value = text
      onResult(text)
    }
    recognition.onerror = (event) => {
      status.value = event.error === 'not-allowed' || event.error === 'service-not-allowed' ? 'denied' : 'idle'
      errorMessage.value = status.value === 'denied' ? '麦克风未授权，你可以改用演示模式。' : '没有听清，再说一遍也没关系。'
    }
    recognition.onend = () => {
      if (status.value === 'recording' || status.value === 'processing') status.value = 'idle'
      recognition = undefined
    }

    try {
      recognition.start()
    } catch {
      status.value = 'idle'
      errorMessage.value = '录音没有开始，再试一次。'
      recognition = undefined
    }
  }

  function stop() {
    recognition?.stop()
  }

  function simulate(text: string, onResult: (value: string) => void) {
    transcript.value = text
    errorMessage.value = ''
    status.value = 'idle'
    onResult(text)
  }

  return { status, transcript, errorMessage, start, stop, simulate }
}
