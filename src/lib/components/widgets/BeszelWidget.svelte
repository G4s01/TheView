<script lang="ts">
	import { useBeszel } from '$lib/queries/useBeszel';
	import BeszelNode from './BeszelNode.svelte';
	import { Activity, Server } from '@lucide/svelte';

	function formatUptime(seconds: number | undefined) {
		if (seconds === undefined) return 'N/A';
		const d = Math.floor(seconds / 86400);
		const h = Math.floor((seconds % 86400) / 3600);
		if (d > 0) return `${d}g ${h}h`;
		const m = Math.floor((seconds % 3600) / 60);
		if (h > 0) return `${h}h ${m}m`;
		return `${m}m`;
	}

	let { service, size = 'gs-2x2', hideHeader = false } = $props<{ service: any; size?: string;
		hideHeader?: boolean; }>();

	let nodeW = $derived(parseInt(size.split('x')[0].replace('gs-', '')) || 2);
	let nodeH = $derived(parseInt(size.split('x')[1]) || 2);
	let rectW = $state(0);
	let rectH = $state(0);
	let isWide = $derived(rectW && rectH ? rectW > rectH * 1.1 : nodeW > nodeH);

	let query = useBeszel(() => service.id);
	let items = $derived(query.data?.items || []);

	// Layout responsive basato sulle dimensioni reali di Gridstack
	let cols = $derived((rectW ? rectW >= 450 : nodeW >= 4) || isWide ? 'grid-cols-2' : 'grid-cols-1');
</script>

<div class="h-full w-full flex flex-col p-4">
	{#if !hideHeader}
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-2">
			<Activity class="size-5 text-primary" />
			<h3 class="font-semibold tracking-wider text-sm">MONITORAGGIO NODI</h3>
		</div>

		</div>
	{/if}

	<div class="flex-1 overflow-y-auto overflow-x-hidden min-h-0 custom-scrollbar pr-2">
		{#if query.isPending}
			<!-- SKELETON STATE -->
			<div class="grid {cols} gap-3">
				{#each Array(2) as _}
					<div class="bg-muted/30 p-3 rounded-lg border border-border/50 animate-pulse">
						<div class="flex items-center justify-between mb-2">
							<div class="h-4 bg-muted/60 rounded w-24"></div>
							<div class="h-3 bg-muted/60 rounded w-12"></div>
						</div>
						<div class="flex flex-col gap-2 mt-3">
							<div class="h-2 bg-muted/60 rounded w-full"></div>
							<div class="h-2 bg-muted/60 rounded w-3/4"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else if query.isError}
			<div class="flex flex-col items-center justify-center h-full text-center text-destructive/80 gap-2">
				<Server class="size-8 opacity-50" />
				<p class="text-sm font-medium">{query.error?.message || 'Errore di connessione'}</p>
			</div>
		{:else if items.length === 0}
			<div class="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
				<Server class="size-8 opacity-50" />
				<p class="text-sm">Nessun nodo trovato</p>
			</div>
		{:else}
			<div class="grid {cols} gap-3 pb-1">
				{#each items as node}
					<BeszelNode service={service} {node} />
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: hsl(var(--muted));
		border-radius: 4px;
	}
	.custom-scrollbar:hover::-webkit-scrollbar-thumb {
		background: hsl(var(--muted-foreground) / 0.5);
	}
</style>
