<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Undo2 } from "@lucide/svelte";
	import type { Snippet } from 'svelte';
	
	let { 
		onclick, 
		disabled = false,
		class: className = "", 
		title = "INDIETRO",
		text = "ANNULLA",
		children
	}: {
		onclick?: any;
		disabled?: boolean;
		class?: string;
		title?: string;
		text?: string;
		children?: Snippet;
	} = $props();
</script>

<Button 
	variant="outline"
	type="button"
	{onclick}
	{disabled}
	class="font-bold tracking-wider uppercase {className}"
	{title}
>
	{#if text}
		<Undo2 class="mr-2 h-4 w-4" strokeWidth={2} />
		<span>{text}</span>
	{:else}
		<Undo2 class="h-4 w-4" strokeWidth={2} />
	{/if}
	{#if children}{@render children()}{/if}
</Button>
