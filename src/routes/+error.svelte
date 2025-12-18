<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import { RefreshCw } from '@lucide/svelte';
	import * as m from '#lib/paraglide/messages.js';

	const status = $derived(page.status);

	function handleReload() {
		window.location.reload();
	}
</script>

<div class="container mx-auto flex flex-1 items-center justify-center px-4">
	<div class="w-full max-w-md text-center">
		<h1 class="text-8xl font-bold text-primary">{status}</h1>
		<p class="mt-4 text-2xl font-semibold">{m['error.page_not_found']({})}</p>
		<p class="mt-2 text-muted-foreground">{m['error.page_not_found_description']({})}</p>

		<Button onclick={handleReload} class="mt-8">
			<RefreshCw class="mr-2 h-4 w-4" />
			{m['error.reload_page']({})}
		</Button>

		<p class="mt-8 text-sm text-muted-foreground">
			{m['error.contact_support']({})}
		</p>
	</div>
</div>
