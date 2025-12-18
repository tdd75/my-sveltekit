import { expect, test } from '@playwright/test';
import { apiURL, createUser, login } from './helpers';

test('protected pages redirect guests to login @smoke', async ({ page }) => {
	await page.goto('/user/profile');
	await expect(page).toHaveURL(/\/auth\/login$/);
});

test('authenticated user can update profile information persisted by the backend', async ({
	page,
	playwright
}) => {
	const user = await createUser(playwright);
	await login(page, user);
	await page.goto('/user/profile');
	await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
	await expect(page.locator('input').first()).toHaveValue(user.email);
	await page.getByLabel('First Name').fill('Jane');
	const response = page.waitForResponse(
		(r) => r.url() === `${apiURL}/api/v1/user/profile/` && r.request().method() === 'PATCH'
	);
	await page.getByRole('button', { name: 'Save', exact: true }).click();
	expect((await response).ok()).toBe(true);
	await expect(page.getByText('Profile updated successfully!')).toBeVisible();
	await page.reload();
	await expect(page.getByLabel('First Name')).toHaveValue('Jane');
});

test('change password keeps submit disabled until the form is valid', async ({
	page,
	playwright
}) => {
	const user = await createUser(playwright);
	await login(page, user);
	await page.goto('/user/change-password');
	const submit = page.getByRole('button', { name: 'Change Password', exact: true });
	await expect(submit).toBeDisabled();
	await page.getByLabel('Current Password').fill(user.password);
	await page.getByLabel('New Password', { exact: true }).fill('short');
	await page.getByLabel('Confirm New Password', { exact: true }).fill('short');
	await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
	await expect(submit).toBeDisabled();
	await page.getByLabel('New Password', { exact: true }).fill('new-password');
	await page.getByLabel('Confirm New Password', { exact: true }).fill('different-password');
	await expect(page.getByText('Passwords do not match')).toBeVisible();
	await expect(submit).toBeDisabled();
});

test('changed password works for a new login', async ({ page, playwright }) => {
	const user = await createUser(playwright);
	await login(page, user);
	await page.goto('/user/change-password');
	const password = 'Changed-password123@';
	await page.getByLabel('Current Password').fill(user.password);
	await page.getByLabel('New Password', { exact: true }).fill(password);
	await page.getByLabel('Confirm New Password', { exact: true }).fill(password);
	const response = page.waitForResponse(
		(r) => r.url() === `${apiURL}/api/v1/auth/change-password/`
	);
	await page.getByRole('button', { name: 'Change Password', exact: true }).click();
	expect((await response).status()).toBe(204);
	await expect(page.getByText('Password changed successfully!')).toBeVisible();
	await page.context().clearCookies();
	await login(page, { ...user, password });
	await page.goto('/user/profile');
	await expect(page.locator('input').first()).toHaveValue(user.email);
});
