<script lang="ts">
	import { Cpu, HardDrive, MemoryStick, Clock, ChevronDown, ChevronUp, Box, ArrowDown, ArrowUp } from '@lucide/svelte';
	import { useBeszelContainers } from '$lib/queries/useBeszel';

	let { service, node } = $props<{ service: any; node: any }>();
	let info = $derived(node.info || {});
	
	let expanded = $state(false);

	const containerQuery = useBeszelContainers(() => expanded ? node.id : null);
	
	let containers = $derived(
		containerQuery.data?.items?.[0]?.stats || []
	);

	function formatUptime(seconds: number | undefined) {
		if (seconds === undefined) return 'N/A';
		const d = Math.floor(seconds / 86400);
		const h = Math.floor((seconds % 86400) / 3600);
		if (d > 0) return `${d}g ${h}h`;
		const m = Math.floor((seconds % 3600) / 60);
		if (h > 0) return `${h}h ${m}m`;
		return `${m}m`;
	}

	function formatBytes(bytes: number) {
		if (!bytes) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}
	
	function formatNetwork(bytesPerSec: number) {
		return formatBytes(bytesPerSec) + '/s';
	}
	
	let ramUsed = $derived(info.t && info.mp ? (info.t * info.mp / 100).toFixed(1) : '0');
	let diskUsed = $derived(info.dt && info.dp ? (info.dt * info.dp / 100).toFixed(1) : '0');
</script>

<div class="bg-card hover:bg-muted/10 transition-colors rounded-lg border border-border flex flex-col overflow-hidden">
	<!-- Intestazione cliccabile per espandere -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="p-3 flex flex-col gap-3 cursor-pointer select-none" onclick={() => expanded = !expanded}>
		<div class="flex items-center justify-between">
			<span class="font-medium text-sm text-foreground truncate flex-1 pr-2">{node.name}</span>
			<div class="flex items-center gap-2 shrink-0">
				<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
					{node.status === 'up' ? 'ONLINE' : 'OFFLINE'}
				</span>
				{#if expanded}
					<ChevronUp class="size-4 text-muted-foreground" />
				{:else}
					<ChevronDown class="size-4 text-muted-foreground" />
				{/if}
			</div>
		</div>
		
		{#if info.u !== undefined}
			<div class="flex items-center gap-1.5 text-xs text-muted-foreground -mt-1">
				<Clock class="size-3" />
				<span>Uptime: <span class="font-medium text-foreground">{formatUptime(info.u)}</span></span>
			</div>
		{/if}
		
		{#if info.cpu !== undefined}
			<div class="flex flex-col gap-1.5 mt-1">
				<div class="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground/80">
					<div class="flex items-center gap-1.5">
						<Cpu class="size-3 text-primary/80" />
						<span>CPU</span>
					</div>
					<span>{info.cpu.toFixed(1)}%</span>
				</div>
				<div class="w-full bg-muted/40 rounded-full h-1 overflow-hidden">
					<div class="bg-primary h-full rounded-full transition-all duration-500" style="width: {Math.min(100, info.cpu)}%"></div>
				</div>
			</div>
		{/if}

		{#if info.mp !== undefined && info.t !== undefined}
			<div class="flex flex-col gap-1.5 mt-0.5">
				<div class="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground/80">
					<div class="flex items-center gap-1.5">
						<MemoryStick class="size-3 text-primary/80" />
						<span>RAM</span>
					</div>
					<div class="flex gap-1 items-baseline">
						<span>{info.mp.toFixed(1)}%</span>
						<span class="text-[9px] font-normal tracking-normal">({ramUsed} / {info.t.toFixed(1)} GB)</span>
					</div>
				</div>
				<div class="w-full bg-muted/40 rounded-full h-1 overflow-hidden">
					<div class="bg-primary h-full rounded-full transition-all duration-500" style="width: {Math.min(100, info.mp)}%"></div>
				</div>
			</div>
		{/if}

		{#if info.dp !== undefined && info.dt !== undefined}
			<div class="flex flex-col gap-1.5 mt-0.5">
				<div class="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground/80">
					<div class="flex items-center gap-1.5">
						<HardDrive class="size-3 text-destructive/80" />
						<span>DISK</span>
					</div>
					<div class="flex gap-1 items-baseline">
						<span>{info.dp.toFixed(1)}%</span>
						<span class="text-[9px] font-normal tracking-normal">({diskUsed} / {info.dt.toFixed(1)} GB)</span>
					</div>
				</div>
				<div class="w-full bg-muted/40 rounded-full h-1 overflow-hidden">
					<div class="bg-destructive h-full rounded-full transition-all duration-500" style="width: {Math.min(100, info.dp)}%"></div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Espansione Docker Container -->
	{#if expanded}
		<div class="border-t border-border/50 bg-muted/5 flex-1 min-h-0 flex flex-col">
			<div class="px-3 py-2 border-b border-border/50 bg-muted/20 flex items-center gap-2">
				<Box class="size-3.5 text-muted-foreground" />
				<span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Docker Containers</span>
			</div>
			
			<div class="flex-1 p-2 flex flex-col gap-2 relative">
				{#if containerQuery.isPending}
					<div class="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-[1px] z-10">
						<span class="relative flex size-4">
						  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
						  <span class="relative inline-flex rounded-full size-4 bg-primary"></span>
						</span>
					</div>
				{/if}
				
				{#if containerQuery.isError}
					<div class="text-xs text-destructive text-center p-2">Errore caricamento container</div>
				{:else if containers.length === 0 && !containerQuery.isPending}
					<div class="text-xs text-muted-foreground text-center p-2">Nessun container attivo</div>
				{:else}
					{#each containers as c}
						<div class="flex flex-col gap-1 p-2 rounded-md bg-card border border-border/50 text-xs shadow-sm hover:border-primary/30 transition-colors">
							<div class="flex items-center justify-between font-medium">
								<span class="truncate text-foreground max-w-50">{c.n}</span>
							</div>
							
							<div class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] text-muted-foreground">
								<div class="flex items-center gap-1" title="CPU">
									<Cpu class="size-3 text-primary/70" />
									<span>{c.c.toFixed(1)}%</span>
								</div>
								<div class="flex items-center gap-1" title="RAM">
									<MemoryStick class="size-3 text-primary/70" />
									<span>{c.m.toFixed(1)} MB</span>
								</div>
								
								{#if c.b && c.b.length === 2}
									<div class="flex items-center gap-2 ml-auto" title="Rete (Down / Up)">
										<div class="flex items-center gap-0.5 text-primary/80">
											<ArrowDown class="size-2.5" />
											<span>{formatNetwork(c.b[0])}</span>
										</div>
										<div class="flex items-center gap-0.5 text-muted-foreground/80">
											<ArrowUp class="size-2.5" />
											<span>{formatNetwork(c.b[1])}</span>
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>
