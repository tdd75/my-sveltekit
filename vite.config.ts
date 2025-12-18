import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter(),
			preprocess: [vitePreprocess(), mdsvex()],
			extensions: ['.svelte', '.svx']
		}),
		devtoolsJson(),
		paraglideVitePlugin({ project: './project.inlang', outdir: './src/lib/paraglide' })
	],

	server: {
		allowedHosts: true
	},

	test: {
		fileParallelism: true,
		maxWorkers: 4,
		expect: { requireAssertions: true },

		projects: [
			{
				extends: './vite.config.ts',

				test: {
					name: 'client',

					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},

					include: ['tests/unit/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['tests/unit/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',

				test: {
					name: 'server',
					sequence: { concurrent: true },
					environment: 'node',
					include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
					exclude: ['tests/unit/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
