<script lang="ts">
	import { useDocker, useDockerActions } from "$lib/queries/useDocker";
	import { Box, Play, Square, RotateCw, AlertTriangle, LoaderCircle } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import { appState } from "$lib/client/state.svelte";

	let { size = "gs-2x2" } = $props<{ size?: string }>();

	let nodeW = $derived(parseInt(size.split('x')[0].replace('gs-', '')) || 2);
	let nodeH = $derived(parseInt(size.split('x')[1]) || 2);
	let isWide = $derived(nodeW > nodeH);

	let query = useDocker();
	let actions = useDockerActions();

	let stats = $derived(query.data?.stats || { total: 0, running: 0, stopped: 0, paused: 0 });
	let containers = $derived(Array.isArray(query.data?.containers) ? query.data.containers : []);
	let isAdmin = $derived(appState.isAdmin);

	function handleAction(container: any, action: string) {
		actions.mutate({ id: container.id, action });
	}
</script>

<div class="h-full w-full flex flex-col p-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden text-card-foreground">
	<div class="flex items-center justify-between pb-2 mb-2 border-b border-border/50 shrink-0">
		<div class="flex items-center gap-2">
			<Box class="size-4 text-primary" />
			<span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Docker</span>
		</div>
	</div>

	<div class="flex flex-col flex-1 min-h-0 overflow-hidden pr-1">
		{#if query.isPending}
			<div class="flex flex-col gap-3 p-1">
				<div class="h-10 w-full bg-muted/50 rounded-lg animate-pulse"></div>
				<div class="h-10 w-full bg-muted/50 rounded-lg animate-pulse"></div>
			</div>
		{:else if query.isError}
			<div class="flex flex-col items-center justify-center h-full text-center text-destructive/80 gap-2 p-4">
				<AlertTriangle class="size-8 opacity-50" />
				<p class="text-xs font-medium truncate max-w-full">
					{query.error?.message || "Errore Docker"}
				</p>
			</div>
		{:else if containers.length === 0}
			<div class="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-4">
				<Box class="size-8 opacity-50" />
				<p class="text-xs font-medium truncate max-w-full">Nessun container</p>
			</div>
		{:else}
			<div class="flex flex-col gap-2 h-full">
				<!-- Sommari globali -->
				{#if isWide && nodeW >= 3}
					<div class="flex justify-between items-center w-full bg-muted/20 px-3 py-2 rounded-lg border border-border/40 shrink-0">
						<div class="flex items-center gap-2">
							<span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Esecuzione</span>
							<span class="text-sm font-bold text-foreground">{stats.running} / {stats.total}</span>
						</div>
						{#if stats.paused > 0}
							<div class="flex items-center gap-1.5 text-sm text-amber-500 font-medium">
								{stats.paused} In Pausa
							</div>
						{/if}
					</div>
				{:else}
					<div class="bg-muted/20 p-2 rounded-lg flex flex-col items-center justify-center border border-border/40 shrink-0">
						<span class="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">In Esec. / Totali</span>
						<div class="flex items-baseline gap-0.5 font-bold">
							<span class="text-xl leading-none {stats.running > 0 ? 'text-primary' : 'text-muted-foreground'}">{stats.running}</span>
							<span class="text-sm text-muted-foreground">/{stats.total}</span>
						</div>
					</div>
				{/if}

				<!-- Lista container -->
				<div class="flex flex-col gap-2 mt-1 pb-1 flex-1 overflow-y-auto pr-1 custom-scrollbar">
					{#each containers as container}
                        {@const isActionPending = actions.isPending && actions.variables?.id === container.id}
						<div class="flex flex-col p-2.5 rounded-lg bg-card border border-border shadow-sm text-xs transition-opacity relative overflow-hidden {container.state === 'running' ? '' : 'opacity-60'} {isActionPending ? 'pointer-events-none' : ''}">
                            {#if isActionPending}
                                <div class="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                    <LoaderCircle class="size-5 text-primary animate-spin" />
                                </div>
                            {/if}
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2 font-semibold">
									<div class="size-2.5 rounded-full {container.state === 'running' ? 'bg-primary shadow-[0_0_6px_rgba(var(--primary),0.5)]' : (container.state === 'paused' ? 'bg-amber-500' : 'bg-destructive')}"></div>
									<span class="truncate max-w-32 md:max-w-48 text-[13px]">{container.name}</span>
								</div>
								<div class="flex items-center gap-1">
									{#if isAdmin}
										{#if container.state === 'running'}
											<Button variant="ghost" size="icon" class="size-6 rounded-md hover:bg-destructive/20 text-destructive" onclick={() => handleAction(container, 'stop')} disabled={actions.isPending} title="Arresta">
												<Square class="size-3.5" />
											</Button>
											<Button variant="ghost" size="icon" class="size-6 rounded-md hover:bg-primary/20 text-primary" onclick={() => handleAction(container, 'restart')} disabled={actions.isPending} title="Riavvia">
												<RotateCw class="size-3.5" />
											</Button>
										{:else}
											<Button variant="ghost" size="icon" class="size-6 rounded-md hover:bg-primary/20 text-primary" onclick={() => handleAction(container, 'start')} disabled={actions.isPending} title="Avvia">
												<Play class="size-3.5" />
											</Button>
										{/if}
									{/if}
								</div>
							</div>
							<div class="text-[9px] text-muted-foreground/60 mt-1 truncate">
								{container.status}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
