# Daily goal retro

- **Shipped:** 1 phase, 1 part. PLAN #1, visual picks #2, P1 plan #3, P1 part 1 #4 (goal stepper, thick progress bar with text, "✓ Goal reached" badge, uncapped %), sign-off docs #5.
- **Stops:** interview 1 round (4 questions: stepper, no persistence, full bar + reached state, keep text) · picks 1 (4 visual decisions; the user chose a non-default option in all 4) · decisions 1 (page shell: match the mockup) · reviews 1 ("ok" on the first build).
- **Rulings that held / that were wrong:** all held. Coordinator: 250 ml step, 500–5000 range, 2000 default. Planner: pure logic in water.ts with no jsdom, aria-disabled bounds, summary as a sibling over the bar, mockup colors darkened for AA contrast. One plan ruling was wrong: the −12px margin on the empty `#goal-status` grid item leaves about 24px instead of 12px between the bar and "+ glass" (recorded in PLAN.md Known minor items; the user accepted it).
- **Where it stalled:** nowhere. There were no blocked workers and no fix rounds. The implementer couldn't run the browser checks, so they all waited for the user's review.
- **Usage:** not measured.
- **Improve conductor:**
  - The picks page should show the page shell (font, column width) as well. The "no styles today" question came up a stop later, at the phase plan; the mockup implied the answer, so it could have been a pick or a ruling.
  - Add a short "how picks change the architecture" step in the planner prompt. All 4 picks differed from the defaults, and the coordinator had to patch PLAN.md Architecture by hand.
  - The reviewer can only read CSS layout statically. For web projects, let the reviewer (or the implementer) take one headless screenshot of the review build so layout bugs like the doubled gap show up before the user looks.
  - The implementer reports DONE_WITH_CONCERNS whenever browser checks weren't run, which is always the case for web projects. Treat "browser checks deferred to review" as the normal case rather than a concern.
