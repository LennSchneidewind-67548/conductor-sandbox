import { describe, expect, it } from 'vitest'
import {
  GLASS_ML,
  GOAL_DEFAULT_ML,
  GOAL_MAX_ML,
  GOAL_MIN_ML,
  GOAL_STEP_ML,
  goalReached,
  percentOfGoal,
  progress,
  stepGoal,
  summaryText,
  total,
} from './water'

describe('water', () => {
  it('counts glasses in ml', () => expect(total(3)).toBe(750))
  it('caps progress at 1', () => expect(progress(20, 2000)).toBe(1))
  it('caps progress at 1 for a custom goal', () => expect(progress(10, 1500)).toBe(1))
})

describe('stepGoal', () => {
  it('steps by 250', () => {
    expect(stepGoal(2000, 1)).toBe(2250)
    expect(stepGoal(2000, -1)).toBe(1750)
  })
  it('clamps at the bounds', () => {
    expect(stepGoal(500, -1)).toBe(500)
    expect(stepGoal(5000, 1)).toBe(5000)
    expect(stepGoal(750, -1)).toBe(500)
    expect(stepGoal(4750, 1)).toBe(5000)
  })
})

describe('goalReached', () => {
  it('is false below, true at and above the goal', () => {
    expect(goalReached(7, 2000)).toBe(false)
    expect(goalReached(8, 2000)).toBe(true)
    expect(goalReached(10, 2000)).toBe(true)
  })
  it('works with a custom goal', () => expect(goalReached(2, 500)).toBe(true))
})

describe('percentOfGoal', () => {
  it('is uncapped and rounded', () => {
    expect(percentOfGoal(6, 2000)).toBe(75)
    expect(percentOfGoal(10, 2000)).toBe(125)
    expect(percentOfGoal(0, 2000)).toBe(0)
    expect(percentOfGoal(1, 3000)).toBe(8)
  })
})

describe('summaryText', () => {
  it('formats total, goal and percent', () => {
    expect(summaryText(6, 2000)).toBe('1500 / 2000 ml (75%)')
    expect(summaryText(10, 2000)).toBe('2500 / 2000 ml (125%)')
  })
})

describe('constants', () => {
  it('step equals one glass', () => expect(GOAL_STEP_ML).toBe(GLASS_ML))
  it('default lies within range', () => {
    expect(GOAL_DEFAULT_ML).toBeGreaterThanOrEqual(GOAL_MIN_ML)
    expect(GOAL_DEFAULT_ML).toBeLessThanOrEqual(GOAL_MAX_ML)
  })
})
