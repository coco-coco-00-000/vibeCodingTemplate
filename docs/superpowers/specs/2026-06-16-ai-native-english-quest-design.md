# AI Native English Quest Design

## Purpose

Build a playable frontend prototype for an AI-native English learning product for Chinese middle-school students. The product should combine language training, game-like motivation, and realistic language application.

The first scenario is a weekend invitation quest. Learners train the language they need, then use it in a WeChat-style real scenario.

## First Version Scope

The first version uses the "training field + real scenario" structure.

- Training Field: learn and practice the required language knowledge and skills.
- Real Scenario Quest: apply the learned language in a realistic WeChat invitation task.
- Adaptive Rules: show explainable recommendation logic in the frontend, but do not implement a real recommendation algorithm.

The first version is a demonstration prototype, not a production adaptive learning engine.

## Product Structure

### Home / Quest Hub

The home screen presents two parallel entry points:

- Language Training Field.
- Real Scenario Quest.

The scenario quest can be opened directly, but the UI should recommend completing the training field first. The page should feel like a game quest hub rather than a product explanation page.

Visual direction:

- Zelda / Sheikah-inspired dark fantasy UI.
- Minimal text on entry cards.
- Use task cards, scene imagery, status, and visual affordances instead of long explanatory copy.
- Avoid bottom explanation panels such as "AI rules" or "rewards" on the first screen.

### Language Training Field

The training field has two parts:

- Mainline learning flow.
- Optional fun practice.

The mainline keeps the complete learning logic from the existing HTML demo's Mission 1 and Mission 2, then expands the language content for the new scenario.

Mainline Mission 1: Activity Cards

- Language exposure.
- Listen and choose image.
- Read text and choose image.
- Listen and choose English text.
- Match English chunks with activity images.
- Recall with alternate images.
- Say the activity from image.

Mainline Mission 2: Invitation Language

- Discover the invitation sentence.
- Notice sentence chunks.
- Fill activity into the sentence.
- Build the sentence from chunks.
- Repeat the full sentence.
- Fade prompts progressively.
- Transfer to changed activity and time.

Completion rule for the first version:

- Each mainline step only needs to be completed once.
- Mastery can be displayed as a frontend value.
- Mastery does not block progress in this version.

Optional fun practice:

- Chunk matching mini-game, such as a "chunk match" or "chunk elimination" game.
- Sentence-pattern mini-game around `Do you want to + activity + time`.
- Optional practice increases displayed mastery, but does not block mainline progress.

### Real Scenario Quest

The real scenario should feel less like a quiz and more like an actual WeChat communication task.

The first version should provide a WeChat-style interface where learners complete multiple invitation tasks:

- Read friend clues.
- Send an appropriate English invitation.
- Understand friend responses.
- Confirm the plan or close politely.
- Complete several invitations with different friends and activities.

The scenario should remove most scaffolding. Scaffolding belongs in the training field. In the scenario, the learner sees goals, clues, a realistic chat interface, and light feedback.

First version interaction:

- Text/message invitation first.
- Phone-call invitation is a future upgrade.

## Language Content

### Activity Chunks

Use five activity chunks:

- `go swimming` - 去游泳
- `play basketball` - 打篮球
- `watch a movie` - 看电影
- `go shopping` - 去购物
- `play video games` - 打电子游戏

### Invitation Pattern

- `Do you want to ...?`
- Example: `Do you want to go swimming this Saturday?`
- Example: `Do you want to watch a movie this Sunday?`

### Time Expressions

- `this Saturday` - 这周六
- `this Sunday` - 这周日
- `tomorrow` - 明天

Do not include `after school` in the first version.

### Friend Responses

Acceptance:

- `Sure! I'd love to.`
- `Sounds good.`

Refusal:

- `Sorry, I can't.`
- `Maybe next time.`

`Maybe next time.` is kept as a friend's response, not as the learner's polite closing.

### Confirmation / Closing

Confirmation:

- `Great! See you then.`

Polite closing:

- `No problem.`

Do not include these in the first version:

- `OK, see you on Sunday.`
- `Let's meet after school.`
- `That's OK.`

## Adaptive Rule Boundary

The first version should present explainable adaptive rules but not implement a technical adaptive engine.

Example frontend rules:

- If a learner struggles with activity chunks, recommend chunk mini-games.
- If a learner completes mainline training, recommend scenario quest.
- If a learner fails a scenario task, recommend returning to the related training point.
- Optional mini-games increase displayed mastery for the relevant skill.

The engineering team can later replace these frontend rules with real adaptive recommendation logic.

## Data Model Sketch

Suggested frontend data groups:

- `activities`: activity chunks, images, Chinese meaning, example sentences.
- `patterns`: invitation pattern and chunk roles.
- `timeExpressions`: time cards.
- `responses`: acceptance/refusal responses.
- `closings`: confirmation and polite closing expressions.
- `trainingSteps`: ordered mainline steps for Mission 1 and Mission 2.
- `miniGames`: optional practice items mapped to skill keys.
- `scenarioTasks`: friend, clue, target activity, time, expected invitation, response, expected follow-up.
- `mastery`: displayed skill progress by skill key.

## Acceptance Criteria

The prototype is successful when:

- The home screen shows both Training Field and Real Scenario Quest as parallel entries.
- The Training Field contains the mainline Mission 1 and Mission 2 learning flow.
- The Training Field uses the confirmed first-version language content.
- The Training Field includes at least one optional fun practice concept, such as chunk matching.
- The Real Scenario Quest uses a WeChat-style chat interface.
- The Real Scenario Quest supports multiple invitation tasks with different friends or activities.
- The scenario feels like real application, not a step-by-step quiz.
- The UI follows Zelda / Sheikah-inspired visual direction without becoming text-heavy.
- Mastery and adaptive recommendations are shown as explainable frontend rules.
- No real adaptive algorithm, account system, backend persistence, or phone-call feature is required in the first version.

## Out Of Scope

- Real adaptive recommendation engine.
- Speech recognition scoring.
- Phone-call practice.
- User accounts.
- Backend persistence.
- Full curriculum system.
- Teacher dashboard.
- Complex location negotiation.
- Long free-chat conversation.

## Future Extensions

- Replace frontend adaptive rules with engineering-owned adaptive recommendation logic.
- Add phone-call invitation practice.
- Add more scenario packs, such as shopping or doctor visits.
- Add a skill tree / language inventory layer.
- Add richer sentence-pattern games.
- Add teacher-facing analytics after the learner experience is stable.
