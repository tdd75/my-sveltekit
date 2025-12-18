# Repository Guidelines

## Project Structure & Module Organization

`my-sveltekit` is a SvelteKit 3 / Svelte 5 application using TypeScript, Tailwind CSS, Paraglide i18n, Vitest, and Playwright. Application code lives in `src/`, unit/component tests live in `tests/unit/`, e2e tests live in `tests/e2e/`, static assets live in `static/`, and localization source messages live in `messages/`.

Key runtime areas:

- `src/routes/`: SvelteKit routes and layouts. Auth pages live under `src/routes/auth/`; protected user pages live under `src/routes/user/`.
- `src/lib/components/`: reusable UI and app components. `src/lib/components/ui/` contains shadcn-style primitives; `src/lib/components/app/` contains app-specific components such as navigation and password input.
- `src/lib/services/`: API-facing service modules such as `auth.ts` and `api-client.ts`.
- `src/lib/stores/`: Svelte 5 rune-based client stores for auth and theme state.
- `src/lib/hooks/`: reusable client hooks, including TanStack Query hooks.
- `src/lib/paraglide/`: generated Paraglide output. Do not hand-edit generated files.
- `.github/workflows/ci.yml`: CI flow for check, lint, unit/component tests, and build. E2E is currently run manually from the local machine.

## Build, Test, and Development Commands

Use `pnpm` for all Node commands. Avoid `npm run` inside scripts because this repo is pnpm-based and npm can emit unsupported config warnings.

- `pnpm dev`: run the Vite dev server on port `3000`.
- `pnpm build`: build the SvelteKit app.
- `pnpm preview`: preview the production build on port `3000`.
- `pnpm check`: run `svelte-kit sync` and `svelte-check`.
- `pnpm lint`: run Prettier check and ESLint.
- `pnpm format`: format the repo with Prettier.
- `pnpm test:unit`: run Vitest once.
- `pnpm test:unit:watch`: run Vitest in watch mode.
- `pnpm test:e2e`: run the full Playwright e2e suite.
- `pnpm test:e2e:smoke`: run Playwright tests tagged with `@smoke`.
- `pnpm test`: run unit tests first, then full e2e tests if unit tests pass.

When Playwright browsers are missing locally or in CI, install Chromium with `pnpm exec playwright install chromium`; CI uses `pnpm exec playwright install --with-deps chromium`.

## Coding Style & Naming Conventions

Use TypeScript and Svelte 5 conventions consistently. Components use `.svelte`; rune-based client modules use `.svelte.ts` where they rely on Svelte runes. Keep route files named with SvelteKit conventions such as `+page.svelte`, `+layout.svelte`, `+layout.server.ts`, and `+layout.ts`.

Use lowercase kebab-case for component folders and filenames where the repo already does so, for example `password-input/password-input.svelte`. Keep UI primitive exports in local `index.ts` files. Prefer existing UI primitives in `src/lib/components/ui/` before adding new component patterns.

Keep API calls inside `src/lib/services/`. Use `authService.authenticatedFetch` or `apiClient` for authenticated backend requests so cookies, locale headers, and token refresh behavior remain consistent. Use `withApiHeaders` when adding service calls that need `Accept-Language`.

For state, prefer the existing Svelte 5 rune store pattern used in `auth.svelte.ts` and `theme.svelte.ts`. For server/cache data, prefer TanStack Query hooks in `src/lib/hooks/` instead of ad hoc duplicate fetch state.

## Svelte, Styling, and UI Conventions

Use Svelte 5 syntax and existing project patterns. The root layout disables SSR with `export const ssr = false`, seeds auth state from layout data, wraps the app in `QueryClientProvider`, and renders the shared `Navigation`.

Use Tailwind CSS utilities and the existing shadcn-style component primitives. Keep page UI practical and app-like: forms should use `Label`, `Input`, `PasswordInput`, `Button`, and card primitives already present in the repo. Avoid introducing a second UI library or duplicate primitives unless there is a clear reason.

Interactive controls should be accessible by role or label. New form fields should have labels connected to inputs with `for`/`id` so Playwright and assistive technology can find them reliably. Keep disabled states, loading states, and API error states visible in the UI.

## Internationalization

