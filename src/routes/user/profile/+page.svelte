<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { authService, type UserProfile } from '#lib/services/auth.js';
	import { useUserProfile, useInvalidateUserProfile } from '#lib/hooks/use-user-profile.svelte.js';
	import { createMutation } from '@tanstack/svelte-query';
	import * as m from '#lib/paraglide/messages.js';

	let profile: UserProfile | null = $state(null);
	let loading = $state(true);
	let error = $state('');
	let successMessage = $state('');

	const userProfileQuery = useUserProfile();
	const invalidateProfile = useInvalidateUserProfile();

	const updateProfileMutation = createMutation(() => ({
		mutationFn: (updates: Record<string, string | undefined>) => authService.updateProfile(updates),
		onSuccess: (updatedProfile: UserProfile) => {
			profile = updatedProfile;
			invalidateProfile();
			originalFirstName = firstName;
			originalLastName = lastName;
			originalPhone = phone;
			successMessage = m['profile.success_message']({});
			setTimeout(() => {
				successMessage = '';
			}, 3000);
		},
		onError: (err: Error) => {
			error = err instanceof Error ? err.message : 'Failed to update profile';
		}
	}));

	const saving = $derived(updateProfileMutation.isPending);

	// Form fields
	let firstName = $state('');
	let lastName = $state('');
	let phone = $state('');

	// Original values for comparison
	let originalFirstName = $state('');
	let originalLastName = $state('');
	let originalPhone = $state('');

	// Check if there are any changes
	let hasChanges = $derived(
		firstName !== originalFirstName || lastName !== originalLastName || phone !== originalPhone
	);

	onMount(async () => {
		// Wait for query to load
		if (userProfileQuery.data) {
			profile = userProfileQuery.data;
			initializeFormFields();
			loading = false;
		}
	});

	$effect(() => {
		if (userProfileQuery.data && !profile) {
			profile = userProfileQuery.data;
			initializeFormFields();
		}
		if (userProfileQuery.isError) {
			error = 'Failed to load profile';
		}
		loading = userProfileQuery.isLoading;
	});

	function initializeFormFields() {
		if (!profile) return;
		firstName = profile.first_name || '';
		lastName = profile.last_name || '';
		phone = profile.phone || '';
		// Store original values
		originalFirstName = firstName;
		originalLastName = lastName;
		originalPhone = phone;
	}

	async function handleSave() {
		if (!hasChanges) return;

		error = '';
		successMessage = '';

		// Only send changed fields
		const updates: Record<string, string | undefined> = {};
		if (firstName !== originalFirstName) updates.first_name = firstName;
		if (lastName !== originalLastName) updates.last_name = lastName;
		if (phone !== originalPhone) updates.phone = phone;

		updateProfileMutation.mutate(updates);
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<div class="container mx-auto max-w-4xl px-4 py-12">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">{m['profile.title']({})}</h1>
			<p class="mt-2 text-muted-foreground">{m['profile.description']({})}</p>
		</div>
		<div class="flex gap-2">
			<Button onclick={handleSave} disabled={saving || !hasChanges}>
				{saving ? m['profile.saving_button']({}) : m['profile.save_button']({})}
			</Button>
		</div>
	</div>

	{#if loading}
		<Card>
			<CardContent class="flex items-center justify-center py-12">
				<div class="flex items-center space-x-2">
					<div
						class="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
					></div>
					<span class="text-muted-foreground">Loading...</span>
				</div>
			</CardContent>
		</Card>
	{:else if error}
		<Card>
			<CardContent class="py-12">
				<div class="rounded-lg bg-red-50 p-4 text-sm text-red-800">
					{error}
				</div>
			</CardContent>
		</Card>
	{:else if profile}
		{#if successMessage}
			<div class="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">
				{successMessage}
			</div>
		{/if}

		{#if error}
			<div class="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">
				{error}
			</div>
		{/if}

		<div class="space-y-6">
			<!-- Personal Information -->
			<Card>
				<CardHeader>
					<CardTitle>{m['profile.personal_info']({})}</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label>{m['profile.email_label']({})}</Label>
							<Input value={profile.email} disabled class="bg-muted/50" />
						</div>
						<div class="space-y-2">
							<Label for="phone">{m['profile.phone_label']({})}</Label>
							<Input id="phone" type="tel" bind:value={phone} disabled={saving} />
						</div>
					</div>
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="firstName">{m['profile.first_name_label']({})}</Label>
							<Input id="firstName" type="text" bind:value={firstName} disabled={saving} />
						</div>
						<div class="space-y-2">
							<Label for="lastName">{m['profile.last_name_label']({})}</Label>
							<Input id="lastName" type="text" bind:value={lastName} disabled={saving} />
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Account Information -->
			<Card>
				<CardHeader>
					<CardTitle>{m['profile.account_info']({})}</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label>{m['profile.user_id_label']({})}</Label>
							<Input value={profile.id} disabled class="bg-muted/50 font-mono" />
						</div>
						<div class="space-y-2">
							<Label>{m['profile.created_at_label']({})}</Label>
							<Input value={formatDate(profile.created_at)} disabled class="bg-muted/50" />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	{/if}
</div>
