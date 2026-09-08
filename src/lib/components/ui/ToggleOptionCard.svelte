<script lang="ts">
	import { Switch } from "$lib/components/ui/switch";
	import type { Snippet } from "svelte";

	let {
		title,
		description,
		checked = $bindable(),
		icon,
		children
	} = $props<{
		title: string;
		description: string;
		checked: boolean;
		icon?: Snippet;
		children?: Snippet;
	}>();
</script>

<div class="flex flex-col p-4 border border-border rounded-xl bg-background shadow-sm transition-all">
	<div class="flex items-center justify-between gap-4">
		
		<!-- Left: Title & Description -->
		<div class="flex flex-col flex-1 min-w-0 justify-center">
			<div class="flex items-center gap-2 text-foreground">
				{#if icon}
					{@render icon()}
				{/if}
				<h4 class="text-sm font-bold uppercase tracking-wider truncate">{title}</h4>
			</div>
			<p class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1 leading-snug">{description}</p>
		</div>
		
		<!-- Right: Status and Toggle (Boxed) -->
		<div class="flex items-center gap-3 px-3 py-1.5 border border-border rounded-lg bg-card/50 shrink-0">
			<!-- Testo ON/OFF brillante -->
			<span class="text-[11px] font-black uppercase tracking-wider w-6 text-center transition-colors {checked ? 'text-primary [text-shadow:_0_0_8px_var(--color-primary)]' : 'text-muted-foreground'}">
				{checked ? 'ON' : 'OFF'}
			</span>
			<Switch bind:checked />
		</div>

	</div>

	<!-- Nested content (e.g., conditional fields) -->
	{#if children}
		{@render children()}
	{/if}
</div>

