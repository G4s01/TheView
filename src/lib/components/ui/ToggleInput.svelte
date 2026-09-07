<script lang="ts">
	import { Switch } from "$lib/components/ui/switch";
	import { Label } from "$lib/components/ui/label";

	let {
		label = '',
		description = '',
		checked = $bindable(false),
		id = Math.random().toString(36).substring(7)
	} = $props<{
		label?: string;
		description?: string;
		checked?: boolean;
		id?: string;
	}>();
</script>

<div class="flex w-full items-center justify-between gap-4 px-3 h-10 border border-input rounded-md bg-transparent overflow-hidden">
	<div class="flex flex-col justify-center">
		{#if label}
			<Label 
				for={id} 
				class="text-sm font-bold uppercase tracking-wider text-foreground cursor-pointer flex items-center gap-2"
			>
				{label}
				{#if label.toLowerCase().includes('ping') && checked}
					<span class="relative flex h-2 w-2">
					  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
					  <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
					</span>
				{/if}
			</Label>
		{/if}
		{#if description}
			<p class="text-[10px] text-muted-foreground leading-none mt-0.5">{description}</p>
		{/if}
	</div>
	<Switch {id} bind:checked />
</div>
