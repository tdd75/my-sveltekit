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
	import { authService, type RegisterRequest } from '#lib/services/auth.js';
	import { authStore } from '#lib/stores/auth.svelte.js';
	import * as m from '#lib/paraglide/messages.js';

	let email = '';
	let password = '';
	let confirmPassword = '';
	let firstName = '';
	let lastName = '';
	let phone = '';
	let loading = false;
	let error = '';

	async function handleSubmit() {
		error = '';

		// Validate passwords match
		if (password !== confirmPassword) {
			error = m['register.error_password_mismatch']({});
			return;
		}

		loading = true;

		try {
			const data: RegisterRequest = {
				email,
				password,
				first_name: firstName || undefined,
				last_name: lastName || undefined,
				phone: phone || undefined
			};
			await authService.register(data);
			// Tokens are now in httpOnly cookies
			authStore.setAuthenticated(true);
			await goto('/', { invalidateAll: true });
		} catch (err) {
			error = err instanceof Error ? err.message : 'Registration failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex flex-1 items-center justify-center px-4 py-12">
	<Card class="w-full max-w-md">
		<CardHeader class="space-y-1">
			<CardTitle class="text-2xl font-bold">{m['register.title']({})}</CardTitle>
			<CardDescription>{m['register.description']({})}</CardDescription>
		</CardHeader>
		<form on:submit|preventDefault={handleSubmit}>
			<CardContent class="space-y-4 px-6 pb-4">
				{#if error}
					<div class="rounded-lg bg-red-50 p-4 text-sm text-red-800">
						{error}
					</div>
				{/if}
				<div class="space-y-2">
					<Label for="email">{m['register.email_label']({})}</Label>
					<Input
						id="email"
						type="email"
						placeholder={m['register.email_placeholder']({})}
						bind:value={email}
						required
						disabled={loading}
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="firstName">{m['register.first_name_label']({})}</Label>
						<Input
							id="firstName"
							type="text"
							placeholder={m['register.first_name_placeholder']({})}
							bind:value={firstName}
							disabled={loading}
						/>
					</div>
					<div class="space-y-2">
						<Label for="lastName">{m['register.last_name_label']({})}</Label>
						<Input
							id="lastName"
							type="text"
							placeholder={m['register.last_name_placeholder']({})}
							bind:value={lastName}
							disabled={loading}
						/>
					</div>
				</div>
				<div class="space-y-2">
					<Label for="phone">{m['register.phone_label']({})}</Label>
					<Input
						id="phone"
						type="tel"
						placeholder={m['register.phone_placeholder']({})}
						bind:value={phone}
						disabled={loading}
					/>
				</div>
				<div class="space-y-2">
					<Label for="password">{m['register.password_label']({})}</Label>
					<PasswordInput
						id="password"
						placeholder={m['register.password_placeholder']({})}
						bind:value={password}
						required
						disabled={loading}
					/>
					<p class="text-xs text-muted-foreground">{m['register.password_hint']({})}</p>
				</div>
				<div class="space-y-2">
					<Label for="confirmPassword">{m['register.confirm_password_label']({})}</Label>
					<PasswordInput
						id="confirmPassword"
						placeholder={m['register.confirm_password_placeholder']({})}
						bind:value={confirmPassword}
						required
						disabled={loading}
					/>
				</div>
			</CardContent>
			<CardFooter class="flex flex-col space-y-4 px-6 pb-6">
				<Button type="submit" class="w-full" disabled={loading}>
					{loading ? m['register.button_loading']({}) : m['register.button_register']({})}
				</Button>
				<p class="text-center text-sm text-muted-foreground">
					{m['register.have_account']({})}
					<a
						data-sveltekit-reload
						href="/auth/login"
						class="font-medium text-primary hover:underline">{m['register.login_link']({})}</a
					>
				</p>
			</CardFooter>
		</form>
	</Card>
</div>
