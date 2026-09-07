<script lang="ts">
	import { Save, Loader2 } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import type { Snippet } from 'svelte';
	
	let { 
		onclick, 
		type = "button",
		isLoading = false, 
		class: className = "", 
		title = "SALVA",
		text = "",
		children
	}: {
		onclick?: any;
		type?: "button" | "submit" | "reset";
		isLoading?: boolean;
		class?: string;
		title?: string;
		text?: string;
		children?: Snippet;
	} = $props();
</script>

<Button 
	{type}
	{onclick}
	disabled={isLoading}
	class="font-bold tracking-wider uppercase {className}"
	{title}
>
	{#if isLoading}
		<Loader2 class="h-4 w-4 animate-spin" strokeWidth={2} />
		{#if text}<span class="ml-2">{text}</span>{/if}
		{#if children}{@render children()}{/if}
	{:else}
		{#if !text}<Save class="h-4 w-4" strokeWidth={2} />{/if}
		{#if text}<span>{text}</span>{/if}
		{#if children}{@render children()}{/if}
	{/if}
</Button>
