<script lang="ts">
	import { useDuplicati, useDuplicatiActions } from '$lib/queries/useDuplicati';
	import { HardDrive, AlertCircle, Play, Square, Pause, Calendar, Clock, Database, Layers, ArrowRightLeft } from '@lucide/svelte';
	import { Button } from "$lib/components/ui/button";
	import { Progress } from "$lib/components/ui/progress";
	
	let { service, size = 'gs-2x2', hideHeader = false } = $props<{ service: any; size?: string, hideHeader?: boolean }>();
	let nodeW = $derived(parseInt(size.split('x')[0].replace('gs-', '')) || 2);
	let nodeH = $derived(parseInt(size.split('x')[1]) || 2);
	let rectW = $state(0);
	let rectH = $state(0);
	let isWide = $derived(rectW && rectH ? rectW > rectH * 1.1 : nodeW > nodeH);
	
	let query = useDuplicati(() => service.id);
	let actions = useDuplicatiActions();

	let serverState = $derived(query.data?.serverState || {});
	let backups = $derived(query.data?.backups || []);
	let progress = $derived(query.data?.progressState || null);
	
	let isServiceActive = $derived(serverState.ProgramState === 'Running');
	let isPaused = $derived(serverState.ProgramState === 'Paused');
	let isError = $derived(serverState.HasWarning || serverState.HasError);
    let activeTask = $derived(serverState.ActiveTask);
    let isBackupRunning = $derived(!!activeTask && !!activeTask.Item1);

	function parseDuplicatiDate(isoStr: string | undefined) {
		if (!isoStr || isoStr.indexOf('0001') !== -1) return null;
		let normalized = isoStr;
		if (isoStr.length === 16 && isoStr.endsWith('Z')) {
			normalized = `${isoStr.slice(0,4)}-${isoStr.slice(4,6)}-${isoStr.slice(6,11)}:${isoStr.slice(11,13)}:${isoStr.slice(13)}`;
		}
		const d = new Date(normalized);
		if (isNaN(d.getTime())) return null;
		return d;
	}

	function timeAgo(isoStr: string | undefined) {
		const d = parseDuplicatiDate(isoStr);
		if (!d) return 'Mai';
		
		const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
		const rtf = new Intl.RelativeTimeFormat('it', { numeric: 'auto' });
		const absSeconds = Math.abs(seconds);
		
		if (absSeconds < 60) return rtf.format(seconds > 0 ? -absSeconds : absSeconds, 'second');
		if (absSeconds < 3600) return rtf.format(seconds > 0 ? -Math.round(absSeconds/60) : Math.round(absSeconds/60), 'minute');
		if (absSeconds < 86400) return rtf.format(seconds > 0 ? -Math.round(absSeconds/3600) : Math.round(absSeconds/3600), 'hour');
		if (absSeconds < 2592000) return rtf.format(seconds > 0 ? -Math.round(absSeconds/86400) : Math.round(absSeconds/86400), 'day');
		if (absSeconds < 31536000) return rtf.format(seconds > 0 ? -Math.round(absSeconds/2592000) : Math.round(absSeconds/2592000), 'month');
		
		return rtf.format(seconds > 0 ? -Math.round(absSeconds/31536000) : Math.round(absSeconds/31536000), 'year');
	}

	function formatDuration(timespan: string | undefined) {
		if (!timespan) return '-';
		const parts = timespan.split(':');
		if (parts.length >= 3) {
			const h = parseInt(parts[0]);
			const m = parseInt(parts[1]);
			const s = parseInt(parts[2].split('.')[0]);
			if (h > 0) return `${h}h ${m}m`;
			if (m > 0) return `${m}m ${s}s`;
			return `${s}s`;
		}
		return timespan;
	}

    function formatBytes(bytes: string | number | undefined) {
        if (!bytes) return '0 B';
        const numBytes = typeof bytes === 'string' ? parseInt(bytes) : bytes;
        if (isNaN(numBytes)) return '0 B';
        const k = 1000, dm = 2, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(numBytes) / Math.log(k));
        return parseFloat((numBytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function getPercentage() {
        if (!progress) return 0;
        let p = progress.OverallProgress * 100;
        if ((!p || p === 0) && progress.TotalFileSize > 0) {
            p = (progress.ProcessedFileSize / progress.TotalFileSize) * 100;
        } else if ((!p || p === 0) && progress.TotalFileCount > 0) {
            p = (progress.ProcessedFileCount / progress.TotalFileCount) * 100;
        }
        return p || 0;
    }
</script>

<div bind:clientWidth={rectW} bind:clientHeight={rectH} class="h-full w-full flex flex-col p-2 overflow-hidden text-card-foreground @container">
	{#if !hideHeader}
	<div class="flex items-center justify-between pb-2 mb-2 border-b border-border/50 shrink-0">
		<div class="flex items-center gap-2">
			<HardDrive class="size-4 text-primary" />
			<span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duplicati</span>
		</div>
		<div class="flex items-center gap-2">
            {#if query.isSuccess && backups.length > 0}
                <span class="text-[10px] bg-muted px-1.5 py-0.5 rounded-md font-medium text-muted-foreground">{backups.length} Job</span>
            {/if}
        </div>
		</div>
	{/if}

	<div class="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar gap-2 pr-1">
		{#if query.isPending && !query.data}
			<div class="flex flex-col gap-3 p-1 animate-pulse">
				<div class="h-8 w-full bg-muted/50 rounded-lg"></div>
				<div class="h-12 w-full bg-muted/50 rounded-lg"></div>
			</div>
		{:else if query.isError && !query.data}
			<div class="flex flex-col items-center justify-center h-full text-center text-destructive/80 gap-2 p-4">
				<AlertCircle class="size-8 opacity-50" />
				<p class="text-xs font-medium">{query.error?.message || 'Errore di connessione'}</p>
			</div>
		{:else}
            <!-- Status Area -->
            <div class="flex flex-col gap-2 p-2 bg-muted/30 rounded-xl border border-border/50 shrink-0 mb-2">
                <div class="flex items-center justify-between">
                    <span class="font-semibold text-[11px] uppercase {isBackupRunning ? 'text-primary' : isPaused ? 'text-muted-foreground' : isError ? 'text-destructive' : 'text-primary'}">
                        {isBackupRunning ? 'IN ESECUZIONE' : isPaused ? 'IN PAUSA' : isError ? 'AVVISI/ERRORI' : 'TUTTO OK'}
                    </span>
                    <div class="flex items-center gap-1">
                        {#if !isPaused}
                            <Button variant="ghost" size="icon" class="size-6 rounded text-muted-foreground hover:bg-muted hover:text-foreground" onclick={() => actions.mutate({ action: 'pause' })} disabled={actions.isPending} title="Metti in pausa servizio">
                                <Pause class="size-3.5 fill-current" />
                            </Button>
                        {:else}
                            <Button variant="ghost" size="icon" class="size-6 rounded text-primary hover:bg-primary/20 hover:text-primary" onclick={() => actions.mutate({ action: 'resume' })} disabled={actions.isPending} title="Riprendi servizio">
                                <Play class="size-3.5 fill-current" />
                            </Button>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Backups List -->
            {#if backups.length > 0}
                <div class="grid {isWide && (rectW ? rectW >= 450 : nodeW >= 4) ? 'grid-cols-2' : 'grid-cols-1'} gap-2 pb-1">
                    {#each backups as b}
                        {@const isActive = isBackupRunning && activeTask?.Item2 === b.Backup.ID}
                        <div class="flex flex-col p-3 rounded-xl bg-card border {isActive ? 'border-primary/50 bg-primary/5' : 'border-border shadow-sm'} text-muted-foreground transition-colors relative overflow-hidden">
                            <!-- Header -->
                            <div class="flex items-center justify-between gap-2 border-b border-border/50 pb-2 mb-2 z-10 relative">
                                <span class="text-xs font-bold truncate flex-1 {isActive ? 'text-primary' : 'text-foreground'}" title={b.Backup.Name}>{b.Backup.Name}</span>
                                <div class="flex items-center gap-1 shrink-0">
                                    {#if isActive}
                                        <Button variant="ghost" size="icon" class="size-7 text-destructive hover:bg-destructive/20 hover:text-destructive rounded-lg" onclick={() => actions.mutate({ action: 'stop', taskId: activeTask.Item1 })} disabled={actions.isPending} title="Ferma backup">
                                            <Square class="size-4 fill-current" />
                                        </Button>
                                    {:else if !isBackupRunning && !isPaused}
                                        <Button variant="ghost" size="icon" class="size-7 text-primary hover:bg-primary/20 hover:text-primary rounded-lg" onclick={() => actions.mutate({ action: 'run', id: b.Backup.ID })} disabled={actions.isPending} title="Avvia backup">
                                            <Play class="size-4 fill-current" />
                                        </Button>
                                    {/if}
                                </div>
                            </div>
                            
                            <!-- Progress Bar (Only when active) -->
                            {#if isActive && progress}
                                <div class="flex flex-col gap-1.5 mb-3 px-1">
                                    <div class="flex justify-between items-center text-[10px] text-muted-foreground">
                                        <span class="truncate max-w-[75%] font-medium text-foreground">{progress.Phase || 'Elaborazione...'}</span>
                                        <span class="font-bold text-primary">{getPercentage().toFixed(1)}%</span>
                                    </div>
                                    <Progress value={getPercentage()} class="h-2" />
                                    {#if progress.CurrentFilename}
                                        <span class="text-[9px] text-muted-foreground/50 truncate" title={progress.CurrentFilename}>{progress.CurrentFilename}</span>
                                    {/if}
                                </div>
                            {/if}

                            <!-- Styled Table Grid -->
                            <div class="grid grid-cols-2 gap-2 text-[10px] bg-muted/20 p-2 rounded-lg border border-border/30 text-center">
                                <!-- Row 1: Ultimo / Prossimo -->
                                <div class="flex flex-col items-center justify-center p-1 rounded hover:bg-muted/30 transition-colors">
                                    <span class="text-[9px] uppercase tracking-wider opacity-60 mb-0.5">Ultimo</span>
                                    <span class="font-bold text-foreground">{b.Backup.Metadata?.LastBackupDate || b.Backup.Metadata?.LastBackupStarted ? timeAgo(b.Backup.Metadata.LastBackupDate || b.Backup.Metadata.LastBackupStarted) : 'Mai'}</span>
                                </div>
                                <div class="flex flex-col items-center justify-center p-1 rounded hover:bg-muted/30 transition-colors">
                                    <span class="text-[9px] uppercase tracking-wider opacity-60 mb-0.5">Prossimo</span>
                                    <span class="font-bold text-foreground">{b.Schedule?.Time ? timeAgo(b.Schedule.Time) : '-'}</span>
                                </div>
                                
                                <div class="col-span-2 h-px bg-border/40"></div>

                                <!-- Row 2: Durata / Versioni -->
                                <div class="flex flex-col items-center justify-center p-1 rounded hover:bg-muted/30 transition-colors">
                                    <span class="text-[9px] uppercase tracking-wider opacity-60 mb-0.5">Durata</span>
                                    <span class="font-bold text-foreground">{formatDuration(b.Backup.Metadata?.LastBackupDuration)}</span>
                                </div>
                                <div class="flex flex-col items-center justify-center p-1 rounded hover:bg-muted/30 transition-colors">
                                    <span class="text-[9px] uppercase tracking-wider opacity-60 mb-0.5">Versioni</span>
                                    <span class="font-bold text-foreground">{b.Backup.Metadata?.BackupListCount || 0}</span>
                                </div>

                                <div class="col-span-2 h-px bg-border/40"></div>

                                <!-- Row 3: Sorgente / Destinazione -->
                                <div class="flex flex-col items-center justify-center p-1 rounded hover:bg-muted/30 transition-colors">
                                    <span class="text-[9px] uppercase tracking-wider opacity-60 mb-0.5">Sorgente</span>
                                    <span class="font-bold text-foreground">{formatBytes(b.Backup.Metadata?.SourceFilesSize)}</span>
                                </div>
                                <div class="flex flex-col items-center justify-center p-1 rounded hover:bg-muted/30 transition-colors">
                                    <span class="text-[9px] uppercase tracking-wider opacity-60 mb-0.5">Destinazione</span>
                                    <span class="font-bold text-foreground">{formatBytes(b.Backup.Metadata?.TargetFilesSize)}</span>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
		{/if}
	</div>
</div>
