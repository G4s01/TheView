<script lang="ts">
	import { useOpenwrt } from '$lib/queries/useOpenwrt';
	import { Router, Activity, ArrowDown, ArrowUp } from '@lucide/svelte';

	let { service, hideHeader = false } = $props<{ service: any; hideHeader?: boolean; }>();

	let rectW = $state(0);
	let rectH = $state(0);
	let isWide = $derived(rectW > rectH * 1.2);
	let cols = $derived(rectW >= 400 || isWide ? 'grid-cols-2' : 'grid-cols-1');

	let query = useOpenwrt(() => service.id);
	let data = $derived(query.data);
	let interfaces = $derived(data?.interfaces || []);
	let devices = $derived(data?.devices || []);
	let system = $derived(data?.system);

	function formatBytes(bytes: number) {
		if (!bytes) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	function formatUptime(seconds: number) {
		const d = Math.floor(seconds / 86400);
		const h = Math.floor((seconds % 86400) / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		if (d > 0) return `${d}g ${h}h`;
		if (h > 0) return `${h}h ${m}m`;
		return `${m}m`;
	}
</script>

<div class="h-full w-full flex flex-col p-4" bind:clientWidth={rectW} bind:clientHeight={rectH}>
	{#if !hideHeader}
		<div class="flex items-center justify-between mb-4 shrink-0">
			<div class="flex items-center gap-2">
				<Router class="size-5 text-primary" />
				<h3 class="font-semibold tracking-wider text-sm">OPENWRT</h3>
			</div>
			{#if system && !query.isPending}
				<div class="text-xs text-muted-foreground flex items-center gap-2 font-medium">
					<span>UP: {formatUptime(system.uptime)}</span>
					{#if system.load?.[0] !== undefined}
						<span class="hidden sm:inline">LOAD: {(system.load[0] / 65535).toFixed(2)}</span>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<div class="flex-1 overflow-y-auto overflow-x-hidden min-h-0 custom-scrollbar pr-2">
		{#if query.isPending}
			<div class="grid {cols} gap-3">
				{#each Array(4) as _}
					<div class="bg-muted/20 p-3 rounded-lg border border-border/50 animate-pulse flex flex-col gap-3">
						<div class="flex items-center justify-between">
							<div class="h-4 bg-muted/60 rounded w-16"></div>
							<div class="h-2 w-2 rounded-full bg-muted/60"></div>
						</div>
						<div class="flex flex-col gap-1.5">
							<div class="h-3 bg-muted/40 rounded w-24"></div>
							<div class="flex justify-between mt-1">
								<div class="h-3 bg-muted/40 rounded w-12"></div>
								<div class="h-3 bg-muted/40 rounded w-12"></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else if query.isError}
			<div class="flex flex-col items-center justify-center h-full text-center text-destructive/80 gap-2">
				<Activity class="size-8 opacity-50" />
				<p class="text-sm font-medium">{query.error?.message || 'Errore di connessione'}</p>
			</div>
		{:else if interfaces.length === 0}
			<div class="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
				<Router class="size-8 opacity-50" />
				<p class="text-sm">Nessuna interfaccia trovata</p>
			</div>
		{:else}
			<div class="grid {cols} gap-3 pb-1">
				{#each interfaces as iface}
					<div class="bg-card p-3 rounded-lg border border-border shadow-sm flex flex-col gap-2">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<span class="font-bold text-sm uppercase tracking-wider">{iface.name}</span>
								<span class="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">{iface.device}</span>
							</div>
							<div class="flex items-center gap-1.5">
								<span class="text-[10px] uppercase font-bold {iface.up ? 'text-green-500' : 'text-muted-foreground'}">
									{iface.up ? 'UP' : 'DOWN'}
								</span>
								<span class="relative flex h-2 w-2">
									{#if iface.up}
										<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
										<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
									{:else}
										<span class="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground"></span>
									{/if}
								</span>
							</div>
						</div>

						<div class="flex flex-col gap-1">
							{#if iface.ipv4.length > 0}
								<span class="text-xs text-muted-foreground truncate" title={iface.ipv4.join(', ')}>{iface.ipv4[0]}</span>
							{:else}
								<span class="text-xs text-muted-foreground italic">No IP</span>
							{/if}
						</div>

						<div class="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
							<div class="flex items-center gap-1 text-xs font-medium text-emerald-500/90" title="Ricevuti">
								<ArrowDown class="size-3" />
								{formatBytes(iface.rx_bytes)}
							</div>
							<div class="flex items-center gap-1 text-xs font-medium text-blue-500/90" title="Inviati">
								<ArrowUp class="size-3" />
								{formatBytes(iface.tx_bytes)}
							</div>
						</div>
					</div>
				{/each}
			</div>
			
			{#if devices.length > 0}
			<div class="mt-4 pt-3 border-t border-border">
				<h4 class="text-[10px] uppercase font-bold text-muted-foreground mb-2 tracking-widest">Porte Fisiche & Dispositivi</h4>
				<div class="flex flex-wrap gap-2">
					{#each devices as dev}
						<div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border shadow-xs {dev.up ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' : 'bg-muted text-muted-foreground border-border'}">
							<span class="relative flex h-1.5 w-1.5">
								{#if dev.up}
									<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
									<span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
								{:else}
									<span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-muted-foreground"></span>
								{/if}
							</span>
							<span class="uppercase tracking-wider">{dev.name}</span>
							{#if dev.speed}
								<span class="opacity-70 ml-0.5">({dev.speed})</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
			{/if}
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
