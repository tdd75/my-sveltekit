<script lang="ts">
	import { Input } from '#lib/components/ui/input/index.js';
	import { Eye, EyeOff } from '@lucide/svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'files'> {
		value?: string;
		class?: string;
	}

	let { value = $bindable(''), class: className, ...restProps }: Props = $props();

	let showPassword = $state(false);

	function togglePassword() {
		showPassword = !showPassword;
	}

	const inputType = $derived(showPassword ? 'text' : 'password');
</script>

<div class="relative">
	<Input type={inputType} bind:value class={className} {...restProps} />
	<button
		type="button"
		onclick={togglePassword}
		class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
		tabindex="-1"
	>
		{#if showPassword}
			<EyeOff class="h-5 w-5" />
		{:else}
			<Eye class="h-5 w-5" />
		{/if}
	</button>
</div>
