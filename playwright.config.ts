import { defineConfig } from '@playwright/test';
import { e2eEnabled, frontendURL } from './tests/e2e/config';

if (!e2eEnabled) {
	console.log('Skipping E2E: configure both E2E_FE_URL and E2E_BE_URL to run these tests.');
}

export default defineConfig({
	fullyParallel: true,
	workers: 4,
	use: {
		baseURL: frontendURL || undefined,
		locale: 'en-US',
		trace: 'retain-on-failure'
	},
	globalSetup: e2eEnabled ? './tests/e2e/global-setup.ts' : undefined,
	testIgnore: e2eEnabled ? [] : ['**/*'],
	testDir: 'tests/e2e'
});
