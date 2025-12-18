<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { PasswordInput } from '#lib/components/app/password-input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '#lib/components/ui/card/index.js';
	import { authService, type LoginRequest } from '#lib/services/auth.js';
	import { authStore } from '#lib/stores/auth.svelte.js';
	import * as m from '#lib/paraglide/messages.js';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	async function handleSubmit() {
		error = '';
		loading = true;

		try {
			const data: LoginRequest = { email, password };
			await authService.login(data);
			// Tokens are now in httpOnly cookies
			authStore.setAuthenticated(true);
			await goto('/', { invalidateAll: true });
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex flex-1 items-center justify-center px-4 py-12">
	<Card class="w-full max-w-md">
		<CardHeader class="space-y-1">
			<CardTitle class="text-2xl font-bold">{m['login.title']({})}</CardTitle>
			<CardDescription>{m['login.description']({})}</CardDescription>
		</CardHeader>
		<form on:submit|preventDefault={handleSubmit}>
			<CardContent class="space-y-4 px-6 pb-4">
				{#if error}
					<div class="rounded-lg bg-red-50 p-4 text-sm text-red-800">
						{error}
					</div>
				{/if}
				<div class="space-y-2">
					<Label for="email">{m['login.email_label']({})}</Label>
					<Input id="email" type="email" bind:value={email} required disabled={loading} />
				</div>
				<div class="space-y-2">
					<Label for="password">{m['login.password_label']({})}</Label>
					<PasswordInput id="password" bind:value={password} required disabled={loading} />
				</div>
				<div class="flex justify-end">
					<a
						data-sveltekit-reload
						href="/auth/forgot-password"
						class="text-sm text-primary hover:underline"
					>
						{m['login.forgot_password']({})}
					</a>
				</div>
			</CardContent>
			<CardFooter class="flex flex-col space-y-4 px-6 pb-6">
				<Button type="submit" class="w-full" disabled={loading}>
					{loading ? m['login.button_loading']({}) : m['login.button_login']({})}
				</Button>
				<p class="text-center text-sm text-muted-foreground">
					{m['login.no_account']({})}
					<a
						data-sveltekit-reload
						href="/auth/register"
						class="font-medium text-primary hover:underline">{m['login.register_link']({})}</a
					>
				</p>
			</CardFooter>
		</form>
	</Card>
</div>
