<script lang="ts">
	let { children, header } = $props<{
		children: import('svelte').Snippet;
		header?: import('svelte').Snippet;
	}>();
</script>

<div class="bg-card/40 border border-border/40 rounded-3xl p-4 shadow-sm flex flex-col gap-3 relative w-full overflow-hidden">
	{#if header}
		{@render header()}
	{/if}
	
	<div class="w-full relative min-h-0">
		{@render children()}
	</div>
</div>

