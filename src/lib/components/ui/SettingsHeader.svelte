<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import type { Snippet } from "svelte";

	let {
		title,
		description = '',
		icon
	} = $props<{
		title: string;
		description?: string;
		icon: Snippet;
	}>();
</script>

<Card.Header class="border-b-2 border-border bg-card px-4 sm:px-6 py-5 rounded-t-xl">
	<div class="flex items-center gap-3 sm:gap-4 w-full">
		<div class="p-3 bg-muted text-primary rounded-xl ring-1 ring-border shadow-sm flex items-center justify-center shrink-0">
			{@render icon()}
		</div>
		<div class="flex flex-col justify-center flex-1 min-w-0">
			<Card.Title class="text-[17px] sm:text-xl font-black uppercase tracking-wider text-foreground truncate">{title}</Card.Title>
			{#if description}
				<Card.Description class="text-[9px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1 truncate">
					{description}
				</Card.Description>
			{/if}
		</div>
	</div>
</Card.Header>

