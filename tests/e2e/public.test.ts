import { expect, test } from '@playwright/test';

test('guest can navigate between home and auth pages @smoke', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { name: /welcome to myapp/i })).toBeVisible();
	await expect(page.getByRole('navigation').getByRole('link', { name: 'Login' })).toBeVisible();
	await expect(page.getByRole('navigation').getByRole('link', { name: 'Register' })).toBeVisible();

	await page.getByRole('link', { name: 'Get Started' }).click();
	await expect(page).toHaveURL(/\/auth\/register$/);
	await expect(page.getByText('Create a new account to get started')).toBeVisible();

	await page.getByRole('main').getByRole('link', { name: 'Login' }).click();
	await expect(page).toHaveURL(/\/auth\/login$/);
	await expect(page.getByText('Enter your email and password to login')).toBeVisible();

	await page.getByRole('link', { name: 'Forgot password?' }).click();
	await expect(page).toHaveURL(/\/auth\/forgot-password$/);
	await expect(
		page.getByText('Enter your email to receive a password reset verification code')
	).toBeVisible();
});

test('theme toggle persists dark mode preference', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('button', { name: 'Toggle theme' }).click();

	await expect(page.locator('html')).toHaveClass(/dark/);
	await expect(page.evaluate(() => localStorage.getItem('theme'))).resolves.toBe('dark');
});
