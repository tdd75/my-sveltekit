import { expect, test } from '@playwright/test';
import { apiURL, createUser, login, logout, newUser } from './helpers';
import { frontendURL } from './config';

test('login displays the real API error message @smoke', async ({ page, playwright }) => {
	const user = await createUser(playwright);
	await page.goto('/auth/login');
	await page.getByLabel('Email').fill(user.email);
	await page.getByLabel('Password').fill('wrong-password');
	const response = page.waitForResponse((r) => r.url() === `${apiURL}/api/v1/auth/login/`);
	await page.getByRole('button', { name: 'Login', exact: true }).click();
	expect((await response).status()).toBe(401);
	await expect(page.getByText('Password is incorrect', { exact: true })).toBeVisible();
});

test('user can register through the UI and access their saved profile', async ({ page }) => {
	const user = newUser();
	await page.goto('/auth/register');
	await page.getByLabel('Email *').fill(user.email);
	await page.getByLabel('First Name').fill(user.first_name);
	await page.getByLabel('Last Name').fill(user.last_name);
	await page.getByLabel('Password *', { exact: true }).fill(user.password);
	await page.getByLabel('Confirm Password *', { exact: true }).fill(user.password);
	const response = page.waitForResponse((r) => r.url() === `${apiURL}/api/v1/auth/register/`);
	await page.getByRole('button', { name: 'Register', exact: true }).click();
	expect((await response).ok()).toBe(true);
	await expect(page).toHaveURL(`${frontendURL}/`);
	await page.goto('/user/profile');
	await expect(page.locator('input').first()).toHaveValue(user.email);
	await expect(page.getByLabel('First Name')).toHaveValue(user.first_name);
	const cookies = await page.context().cookies();
	expect(cookies.find((cookie) => cookie.name === 'access_token')?.httpOnly).toBe(true);
});

test('user can log in and log out with real session cookies @smoke', async ({
	page,
	playwright
}) => {
	const user = await createUser(playwright);
	await login(page, user);
	await page.goto('/user/profile');
	await expect(page.locator('input').first()).toHaveValue(user.email);
	await logout(page);
	const cookies = await page.context().cookies();
	expect(cookies.some((cookie) => ['access_token', 'refresh_token'].includes(cookie.name))).toBe(
		false
	);
	await page.goto('/user/profile');
	await expect(page).toHaveURL(/\/auth\/login$/);
});

test('register validates password confirmation before calling the API', async ({ page }) => {
	const requests: string[] = [];
	page.on('request', (request) => {
		if (request.url() === `${apiURL}/api/v1/auth/register/` && request.method() === 'POST') {
			requests.push(request.url());
		}
	});
	await page.goto('/auth/register');
	await page.getByLabel('Email *').fill(newUser().email);
	await page.getByLabel('Password *', { exact: true }).fill('password-1');
	await page.getByLabel('Confirm Password *', { exact: true }).fill('password-2');
	await page.getByRole('button', { name: 'Register', exact: true }).click();
	await expect(page.getByText('Passwords do not match')).toBeVisible();
	expect(requests).toHaveLength(0);
});

test('forgot password returns the privacy-preserving success state for an unknown email', async ({
	page
}) => {
	await page.goto('/auth/forgot-password');
	await page.getByLabel('Email').fill(newUser().email);
	const response = page.waitForResponse(
		(r) => r.url() === `${apiURL}/api/v1/auth/forgot-password/`
	);
	await page.getByRole('button', { name: 'Send Reset Code' }).click();
	expect((await response).status()).toBe(204);
	await expect(page.getByText('Email sent!')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Continue to Reset Password' })).toBeVisible();
});

test('reset password validates matching passwords before submit', async ({ page }) => {
	const requests: string[] = [];
	page.on('request', (request) => {
		if (request.url() === `${apiURL}/api/v1/auth/reset-password/` && request.method() === 'POST') {
			requests.push(request.url());
		}
	});
	await page.goto('/auth/reset-password');
	await page.getByLabel('Email').fill(newUser().email);
	await page.getByLabel('Verification Code').fill('123456');
	await page.getByLabel('New Password', { exact: true }).fill('new-password');
	await page.getByLabel('Confirm New Password', { exact: true }).fill('different-password');
	await page.getByRole('button', { name: 'Reset Password', exact: true }).click();
	await expect(page.getByText('Passwords do not match')).toBeVisible();
	expect(requests).toHaveLength(0);
});
