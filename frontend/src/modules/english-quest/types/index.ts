export type SkillKey =
  | 'activity-chunks'
  | 'invitation-pattern'
  | 'time-expressions'
  | 'response-understanding'
  | 'conversation-closing'

export type TrainingMissionId = 'mission-1' | 'mission-2'
export type StepStatus = 'locked' | 'available' | 'complete'
export type ResponseKind = 'accept' | 'refuse'

export interface ActivityChunk {
  id: string
  text: string
  zh: string
  imageLabel: string
  emoji: string
  example: string
}

export interface TimeExpression {
  id: string
  text: string
  zh: string
}

export interface FriendResponse {
  id: string
  text: string
  zh: string
  kind: ResponseKind
}

export interface ClosingExpression {
  id: string
  text: string
  zh: string
  useWhen: ResponseKind
}

export interface TrainingStep {
  id: string
  missionId: TrainingMissionId
  title: string
  goal: string
  interaction: string
  skillKeys: SkillKey[]
}

export interface MiniGame {
  id: string
  title: string
  description: string
  skillKeys: SkillKey[]
  routeName: string
}

export interface ScenarioTask {
  id: string
  friendName: string
  clue: string
  activityId: string
  timeId: string
  responseId: string
  expectedInvitation: string
  expectedFollowUp: string
}

export interface MasteryEntry {
  key: SkillKey
  label: string
  value: number
}