Source translations live in `messages/en.json` and `messages/vi.json`. Generated Paraglide files live in `src/lib/paraglide/` and should not be edited manually.

When adding user-visible text, add translation keys to both language files and use imports from `#lib/paraglide/messages.js`. If generated Paraglide output is stale, run:

```sh
pnpm exec paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide
```

Navigation uses `locales`, `getLocale`, `setLocale`, and `localizeHref` from `#lib/paraglide/runtime`.

## Testing Guidelines

Vitest is configured in `vite.config.ts` with separate client and server projects:

- Svelte component tests use browser mode and files matching `tests/unit/**/*.svelte.{test,spec}.{js,ts}`.
- Server/unit tests use Node and files matching `tests/unit/**/*.{test,spec}.{js,ts}`, excluding Svelte component specs.

Unit and component tests live under `tests/unit/`, mirroring the source layout, for example `tests/unit/lib/services/auth.spec.ts` and `tests/unit/lib/utils.spec.ts`. Keep test files out of `src/`. Keep `expect.requireAssertions` in mind: each test must make assertions.

Playwright e2e tests live in `tests/e2e/` and are currently run manually from the local machine. Use `@smoke` in the test title for quick checks of critical flows. Current smoke coverage includes guest navigation, login error handling, and protected redirect behavior. Full e2e can include slower or more detailed flows such as profile updates, password validation, and forgot/reset password states.

E2E tests call running frontend and backend services. Do not mock API responses with `page.route()` or inject fake auth cookies. Use unique accounts and authenticate through the real API or UI. Start or deploy both services separately; Playwright must not build, start, or stop them and must not depend on a backend repository, Rust, Docker, or database setup. Configure both `E2E_FE_URL` and `E2E_BE_URL` through shell variables or `.env.test`/`.env`; there are no fallback URLs. Missing or blank values skip E2E with a log message and successful exit. When both are provided, both endpoints are checked before the suite runs and unavailable services fail the suite. The running frontend's `VITE_API_URL` must already target the selected backend. Local cookie authentication requires matching FE/BE hostnames; deployed environments must have compatible CORS and cookie settings. Test-created users remain in the supplied backend; use a dedicated test environment managed outside this repo. Email delivery and OTP reset completion are not covered by the default suite.

Tests run in parallel by default: Playwright uses `fullyParallel: true` with four workers; Vitest parallelizes files with four workers and runs Node tests concurrently within each file. Keep test users and browser contexts isolated. For E2E groups/files requiring ordered dependent tests, use `test.describe.configure({ mode: 'serial' })`; subsequent tests skip after a failure. Use `mode: 'default'` for sequential independent tests. These modes serialize only their own group/file, not the entire suite. Use `--workers=1` for global E2E serialization. For unit suites sharing mutable globals or service mocks, use `describe(name, { concurrent: false }, ...)` or `test(name, { concurrent: false }, ...)`. Browser component tests remain sequential within a file to avoid shared DOM conflicts.

## CI Expectations

CI runs on Node 24 with pnpm 12.8.1. It installs dependencies and Chromium, compiles Paraglide, then runs:

- `pnpm check`
- `pnpm lint`
- `pnpm test:unit`
- `pnpm build`

Before opening a PR, run the commands relevant to the change. For UI, form, auth, route, or localization changes, run at least `pnpm check`, `pnpm lint`, `pnpm test:unit`, and the related Playwright test or smoke suite.

## Svelte MCP Guidance

When working on Svelte or SvelteKit-specific behavior, use the Svelte MCP documentation workflow if available:

1. Call `list-sections` first to discover relevant docs.
2. Call `get-documentation` for the sections that match the task.
3. Use `svelte-autofixer` when writing Svelte code and address issues until clean.
4. Only generate a playground link when the user asks for one; do not use it for code already written into this repo.

## Security & Configuration Tips

Backend API base URL comes from `VITE_API_URL` and falls back to `http://localhost:8000`. Auth uses httpOnly cookies set by the backend, so frontend code should not store access or refresh tokens in localStorage. Keep credentials and environment-specific values out of commits.

For authenticated routes, server-side layout checks use cookies while client services handle refresh/retry behavior. Preserve that split when changing auth flows.
