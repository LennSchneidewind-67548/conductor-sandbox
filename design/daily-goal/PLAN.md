# Daily goal: plan

## Context

The water tracker has a fixed goal: `GOAL_ML = 2000` in `src/main.ts`. Progress shows only as the text line "X / Y ml (N%)". The user asked: "let me set my own daily goal and show a progress bar".

This feature lets the user change the goal for the current session with a −/+ stepper. It also adds a progress bar that fills toward the goal and shows a "goal reached" state once the total meets it. The existing text line stays. Nothing is stored, so the goal goes back to the default on every page load.

## Decisions

Locked (user):
- The goal is set with a −/+ stepper.
- No persistence. The goal resets to the default on each page load.
- Over the goal, the bar stays full (capped at 100%) and shows a "goal reached" state. The text still shows the real total in ml.
- The existing "X / Y ml (N%)" text line stays alongside the bar.

Locked (coordinator):
- Stepper step is 250 ml (one glass, `GLASS_ML`). The range is 500–5000 ml and the default is 2000 ml.
- The bar and text update as soon as the goal or the glass count changes.
- No new dependencies.

## Architecture

The app is three files: `index.html` (shell), `src/main.ts` (DOM and state) and `src/water.ts` (pure logic, tested in `src/water.test.ts`). The feature keeps that split. New rules go into `water.ts` as pure functions, and `main.ts` only wires them to the DOM.

### `src/water.ts`: goal logic (pure, tested)

Reuse `GLASS_ML`, `total()` and `progress()` as they are. `progress()` already caps at 1, which is what the bar needs.

Add:
```ts
export const GOAL_DEFAULT_ML = 2000
export const GOAL_MIN_ML = 500
export const GOAL_MAX_ML = 5000
export const GOAL_STEP_ML = GLASS_ML // 250

/** Goal after one stepper press, clamped to [GOAL_MIN_ML, GOAL_MAX_ML]. */
export function stepGoal(goalMl: number, direction: 1 | -1): number

/** True once the day's total meets or passes the goal. */
export function goalReached(glasses: number, goalMl: number): boolean
```
`stepGoal` returns `goalMl` unchanged at a bound. `main.ts` uses `goalMl <= GOAL_MIN_ML` and `goalMl >= GOAL_MAX_ML` to disable the − and + buttons.

Tests go in `src/water.test.ts`: stepping up and down by 250, clamping at 500 and at 5000, `goalReached` just below, exactly at, and above the goal, and `progress` staying at 1 for a custom goal.

### `src/main.ts`: state and DOM

- State: `let glasses = 0` (as now) and `let goalMl = GOAL_DEFAULT_ML`, which replaces the `GOAL_ML` constant. Neither is stored anywhere.
- Today `render()` replaces `app.innerHTML` on every click, so the clicked button is destroyed and keyboard focus is lost. This change splits it in two. `mount()` writes the markup once and attaches the listeners. `update()` sets the text, the stepper value, the disabled state of each stepper button, the bar fill and the reached state. Every click handler changes state and then calls `update()`.
- Markup that `mount()` creates (ids are for `update()` and the browser checks):
  - `#summary`: the existing "X / Y ml (N%)" line.
  - `#bar`: a `div` with `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` and `aria-label="Daily goal progress"`. Inside it, `#bar-fill` gets its width from `progress(glasses, goalMl) * 100`%.
  - `#goal-reached`: the "goal reached" message. It is hidden with the `hidden` attribute until `goalReached()` is true. When reached, `update()` also adds the `is-reached` class to `#bar`.
  - `#add`: the existing "+ glass" button.
  - The goal stepper: `#goal-dec` (−), `#goal-value` ("2000 ml") and `#goal-inc` (+). The buttons have `aria-label`s "Decrease goal" and "Increase goal". `#goal-value` has `aria-live="polite"`.
- **Default, pending decision:** order on the page is heading, summary text, bar, goal-reached message, "+ glass" button, then a "Goal" stepper row. See open visual decisions 1–3.

### `index.html`: styles

There is no stylesheet today. Add one `<style>` block in `<head>` for the bar track, the fill, the reached state and the stepper row. The fill gets `transition: width 200ms ease-out`, which is turned off under `prefers-reduced-motion: reduce`.
- **Default, pending decision:** a light grey rounded track 12px tall at full content width, a blue fill (`#2b7de9`), and a green fill (`#2e9d5b`) when reached.

### Rulings made in this plan

- Logic goes in `water.ts` and only wiring goes in `main.ts`. Vitest runs in its default Node environment with no DOM library, and adding jsdom would add a dependency. So only the pure functions get unit tests, and the DOM is checked in the browser.
- The bar is a styled `div` with `role="progressbar"`, not a native `<progress>`. A native `<progress>` needs vendor pseudo-elements to style the same way in every browser.
- At 100% or more, the "N%" in the text line stays capped at 100%, as `progress()` does today. The "X ml" part already shows the real total. **Default, pending decision:** see open visual decision 4.

## Phases

| Phase | Goal | Depends on | Device check |
|---|---|---|---|
| P1 | Goal stepper (500–5000, steps of 250, default 2000), progress bar with goal-reached state, existing text line kept. Everything updates live. The user can try it all in the review build. | none | No (desktop browser check of the review build; a narrow-window check covers phone width) |

P1 is small: about 150 changed lines across `water.ts`, `water.test.ts`, `main.ts` and `index.html`. It will most likely be one part.

## Open visual decisions

The user picks these; the plan uses the first option of each until then.

1. **Bar look and placement**
   1. A thin rounded bar (12px), full width, directly under the "X / Y ml (N%)" line, blue fill. *(default)*
   2. A thick bar (about 28px) with the "X / Y ml (N%)" text drawn inside it.
   3. The bar above the text line, right under the heading.
2. **Stepper placement and look**
   1. Its own row under the "+ glass" button: `Goal  [−]  2000 ml  [+]`. *(default)*
   2. Next to the goal number in the text line, so the "Y ml" itself sits between − and +.
   3. At the top, under the heading, before the progress.
3. **"Goal reached" copy and styling**
   1. The bar fill turns green and the line "Goal reached!" appears under the bar. *(default)*
   2. Only the bar color changes, with no extra text.
   3. A small "✓ Goal reached" badge after the text line, and the bar turns green.
4. **Percentage above 100%**
   1. Keep it capped at 100%, as today ("2500 / 2000 ml (100%)"). *(default)*
   2. Show the real percentage ("2500 / 2000 ml (125%)") while the bar stays full.
