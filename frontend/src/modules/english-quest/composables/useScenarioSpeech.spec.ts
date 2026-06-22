import { describe, expect, it } from 'vitest'
import { evaluatePhrase } from './useScenarioSpeech'

describe('evaluatePhrase', () => {
  it('accepts an invitation when intent, activity, and time are present', () => {
    expect(
      evaluatePhrase('Do you want to go swimming this Saturday?', [
        ['do you want to', 'want to'],
        ['go swimming', 'go swim'],
        ['this saturday', 'saturday'],
      ]),
    ).toEqual({ passed: true, missing: [] })
  })

  it('accepts tolerant variants and reports only missing meaning groups', () => {
    expect(
      evaluatePhrase('I want to go swim Saturday', [['want to'], ['go swimming', 'go swim'], ['this saturday', 'saturday']]),
    ).toEqual({
      passed: true,
      missing: [],
    })
    expect(
      evaluatePhrase('Do you want to go swimming?', [['do you want to'], ['go swimming'], ['this saturday']]),
    ).toEqual({
      passed: false,
      missing: [2],
    })
  })
})
