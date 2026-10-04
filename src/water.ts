// A day's water log: glasses of 250 ml toward a goal.
export const GLASS_ML = 250

export function total(glasses: number): number {
  return glasses * GLASS_ML
}

export function progress(glasses: number, goalMl: number): number {
  return Math.min(1, total(glasses) / goalMl)
}

export const GOAL_DEFAULT_ML = 2000
export const GOAL_MIN_ML = 500
export const GOAL_MAX_ML = 5000
export const GOAL_STEP_ML = GLASS_ML // 250

/** Goal after one stepper press, clamped to [GOAL_MIN_ML, GOAL_MAX_ML]. */
export function stepGoal(goalMl: number, direction: 1 | -1): number {
  return Math.min(GOAL_MAX_ML, Math.max(GOAL_MIN_ML, goalMl + direction * GOAL_STEP_ML))
}

/** True once the day's total meets or passes the goal. */
export function goalReached(glasses: number, goalMl: number): boolean {
  return total(glasses) >= goalMl
}

/** Real, uncapped percentage of the goal, rounded to a whole number (e.g. 125). */
export function percentOfGoal(glasses: number, goalMl: number): number {
  return Math.round((total(glasses) / goalMl) * 100)
}

/** The text inside the bar: "1500 / 2000 ml (75%)". */
export function summaryText(glasses: number, goalMl: number): string {
  return `${total(glasses)} / ${goalMl} ml (${percentOfGoal(glasses, goalMl)}%)`
}
