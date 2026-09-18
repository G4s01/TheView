<script lang="ts">
	import { useDockhand, useDockhandActions } from '$lib/queries/useDockhand';
	import { WavesHorizontal, CircleCheck, CircleX, Box, TriangleAlert, Play, Square, RotateCw, RefreshCw, CloudDownload, Search, CloudUpload, LoaderCircle } from '@lucide/svelte';
    import { Button } from "$lib/components/ui/button";
    import { appState } from '$lib/client/state.svelte';

	let { size = '1x1' } = $props<{ size?: string }>();

	let query = useDockhand();
    let actions = useDockhandActions();
	let containers = $derived.by(() => {
        const data = Array.isArray(query.data) ? query.data : [];
        return [...data].sort((a: any, b: any) => {
            if (a.updateAvailable && !b.updateAvailable) return -1;
            if (!a.updateAvailable && b.updateAvailable) return 1;
            return a.name.localeCompare(b.name);
        });
    });
    let isAdmin = $derived(appState.isAdmin);

    let runningContainers = $derived(containers.filter((c: any) => c.state === 'running'));
    let updatesAvailableCount = $derived(containers.filter((c: any) => c.updateAvailable).length);

    function handleAction(container: any, action: string) {
        actions.mutate({ id: container.id, action, payload: container });
    }

    function checkUpdates() {
        // use an empty id to trick typescript or just change the mutation type
        actions.mutate({ id: 'all', action: 'checkUpdates', payload: null });
    }
</script>

<div class="h-full w-full flex flex-col p-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden text-card-foreground">
	<div class="flex items-center justify-between pb-2 mb-2 border-b border-border/50 shrink-0">
		<div class="flex items-center gap-2">
			<WavesHorizontal class="size-4 text-primary" />
			<span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dockhand</span>
        </div>
        <div class="flex items-center gap-2">
            {#if isAdmin && query.isSuccess}
                <Button variant="ghost" size="icon" class="size-6 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors" onclick={checkUpdates} disabled={actions.isPending} title="Cerca aggiornamenti">
                    <div class="relative flex items-center justify-center {actions.isPending ? 'animate-pulse' : ''}">
                        <CloudUpload class="size-3.5" />
                        <div class="absolute -bottom-1 -right-1 bg-card rounded-full p-px">
                            <Search class="size-2 stroke-[3px]" />
                        </div>
                    </div>
                </Button>
            {/if}
		</div>
	</div>

	<div class="flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
		{#if query.isPending}
			<div class="flex flex-col gap-3 p-1">
				<div class="h-10 w-full bg-muted/50 rounded-lg animate-pulse"></div>
				<div class="h-10 w-full bg-muted/50 rounded-lg animate-pulse"></div>
			</div>
		{:else if query.isError}
			<div class="flex flex-col items-center justify-center h-full text-center text-destructive/80 gap-2 p-4">
				<TriangleAlert class="size-8 opacity-50" />
				<p class="text-xs font-medium truncate max-w-full">{query.error?.message || 'Errore Dockhand'}</p>
			</div>
		{:else if containers.length === 0}
            <div class="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-4">
				<Box class="size-8 opacity-50" />
				<p class="text-xs font-medium truncate max-w-full">Nessun container trovato</p>
			</div>
        {:else}
            <div class="flex flex-col gap-3">
                <div class="bg-muted/30 p-2 rounded-lg flex flex-col items-center justify-center border border-border/50 relative">
                    {#if updatesAvailableCount > 0}
                        <div class="absolute top-1.5 right-1.5 flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_6px_rgba(var(--primary),0.6)] animate-pulse">
                            {updatesAvailableCount} upd
                        </div>
                    {/if}
                    <span class="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">In esecuzione / Totali</span>
                    <span class="text-lg font-bold">
                        <span class={runningContainers.length > 0 ? "text-primary" : "text-muted-foreground"}>{runningContainers.length}</span>
                        <span class="text-muted-foreground text-sm">/{containers.length}</span>
                    </span>
                </div>

                <div class="flex flex-col gap-2 mt-1 pb-1">
					{#each containers as container}
                        {@const isActionPending = actions.isPending && actions.variables?.id === container.id}
                        <div class="flex flex-col shrink-0 p-2.5 rounded-lg bg-card border shadow-sm text-xs transition-opacity relative overflow-hidden {container.state === 'running' ? '' : 'opacity-60'} {container.updateAvailable ? 'border-primary shadow-[0_0_8px_var(--color-primary)]' : 'border-border'} {isActionPending ? 'pointer-events-none' : ''}">
                            {#if isActionPending}
                                <div class="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                    <LoaderCircle class="size-5 text-primary animate-spin" />
                                </div>
                            {/if}
							<div class="flex items-center justify-between mb-2 border-b border-border/40 pb-1.5">
								<div class="flex items-center gap-2 font-semibold">
									<div class="size-2.5 rounded-full {container.state === 'running' ? 'bg-primary shadow-[0_0_6px_rgba(var(--primary),0.5)]' : 'bg-destructive'}"></div>
									<span class="truncate max-w-32 text-[13px] relative">
                                        {container.name}
                                    </span>
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
                                        <div class="relative">
                                            {#if container.updateAvailable}
                                                <span class="absolute -top-0.5 -right-0.5 flex size-2">
                                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                    <span class="relative inline-flex rounded-full size-2 bg-primary"></span>
                                                </span>
                                            {/if}
                                            <Button variant="ghost" size="icon" class="size-6 rounded-md {container.updateAvailable ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'hover:bg-primary/20 text-primary'} ml-1" onclick={() => handleAction(container, 'update')} disabled={actions.isPending} title="Aggiorna / Redeploy">
                                                <RefreshCw class="size-3.5" />
                                            </Button>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                            <div class="text-[9px] text-muted-foreground/50 mt-1 truncate" title={container.image}>
                                {container.image}
                            </div>
                            <div class="text-[9px] text-muted-foreground/80 mt-1 truncate capitalize flex items-center justify-between">
                                <span>Status: {container.status}</span>
                                {#if container.updateAvailable}
                                    <span class="text-primary font-semibold flex items-center gap-1">
                                        <CloudDownload class="size-3" /> Aggiornamento!
                                    </span>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
		{/if}
	</div>
</div>
