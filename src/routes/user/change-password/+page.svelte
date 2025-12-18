<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { authService } from '#lib/services/auth.js';
	import * as m from '#lib/paraglide/messages.js';
	import { Eye, EyeOff } from '@lucide/svelte';

	let oldPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let successMessage = $state('');
	let showOldPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	const passwordsMatch = $derived(newPassword === confirmPassword);
	const isPasswordValid = $derived(newPassword.length >= 8);
	const canSubmit = $derived(
		oldPassword.length > 0 &&
			newPassword.length > 0 &&
			confirmPassword.length > 0 &&
			passwordsMatch &&
			isPasswordValid &&
			!isLoading
	);

	async function handleSubmit() {
		error = '';
		successMessage = '';

		if (!passwordsMatch) {
			error = m['change_password.passwords_not_match']({});
			return;
		}

		if (!isPasswordValid) {
			error = m['change_password.password_requirements']({});
			return;
		}

		isLoading = true;

		try {
			await authService.changePassword({
				old_password: oldPassword,
				new_password: newPassword
			});

			successMessage = m['change_password.success_message']({});

			// Clear form
			oldPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : 'Failed to change password';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container mx-auto max-w-2xl px-4 py-12">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">{m['change_password.title']({})}</h1>
		<p class="mt-2 text-muted-foreground">{m['change_password.description']({})}</p>
	</div>

	<Card>
		<CardContent>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
				class="space-y-4"
			>
				{#if error}
					<div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
						{error}
					</div>
				{/if}

				{#if successMessage}
					<div class="rounded-md bg-green-500/15 p-3 text-sm text-green-700 dark:text-green-400">
						{successMessage}
					</div>
				{/if}

				<div class="space-y-2">
					<Label for="old-password">{m['change_password.old_password_label']({})}</Label>
					<div class="relative">
						<Input
							id="old-password"
							type={showOldPassword ? 'text' : 'password'}
							placeholder={m['change_password.old_password_placeholder']({})}
							bind:value={oldPassword}
							disabled={isLoading}
							required
							class="h-9 pr-10"
						/>
						<button
							type="button"
							onclick={() => (showOldPassword = !showOldPassword)}
							class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							tabindex="-1"
						>
							{#if showOldPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</button>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="new-password">{m['change_password.new_password_label']({})}</Label>
					<div class="relative">
						<Input
							id="new-password"
							type={showNewPassword ? 'text' : 'password'}
							placeholder={m['change_password.new_password_placeholder']({})}
							bind:value={newPassword}
							disabled={isLoading}
							required
							class="h-9 pr-10"
						/>
						<button
							type="button"
							onclick={() => (showNewPassword = !showNewPassword)}
							class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							tabindex="-1"
						>
							{#if showNewPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</button>
					</div>
					{#if newPassword.length > 0 && !isPasswordValid}
						<p class="text-xs text-muted-foreground">
							{m['change_password.password_requirements']({})}
						</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="confirm-password">{m['change_password.confirm_password_label']({})}</Label>
					<div class="relative">
						<Input
							id="confirm-password"
							type={showConfirmPassword ? 'text' : 'password'}
							placeholder={m['change_password.confirm_password_placeholder']({})}
							bind:value={confirmPassword}
							disabled={isLoading}
							required
							class="h-9 pr-10"
						/>
						<button
							type="button"
							onclick={() => (showConfirmPassword = !showConfirmPassword)}
							class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							tabindex="-1"
						>
							{#if showConfirmPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</button>
					</div>
					{#if confirmPassword.length > 0 && !passwordsMatch}
						<p class="text-xs text-destructive">
							{m['change_password.passwords_not_match']({})}
						</p>
					{/if}
				</div>

				<div class="flex items-center space-x-2 pt-4">
					<Button type="submit" disabled={!canSubmit} class="w-full">
						{isLoading
							? m['change_password.submitting_button']({})
							: m['change_password.submit_button']({})}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
