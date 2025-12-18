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
	import { authService, type ResetPasswordRequest } from '#lib/services/auth.js';
	import * as m from '#lib/paraglide/messages.js';

	let email = '';
	let otp = '';
	let newPassword = '';
	let confirmPassword = '';
	let loading = false;
	let error = '';
	let success = false;

	async function handleSubmit() {
		error = '';

		// Validate passwords match
		if (newPassword !== confirmPassword) {
			error = m['reset_password.error_password_mismatch']({});
			return;
		}

		loading = true;

		try {
			const data: ResetPasswordRequest = {
				email,
				otp,
				new_password: newPassword
			};
			await authService.resetPassword(data);
			success = true;
			setTimeout(() => {
				goto('/auth/login', { invalidateAll: true });
			}, 2000);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to reset password';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-12">
	<Card class="w-full max-w-md">
		<CardHeader class="space-y-1">
			<CardTitle class="text-2xl font-bold">{m['reset_password.title']({})}</CardTitle>
			<CardDescription>{m['reset_password.description']({})}</CardDescription>
		</CardHeader>
		{#if success}
			<CardContent class="space-y-4 px-6 pb-4">
				<div class="rounded-lg bg-green-50 p-4 text-sm text-green-800">
					<p class="font-medium">{m['reset_password.success_title']({})}</p>
					<p class="mt-2">{m['reset_password.success_message']({})}</p>
				</div>
			</CardContent>
		{:else}
			<form on:submit|preventDefault={handleSubmit}>
				<CardContent class="space-y-4 px-6 pb-4">
					{#if error}
						<div class="rounded-lg bg-red-50 p-4 text-sm text-red-800">
							{error}
						</div>
					{/if}
					<div class="space-y-2">
						<Label for="email">{m['reset_password.email_label']({})}</Label>
						<Input
							id="email"
							type="email"
							placeholder={m['reset_password.email_placeholder']({})}
							bind:value={email}
							required
							disabled={loading}
						/>
					</div>
					<div class="space-y-2">
						<Label for="otp">{m['reset_password.otp_label']({})}</Label>
						<Input
							id="otp"
							type="text"
							placeholder={m['reset_password.otp_placeholder']({})}
							bind:value={otp}
							required
							disabled={loading}
						/>
						<p class="text-xs text-muted-foreground">{m['reset_password.otp_hint']({})}</p>
					</div>
					<div class="space-y-2">
						<Label for="newPassword">{m['reset_password.new_password_label']({})}</Label>
						<PasswordInput id="newPassword" bind:value={newPassword} required disabled={loading} />
					</div>
					<div class="space-y-2">
						<Label for="confirmPassword">{m['reset_password.confirm_password_label']({})}</Label>
						<PasswordInput
							id="confirmPassword"
							bind:value={confirmPassword}
							required
							disabled={loading}
						/>
					</div>
				</CardContent>
				<CardFooter class="flex flex-col space-y-4 px-6 pb-6">
					<Button type="submit" class="w-full" disabled={loading}>
						{loading
							? m['reset_password.button_loading']({})
							: m['reset_password.button_reset']({})}
					</Button>
					<div class="flex justify-between text-sm text-muted-foreground">
						<a
							data-sveltekit-reload
							href="/auth/forgot-password"
							class="font-medium text-primary hover:underline"
						>
							{m['forgot_password.button_send']({})}
						</a>
						<a
							data-sveltekit-reload
							href="/auth/login"
							class="font-medium text-primary hover:underline"
						>
							{m['reset_password.back_to_login']({})}
						</a>
					</div>
				</CardFooter>
			</form>
		{/if}
	</Card>
</div>
