import {
  GOAL_DEFAULT_ML,
  GOAL_MAX_ML,
  GOAL_MIN_ML,
  goalReached,
  progress,
  stepGoal,
  summaryText,
} from './water'

let glasses = 0
let goalMl = GOAL_DEFAULT_ML

const app = document.querySelector<HTMLDivElement>('#app')!

let goalValue: HTMLElement
let goalDec: HTMLElement
let goalInc: HTMLElement
let bar: HTMLElement
let barFill: HTMLElement
let summary: HTMLElement
let goalBadge: HTMLElement

function mount() {
  app.innerHTML = `
    <h1>Water</h1>
    <div class="goal-row">
      <span class="goal-label">Goal</span>
      <button type="button" id="goal-dec" class="step-btn" aria-label="Decrease goal">−</button>
      <span id="goal-value" class="goal-value" aria-live="polite">2000 ml</span>
      <button type="button" id="goal-inc" class="step-btn" aria-label="Increase goal">+</button>
    </div>
    <div class="bar-wrap">
      <div id="bar" class="bar" role="progressbar" aria-label="Daily goal progress"
           aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div id="bar-fill" class="bar-fill"></div>
      </div>
      <p id="summary" class="bar-text"></p>
    </div>
    <div id="goal-status" role="status">
      <span id="goal-reached" class="badge" hidden><span aria-hidden="true">✓</span> Goal reached</span>
    </div>
    <button type="button" id="add">+ glass</button>`

  goalValue = app.querySelector<HTMLElement>('#goal-value')!
  goalDec = app.querySelector<HTMLElement>('#goal-dec')!
  goalInc = app.querySelector<HTMLElement>('#goal-inc')!
  bar = app.querySelector<HTMLElement>('#bar')!
  barFill = app.querySelector<HTMLElement>('#bar-fill')!
  summary = app.querySelector<HTMLElement>('#summary')!
  goalBadge = app.querySelector<HTMLElement>('#goal-reached')!

  app.querySelector('#add')!.addEventListener('click', () => { glasses++; update() })
  goalDec.addEventListener('click', () => { goalMl = stepGoal(goalMl, -1); update() })
  goalInc.addEventListener('click', () => { goalMl = stepGoal(goalMl, 1); update() })
  update()
}

function update() {
  goalValue.textContent = `${goalMl} ml`
  goalDec.setAttribute('aria-disabled', String(goalMl <= GOAL_MIN_ML))
  goalInc.setAttribute('aria-disabled', String(goalMl >= GOAL_MAX_ML))
  const p = progress(glasses, goalMl)
  barFill.style.width = `${p * 100}%`
  bar.setAttribute('aria-valuenow', String(Math.round(p * 100)))
  summary.textContent = summaryText(glasses, goalMl)
  const reached = goalReached(glasses, goalMl)
  bar.classList.toggle('is-reached', reached)
  goalBadge.hidden = !reached
}

mount()
