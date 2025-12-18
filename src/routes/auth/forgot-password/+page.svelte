<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '#lib/components/ui/card/index.js';
	import { authService, type ForgotPasswordRequest } from '#lib/services/auth.js';
	import * as m from '#lib/paraglide/messages.js';

	let email = '';
	let loading = false;
	let error = '';
	let success = false;

	async function handleSubmit() {
		error = '';
		loading = true;

		try {
			const data: ForgotPasswordRequest = { email };
			await authService.forgotPassword(data);
			success = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to send reset email';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-12">
	<Card class="w-full max-w-md">
		<CardHeader class="space-y-1">
			<CardTitle class="text-2xl font-bold">{m['forgot_password.title']({})}</CardTitle>
			<CardDescription>{m['forgot_password.description']({})}</CardDescription>
		</CardHeader>
		{#if success}
			<CardContent class="space-y-4 px-6 pb-4">
				<div class="rounded-lg bg-green-50 p-4 text-sm text-green-800">
					<p class="font-medium">{m['forgot_password.success_title']({})}</p>
					<p class="mt-2">
						{m['forgot_password.success_message']({})}
					</p>
				</div>
			</CardContent>
			<CardFooter class="flex flex-col space-y-4 px-6 pb-6">
				<Button data-sveltekit-reload href="/auth/reset-password" class="w-full"
					>{m['forgot_password.continue_button']({})}</Button
				>
				<p class="text-center text-sm text-muted-foreground">
					<a
						data-sveltekit-reload
						href="/auth/login"
						class="font-medium text-primary hover:underline"
						>{m['forgot_password.back_to_login']({})}</a
					>
				</p>
			</CardFooter>
		{:else}
			<form on:submit|preventDefault={handleSubmit}>
				<CardContent class="space-y-4 px-6 pb-4">
					{#if error}
						<div class="rounded-lg bg-red-50 p-4 text-sm text-red-800">
							{error}
						</div>
					{/if}
					<div class="space-y-2">
						<Label for="email">{m['forgot_password.email_label']({})}</Label>
						<Input
							id="email"
							type="email"
							placeholder={m['forgot_password.email_placeholder']({})}
							bind:value={email}
							required
							disabled={loading}
						/>
					</div>
				</CardContent>
				<CardFooter class="flex flex-col space-y-4 px-6 pb-6">
					<Button type="submit" class="w-full" disabled={loading}>
						{loading
							? m['forgot_password.button_loading']({})
							: m['forgot_password.button_send']({})}
					</Button>
					<p class="text-center text-sm text-muted-foreground">
						<a
							data-sveltekit-reload
							href="/auth/login"
							class="font-medium text-primary hover:underline"
							>{m['forgot_password.back_to_login']({})}</a
						>
					</p>
				</CardFooter>
			</form>
		{/if}
	</Card>
</div>
