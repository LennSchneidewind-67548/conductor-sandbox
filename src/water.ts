// A day's water log: glasses of 250 ml toward a goal.
export const GLASS_ML = 250

export function total(glasses: number): number {
  return glasses * GLASS_ML
}

export function progress(glasses: number, goalMl: number): number {
  return Math.min(1, total(glasses) / goalMl)
}
