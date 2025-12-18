<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '#lib/components/ui/card/index.js';
	import { authStore } from '#lib/stores/auth.svelte.js';
	import * as m from '#lib/paraglide/messages.js';

	const isAuthenticated = $derived(authStore.isAuthenticated);
</script>

<div class="container mx-auto px-4 py-12">
	<div class="mx-auto max-w-4xl space-y-8">
		<!-- Hero Section -->
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html m['home.hero.title']({})}
			</h1>
			<p class="mt-4 text-lg text-muted-foreground">
				{m['home.hero.description']({})}
			</p>
			{#if !isAuthenticated}
				<div class="mt-8 flex justify-center space-x-4">
					<Button size="lg" href="/auth/register">{m['home.hero.get_started']({})}</Button>
					<Button size="lg" variant="outline" href="/auth/login">{m['home.hero.login']({})}</Button>
				</div>
			{/if}
		</div>

		<!-- Features -->
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center space-x-2">
						<span>🔐</span>
						<span>{m['home.features.auth.title']({})}</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>
						{m['home.features.auth.description']({})}
					</CardDescription>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center space-x-2">
						<span>📸</span>
						<span>{m['home.features.upload.title']({})}</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>
						{m['home.features.upload.description']({})}
					</CardDescription>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center space-x-2">
						<span>⚡</span>
						<span>{m['home.features.realtime.title']({})}</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription>
						{m['home.features.realtime.description']({})}
					</CardDescription>
				</CardContent>
			</Card>
		</div>

		{#if isAuthenticated}
			<Card class="border-primary/50 bg-primary/5">
				<CardHeader>
					<CardTitle>{m['home.cta.title']({})}</CardTitle>
					<CardDescription>
						{m['home.cta.description']({})}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button href="/user/avatar-upload" size="lg" class="w-full sm:w-auto">
						{m['home.cta.button']({})}
					</Button>
				</CardContent>
			</Card>
		{/if}

		<!-- Tech Stack -->
		<div class="rounded-lg border bg-muted/30 p-6">
			<h2 class="mb-4 text-xl font-semibold">{m['home.tech_stack.title']({})}</h2>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<h3 class="mb-2 font-medium">{m['home.tech_stack.frontend']({})}</h3>
					<ul class="space-y-1 text-sm text-muted-foreground">
						<li>✓ SvelteKit 5</li>
						<li>✓ TypeScript</li>
						<li>✓ Tailwind CSS</li>
						<li>✓ shadcn/ui Components</li>
					</ul>
				</div>
				<div>
					<h3 class="mb-2 font-medium">{m['home.tech_stack.backend']({})}</h3>
					<ul class="space-y-1 text-sm text-muted-foreground">
						<li>✓ Rust Axum</li>
						<li>✓ JWT Authentication</li>
						<li>✓ WebSocket Support</li>
						<li>✓ PostgreSQL</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>
