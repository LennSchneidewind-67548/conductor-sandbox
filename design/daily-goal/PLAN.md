# Daily goal: plan

**Status:** done. P1 (the only phase) merged in PR #4 on 2026-10-04 and the user approved the review build. This file now describes what was built; see Deviations and Known minor items at the end.

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

Locked (user visual picks, 2026-10-04; mockups: https://claude.ai/artifact/Q5L13xfYr5ZpHvSwbSHqzE):
- **Bar (pick 1 → option 2):** a thick rounded bar (about 34px) with the "X / Y ml (N%)" text drawn inside it, left-aligned, replacing the separate text line visually. The text must stay readable over both the track and the fill, and stay available to screen readers.
- **Stepper (pick 2 → option 3):** its own row at the top, under the heading, before the bar: `Goal  [−]  2000 ml  [+]`.
- **Goal reached (pick 3 → option 3):** the fill turns green and a small "✓ Goal reached" pill badge appears under the bar. No other message.
- **Percentage (pick 4 → option 2):** the "N%" shows the real, uncapped percentage (e.g. "2500 / 2000 ml (125%)"). The bar width stays capped at 100%.
- Page order: heading, goal stepper row, bar (with text inside), badge (only when reached), "+ glass" button.

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
Also added (P1):
```ts
/** Real, uncapped percentage of the goal, rounded to a whole number (e.g. 125). */
export function percentOfGoal(glasses: number, goalMl: number): number

/** The text inside the bar: "1500 / 2000 ml (75%)". */
export function summaryText(glasses: number, goalMl: number): string
```
`stepGoal` returns `goalMl` unchanged at a bound. `main.ts` uses `goalMl <= GOAL_MIN_ML` and `goalMl >= GOAL_MAX_ML` to mark the − and + buttons `aria-disabled="true"`.

Tests in `src/water.test.ts`: stepping up and down by 250, clamping at 500 and at 5000, `goalReached` just below, exactly at, and above the goal, `progress` staying at 1 for a custom goal, `percentOfGoal` (uncapped and rounded), `summaryText`, and the goal constants.

### `src/main.ts`: state and DOM

- State: `let glasses = 0` (as now) and `let goalMl = GOAL_DEFAULT_ML`, which replaces the `GOAL_ML` constant. Neither is stored anywhere.
- The old `render()` replaced `app.innerHTML` on every click, so the clicked button was destroyed and keyboard focus was lost. It is now split in two. `mount()` writes the markup once, looks up the elements once and attaches the listeners. `update()` changes no markup: it sets the text, the stepper value, the `aria-disabled` state of each stepper button, the bar fill and the reached state. Every click handler changes state and then calls `update()`.
- Markup that `mount()` creates, in page order (ids are for `update()` and the browser checks):
  - `<h1>Water</h1>`.
  - The goal stepper row (`.goal-row`): the label "Goal", `#goal-dec` (−, U+2212), `#goal-value` ("2000 ml") and `#goal-inc` (+). The buttons have `aria-label`s "Decrease goal" and "Increase goal". `#goal-value` has `aria-live="polite"`.
  - `.bar-wrap`, which holds two siblings:
    - `#bar`: a `div` with `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` (capped, 0–100) and `aria-label="Daily goal progress"`. Inside it, `#bar-fill` gets its width from `progress(glasses, goalMl) * 100`%. When the goal is reached, `update()` adds the `is-reached` class.
    - `#summary` (`.bar-text`): the "X / Y ml (N%)" line from `summaryText()`, laid over the bar with CSS. It is not a child of `#bar`, because ARIA treats progressbar children as presentational.
  - `#goal-status` (`role="status"`, always present) holding `#goal-reached`, the "✓ Goal reached" pill. The pill is hidden with the `hidden` attribute until `goalReached()` is true.
  - `#add`: the existing "+ glass" button.

### `index.html`: styles

One `<style>` block in `<head>` (there was no stylesheet before). Exact values are in `P1.md` → Step 3.
- Page shell: `#app` is a centered grid column, `max-width: 360px`, `gap: 12px`, with 24px/16px body padding and a system font. This matches the mockup's phone card without the card border (user decision at review).
- Stepper row: one flex line, 30×30px buttons, a fixed-width tabular value so the buttons don't shift. `aria-disabled="true"` buttons are drawn at 40% opacity.
- Bar: a light blue-grey track (`#dde8f1`) 34px tall with 10px corners, a blue fill (`#2b7fd4`) and a green fill (`#2f9e5b`) when reached. The text inside is `#0a1116`, left-aligned, 0.85rem semibold.
- Badge: a green pill (`#e3f4ea` background, `#1f7a43` text).
- The fill animates `width` and `background-color` over 200ms ease-out. Both are turned off under `prefers-reduced-motion: reduce`.
- Light colors only; the app has no dark mode.

### Rulings made in this plan

- Logic goes in `water.ts` and only wiring goes in `main.ts`. Vitest runs in its default Node environment with no DOM library, and adding jsdom would add a dependency. So only the pure functions get unit tests, and the DOM is checked in the browser.
- The bar is a styled `div` with `role="progressbar"`, not a native `<progress>`. A native `<progress>` needs vendor pseudo-elements to style the same way in every browser.
- The "N%" in the text uses the real, uncapped ratio (user pick 4). `progress()` stays capped and drives the bar width; `percentOfGoal()` gives the uncapped number for the text, with unit tests.

## Phases

| Phase | Goal | Depends on | Device check |
|---|---|---|---|
| P1 | Goal stepper (500–5000, steps of 250, default 2000), progress bar with goal-reached state, existing text line kept. Everything updates live. The user can try it all in the review build. | none | No (desktop browser check of the review build; a narrow-window check covers phone width) |

P1 is small: about 150 changed lines across `water.ts`, `water.test.ts`, `main.ts` and `index.html`. It will most likely be one part.

## Open visual decisions

All resolved on 2026-10-04; see Decisions. The page shell that P1 left as "Default, pending decision" (a 360px centered column matching the mockup) was confirmed by the user at review.

## Deviations

The build matches `P1.md` with no deviations. `P1.md` was more specific than the original Architecture section above, and the Architecture text has been updated to match the build. These are the places where the build differs from what this file first said:
- Stepper bounds use `aria-disabled="true"`, not the `disabled` attribute. A `disabled` button drops keyboard focus at the bound, and `stepGoal` already clamps, so clicks there do nothing.
- `#summary` is an overlaid sibling of `#bar`, not a separate line under it, and it isn't a child of the progressbar, so screen readers still read it.
- `#goal-reached` sits inside an always-present `#goal-status` live region (`role="status"`), so reaching the goal is announced.
- Colors come from the mockup the user picked from: fill `#2b7fd4` (not `#2b7de9`), reached `#2f9e5b` (not `#2e9d5b`), track `#dde8f1`. The bar text (`#0a1116`) and badge text (`#1f7a43`) are darker than in the mockup so they reach WCAG AA contrast.
- `percentOfGoal()` and `summaryText()` were added to `water.ts` so the uncapped percentage is unit-tested.

## Known minor items

Accepted by the user at review. Not fixed.
- **Double gap under the bar when the badge is hidden.** The empty `#goal-status` row has height 0 and `margin-top: -12px`, but a negative margin can't shrink a grid track below 0. Both 12px grid gaps around that row stay, so "+ glass" sits about 24px under the bar instead of 12px. With the badge showing, the spacing is 12px as intended. A possible fix later: take the status row out of the grid flow (e.g. put it inside `.bar-wrap`) rather than hiding it, because `display: none`/`contents` can drop the live region from the accessibility tree.
