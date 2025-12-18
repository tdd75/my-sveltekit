# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

This app uses SvelteKit 3 and Svelte 5. SvelteKit configuration, including the Node adapter,
preprocessors, and supported file extensions, lives in the `sveltekit(...)` plugin in
`vite.config.ts`. Shared code uses `#lib` subpath imports, declared in `package.json`.

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Testing

Unit and component tests live in `tests/unit/`, mirroring the source layout.
Playwright E2E tests live in `tests/e2e/` and call the real backend; API responses are not mocked.
There is no separate integration test suite.

Start or deploy FE and BE separately before running E2E. Playwright only connects to
running services; it does not build, start, or stop either service. Install Chromium once
with `pnpm exec playwright install chromium`.

| Variable     | Local example           | Purpose                                          |
| ------------ | ----------------------- | ------------------------------------------------ |
| `E2E_FE_URL` | `http://localhost:3000` | Frontend to test                                 |
| `E2E_BE_URL` | `http://localhost:8000` | Backend for real requests and test account setup |

Set both variables in the shell, `.env.test`, or `.env`; shell values take priority. There
are no fallback URLs. If either value is missing or blank, E2E logs a skip message and exits
successfully without contacting services. When both are set, the suite checks both services
and fails if either is unavailable. URLs can point to local, dev, or test environments.

The running frontend must already be configured with `VITE_API_URL` pointing to the same
backend as `E2E_BE_URL`. E2E variables select test targets; they do not change a deployed
frontend's configuration. Backend CORS and authentication cookies must support the selected
frontend origin. For local cookie authentication, use the same hostname for FE and BE.

Tests register unique users and update their profiles/passwords in the supplied backend.
Use a test environment; this suite does not reset or remove its data.

CI runs type checks, lint, unit/component tests, and a build. E2E is currently run
manually from the local machine against the configured FE and BE URLs.

The suite covers real registration, login/logout, profile persistence, and password changes,
plus browser navigation and validation. The forgot-password case uses an unknown email to verify
the privacy-preserving response; email delivery and OTP reset completion are not covered because
they require Redis and SMTP.

```sh
pnpm test:unit
pnpm test:e2e
# Test a running dev/test environment
E2E_FE_URL=https://app.test.example.com E2E_BE_URL=https://api.test.example.com pnpm test:e2e
# Run only the browser smoke tests
pnpm test:e2e:smoke
```

`pnpm test` runs unit tests first, then E2E if unit tests pass.

### Parallel and sequential tests

Playwright runs independent E2E tests in parallel, including tests in the same file,
with up to four workers. Each test gets a separate browser context and creates its own
users. Override the limit with `pnpm test:e2e --workers=2`.

For a group that must run in order, configure that group locally:

```ts
import { test } from '@playwright/test';

test.describe('ordered workflow', () => {
	test.describe.configure({ mode: 'serial' });
	// Declare the dependent tests here in execution order.
});
```

Use `test.describe.configure({ mode: 'serial' })` at the top of a file to serialize
that file. A failed serial test skips subsequent tests in its group; use `mode: 'default'`
when tests should run sequentially but continue independently after a failure.
These modes only serialize their own group/file; other groups/files can still run in parallel.
To run the whole E2E suite sequentially, use `pnpm test:e2e --workers=1`.

Vitest runs test files in parallel with up to four workers. Node unit tests also run
concurrently within a file. Use `describe(name, { concurrent: false }, ...)` or `test(name, { concurrent: false }, ...)`
for cases that share mutable state; the auth service suite uses this because it replaces
`fetch` and mocks a shared service instance. Browser component tests remain sequential
within each file because they share DOM state, while separate files can run in parallel.
`pnpm test` still runs the unit suite before the E2E suite.
