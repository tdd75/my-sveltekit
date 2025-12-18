import { randomUUID } from 'node:crypto';
import { expect, type Page, type PlaywrightWorkerArgs } from '@playwright/test';

import { apiURL, frontendURL } from './config';

export { apiURL };

export function newUser() {
	return {
		email: `e2e-${randomUUID()}@example.com`,
		password: 'E2e-password123@',
		first_name: 'John',
		last_name: 'Doe'
	};
}

export async function createUser(playwright: PlaywrightWorkerArgs['playwright']) {
	const user = newUser();
	const api = await playwright.request.newContext({ baseURL: apiURL });
	try {
		const response = await api.post('/api/v1/auth/register/', { data: user });
		await expect(response).toBeOK();
	} finally {
		await api.dispose();
	}
	return user;
}

export async function login(page: Page, user: { email: string; password: string }) {
	await page.goto('/auth/login');
	await page.getByLabel('Email').fill(user.email);
	await page.getByLabel('Password', { exact: true }).fill(user.password);
	const response = page.waitForResponse(
		(r) => r.url() === `${apiURL}/api/v1/auth/login/` && r.request().method() === 'POST'
	);
	await page.getByRole('button', { name: 'Login', exact: true }).click();
	expect((await response).ok()).toBe(true);
	await expect(page).toHaveURL(`${frontendURL}/`);
}

export async function logout(page: Page) {
	await page.getByRole('button', { name: 'JD', exact: true }).click();
	const response = page.waitForResponse((r) => r.url() === `${apiURL}/api/v1/auth/logout/`);
	await page.getByRole('menuitem', { name: 'Logout' }).click();
	expect((await response).status()).toBe(204);
	await expect(page).toHaveURL(/\/auth\/login$/);
}
