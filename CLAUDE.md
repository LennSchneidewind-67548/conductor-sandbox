# conductor-sandbox

A throwaway water-tracker web app for testing the conductor plugin end to end. Vanilla TypeScript + Vite, tests with Vitest.

## Pipeline
Used by the conductor plugin (`/conductor:feature`).
- **Verify** (must pass before a PR): `npm test && npm run build`
- **Review build** (for the user's look): `npm run build && npm run preview` (run in the background) → open the URL it prints
- **Review after:** each phase
- **Plans:** `design/<feature>/PLAN.md`, phases `P<n>.md`
- **Commits:** `<Feature> P<n> step N: …`; plans `<Feature> P<n> plan`
- **Part rules:** no new dependencies
- **Visual decisions:** layout, colors, copy → ask; everything else → rule
