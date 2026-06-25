---
name: ai-english-learning-demo
description: Use when designing or extending an AI native English learning demo with language training, scenario tasks, teaching-method structure, adaptive-learning placeholders, or Codex training homework materials.
---

# AI English Learning Demo

## Overview

This skill helps extend the AI Native English Quest demo without losing its core product logic: students first build language ability in a training field, then use that language in a realistic scenario task.

## When to Use

Use this skill when working on:

- AI native English learning product demos.
- Language training levels for junior secondary students in China.
- Scenario tasks such as WeChat invitations, shopping, seeing a doctor, or school-life conversations.
- Codex / Superpowers homework writeups based on this project.
- Frontend-only prototypes that need to show future adaptive or speech-evaluation logic.

Do not use it for unrelated generic Vue features.

## Product Pattern

Keep the product split into two learning spaces:

1. **Language Training Field**
   - Teach the target language.
   - Give controlled practice.
   - Let students build confidence and fluency.
   - Include optional mini-games for extra repetition.

2. **Scenario Quest**
   - Remove most scaffolding.
   - Put the learner in a realistic communication setting.
   - Ask the learner to use the language for a goal.
   - Give light feedback without breaking the sense of real use.

The training field is where language is learned. The scenario quest is where language is used.

## Teaching Flow

Prefer this sequence when designing new content:

1. **Meaningful exposure**: Show the language with image, context, audio, or chat.
2. **Recognition**: Let students identify meanings, sounds, or matching chunks.
3. **Structure noticing**: Help students see reusable sentence parts.
4. **Controlled production**: Let students build the sentence with support.
5. **Prompt withdrawal**: Remove support gradually.
6. **Scenario application**: Ask students to use the language in a realistic task.

Avoid dumping all content onto one page. Each mainline level should have one clear learning action.

## MVP Rules

For a first demo, keep hard AI features explainable and replaceable:

- Use local data instead of backend persistence.
- Use simple keyword-group checks instead of production speech scoring.
- Use visible mastery or recommendation rules instead of a real adaptive engine.
- Provide a demo fallback when microphone, speech recognition, or permissions fail.

The demo should be complete enough for product discussion, not technically final.

## Content Rules

Each scenario pack should define:

- Target learners.
- Communicative goal.
- Language chunks.
- Sentence pattern.
- Time/place/context expressions.
- Possible responses from the other speaker.
- Learner follow-up lines.
- Completion criteria.
- Optional mini-games that strengthen the same skills.

Use specific language items, not vague labels like "practice invitations".

## UI Rules

- First screen should be the usable product experience, not a marketing landing page.
- Keep training and scenario entries visible and distinct.
- Put mini-games inside the training field, not in the global top navigation.
- Scenario tasks should look like the real-world interface they simulate.
- Use visual assets for activities, characters, reactions, and task states.
- Keep text short inside cards and buttons.

## Superpowers Workflow

For meaningful changes:

1. Write or update a design spec in `docs/superpowers/specs/`.
2. Write or update an implementation plan in `docs/superpowers/plans/`.
3. Implement task by task.
4. Add tests for logic-heavy behavior such as scoring, routing, progress, or recommendation rules.
5. Verify with type-check, lint, tests, and browser review.
6. Commit design, plan, code, and project-skill updates separately when possible.

## Homework Writeup Checklist

When preparing Codex training homework, include:

- Original requirement.
- MVP scope.
- Acceptance criteria.
- Project Skill path.
- GitHub or GitLab repository link.
- Evidence of real business depth.
- Current limitations and next steps.

Good homework should make clear why the demo can support a real product conversation.
