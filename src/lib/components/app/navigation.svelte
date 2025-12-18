<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Button } from '#lib/components/ui/button/index.js';
	import { DropdownMenu } from 'bits-ui';
	import { User, KeyRound, LogOut, Moon, Sun } from '@lucide/svelte';
	import { authService, type UserProfile } from '#lib/services/auth.js';
	import { authStore } from '#lib/stores/auth.svelte.js';
	import { themeStore } from '#lib/stores/theme.svelte.js';
	import { useUserProfile } from '#lib/hooks/use-user-profile.svelte.js';
	import * as m from '#lib/paraglide/messages.js';
	import { locales, getLocale, setLocale } from '#lib/paraglide/runtime.js';

	let currentPath = $derived(page.url.pathname);
	let currentLocale = $derived(getLocale());

	const userProfileQuery = useUserProfile();
	const userProfile = $derived<UserProfile | null>(
		authStore.isAuthenticated && userProfileQuery.data ? userProfileQuery.data : null
	);

	function handleLocaleChange(locale: 'en' | 'vi') {
		setLocale(locale);
		window.location.reload();
	}

	const navLinks = $derived([
		{ href: '/', label: m['nav.home']({}) },
		{ href: '/user/avatar-upload', label: m['nav.avatar_upload']({}) }
	]);

	function isActive(href: string) {
		if (href === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(href);
	}

	async function handleLogout() {
		await authService.logout();
		authStore.setAuthenticated(false);
		await goto('/auth/login', { invalidateAll: true });
	}

	const isAuthenticated = $derived(authStore.isAuthenticated);

	function getInitials(profile: UserProfile | null): string {
		if (!profile) return 'U';
		const firstName = profile.first_name || '';
		const lastName = profile.last_name || '';
		if (firstName && lastName) {
			return `${firstName[0]}${lastName[0]}`.toUpperCase();
		}
		if (firstName) return firstName[0].toUpperCase();
		if (lastName) return lastName[0].toUpperCase();
		return profile.email[0].toUpperCase();
	}

	function getDisplayName(profile: UserProfile | null): string {
		if (!profile) return '';
		const firstName = profile.first_name || '';
		const lastName = profile.last_name || '';
		if (firstName || lastName) {
			return `${firstName} ${lastName}`.trim();
		}
		return profile.email;
	}
</script>

<nav class="border-b bg-background">
	<div class="container mx-auto flex h-16 items-center justify-between px-4">
		<div class="flex items-center space-x-8">
			<a data-sveltekit-reload href="/" class="flex items-center gap-2" aria-label="Home">
				<img src="/svelte-logo.svg" alt="Svelte Logo" class="h-8 w-8" />
			</a>

			{#if isAuthenticated}
				<div class="hidden space-x-1 md:flex">
					{#each navLinks as link (link.href)}
						<a
							href={link.href}
							class="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
							class:bg-accent={isActive(link.href)}
							class:text-accent-foreground={isActive(link.href)}
						>
							{link.label}
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<div class="flex items-center space-x-4">
			<!-- Dark Mode Toggle -->
			<button
				onclick={() => themeStore.toggle()}
				class="flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
				aria-label="Toggle theme"
			>
				{#if themeStore.theme === 'dark'}
					<Sun class="h-4 w-4" />
				{:else}
					<Moon class="h-4 w-4" />
				{/if}
			</button>

			<!-- Language Switcher -->
			<div class="flex h-9 items-center space-x-1 rounded-md border bg-muted/50 p-1">
				{#each locales as locale (locale)}
					<button
						onclick={() => handleLocaleChange(locale)}
						class="rounded px-2 py-1.25 text-xs font-medium uppercase transition-colors hover:bg-background"
						class:bg-background={currentLocale === locale}
						class:text-foreground={currentLocale === locale}
						class:text-muted-foreground={currentLocale !== locale}
					>
						{locale}
					</button>
				{/each}
			</div>

			{#if isAuthenticated}
				<div class="relative inline-block">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<button
									{...props}
									class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
								>
									{#if userProfile}
										{getInitials(userProfile)}
									{:else}
										<User class="h-5 w-5" />
									{/if}
								</button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content
							class="z-50 min-w-64 rounded-md border bg-popover p-0 text-popover-foreground shadow-md"
							sideOffset={5}
							align="end"
						>
							{#if userProfile}
								<div class="border-b px-4 py-3">
									<div class="flex items-center gap-3">
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
										>
											{getInitials(userProfile)}
										</div>
										<div class="flex flex-col overflow-hidden">
											<p class="truncate text-sm font-medium">
												{getDisplayName(userProfile)}
											</p>
											<p class="truncate text-xs text-muted-foreground">
												{userProfile.email}
											</p>
										</div>
									</div>
								</div>
							{/if}
							<div class="p-1">
								<DropdownMenu.Item
									class="relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
									onclick={() => goto('/user/profile')}
								>
									<User class="h-4 w-4" />
									{m['nav.profile']({})}
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
									onclick={() => goto('/user/change-password')}
								>
									<KeyRound class="h-4 w-4" />
									{m['nav.change_password']({})}
								</DropdownMenu.Item>
							</div>
							<div class="border-t p-1">
								<DropdownMenu.Item
									class="relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
									onclick={handleLogout}
								>
									<LogOut class="h-4 w-4" />
									{m['nav.logout']({})}
								</DropdownMenu.Item>
							</div>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			{:else}
				<div class="flex space-x-2">
					<Button variant="ghost" size="sm" href="/auth/login">{m['nav.login']({})}</Button>
					<Button size="sm" href="/auth/register">{m['nav.register']({})}</Button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Mobile menu -->
	{#if isAuthenticated}
		<div class="border-t px-4 py-2 md:hidden">
			<div class="flex flex-col space-y-1">
				{#each navLinks as link (link.href)}
					<a
						data-sveltekit-reload
						href={link.href}
						class="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
						class:bg-accent={isActive(link.href)}
						class:text-accent-foreground={isActive(link.href)}
					>
						{link.label}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</nav>
