import { loadEnv } from 'vite';

const env = loadEnv('test', process.cwd(), 'E2E_');
export const frontendURL = (process.env.E2E_FE_URL ?? env.E2E_FE_URL ?? '')
	.trim()
	.replace(/\/+$/, '');
export const apiURL = (process.env.E2E_BE_URL ?? env.E2E_BE_URL ?? '').trim().replace(/\/+$/, '');
export const e2eEnabled = Boolean(frontendURL && apiURL);
