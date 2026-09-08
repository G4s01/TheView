<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import type { Snippet } from "svelte";

	let {
		title,
		description,
		icon
	} = $props<{
		title: string;
		description: string;
		icon: Snippet;
	}>();
</script>

<Card.Header class="border-b-2 border-border bg-card px-6 py-5 rounded-t-xl">
	<div class="flex items-center space-x-4">
		<div class="p-3 bg-muted text-primary rounded-xl ring-1 ring-border shadow-sm flex items-center justify-center">
			{@render icon()}
		</div>
		<div class="flex flex-col justify-center">
			<Card.Title class="text-xl font-black uppercase tracking-wider text-foreground">{title}</Card.Title>
			<Card.Description class="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
				{description}
			</Card.Description>
		</div>
	</div>
</Card.Header>

