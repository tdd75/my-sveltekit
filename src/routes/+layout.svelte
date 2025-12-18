<script lang="ts">
	import { page } from '$app/state';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { locales, localizeHref } from '#lib/paraglide/runtime.js';
	import Navigation from '#lib/components/app/navigation.svelte';
	import { authStore } from '#lib/stores/auth.svelte.js';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';

	let { children, data } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: 1,
				refetchOnWindowFocus: false
			}
		}
	});

	// Seed client auth state from the server-derived cookie check.
	$effect(() => {
		authStore.setAuthenticated(data.isAuthenticated);
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<QueryClientProvider client={queryClient}>
	<div class="flex min-h-screen flex-col">
		<Navigation />

		<main class="flex flex-1 flex-col">
			{@render children()}
		</main>
	</div>
</QueryClientProvider>

<div style="display:none">
	{#each locales as locale (locale)}
		<a data-sveltekit-reload href={localizeHref(page.url.pathname, { locale })}>
			{locale}
		</a>
	{/each}
</div>
