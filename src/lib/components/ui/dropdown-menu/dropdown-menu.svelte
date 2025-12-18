<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		trigger?: Snippet;
		children?: Snippet;
		align?: 'left' | 'right';
	}

	let { trigger, children, align = 'right' }: Props = $props();

	let isOpen = $state(false);
	let dropdownElement = $state<HTMLDivElement | undefined>();
	let triggerElement = $state<HTMLButtonElement | undefined>();

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function closeDropdown() {
		isOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (
			dropdownElement &&
			!dropdownElement.contains(event.target as Node) &&
			triggerElement &&
			!triggerElement.contains(event.target as Node)
		) {
			closeDropdown();
		}
	}

	function handleEscape(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeDropdown();
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleEscape);
	});

	onDestroy(() => {
		document.removeEventListener('click', handleClickOutside);
		document.removeEventListener('keydown', handleEscape);
	});
</script>

<div class="relative inline-block">
	<button
		bind:this={triggerElement}
		type="button"
		onclick={toggleDropdown}
		class="focus:outline-none"
	>
		{@render trigger?.()}
	</button>

	{#if isOpen}
		<div
			bind:this={dropdownElement}
			class="absolute z-50 mt-2 w-48 rounded-md border bg-popover shadow-lg"
			class:right-0={align === 'right'}
			class:left-0={align === 'left'}
		>
			<div
				class="py-1"
				role="menu"
				tabindex="-1"
				onclick={closeDropdown}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						closeDropdown();
					}
				}}
			>
				{@render children?.()}
			</div>
		</div>
	{/if}
</div>
