<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import type { Snippet } from "svelte";

	let {
		open = $bindable(false),
		title,
		description,
		children,
		footer,
		class: className = ''
	} = $props<{
		open: boolean;
		title: string;
		description?: string;
		children: Snippet;
		footer?: Snippet;
		class?: string;
	}>();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class={className}>
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			{#if description}
				<Dialog.Description>
					{description}
				</Dialog.Description>
			{/if}
		</Dialog.Header>
		
		{@render children()}
		
		{#if footer}
			<Dialog.Footer>
				{@render footer()}
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

