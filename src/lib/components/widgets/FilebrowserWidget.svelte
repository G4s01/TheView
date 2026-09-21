<script lang="ts">
	import { useFilebrowser } from '$lib/queries/useFilebrowser';
	import { HardDrive, AlertCircle } from '@lucide/svelte';

	let { size = '1x1' } = $props<{ size: string }>();

	const filebrowser = useFilebrowser();

	function formatBytes(bytes: number, decimals = 2) {
		if (!bytes || bytes === 0) return '0 B';
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

	let total = $derived(filebrowser.data?.total || 0);
	let used = $derived(filebrowser.data?.used || 0);
	let percentage = $derived(total > 0 ? (used / total) * 100 : 0);
	let free = $derived(total - used);
	
	let strokeDasharray = $derived(2 * Math.PI * 36);
	let strokeDashoffset = $derived(strokeDasharray - (percentage / 100) * strokeDasharray);
	let nodeW = $derived(parseInt(size.split('x')[0].replace('gs-', '')) || 1);
	let nodeH = $derived(parseInt(size.split('x')[1]) || 1);
	let rectW = $state(0);
	let rectH = $state(0);
	let isWide = $derived(rectW && rectH ? rectW > rectH * 1.1 : nodeW > nodeH);
</script>

<div bind:clientWidth={rectW} bind:clientHeight={rectH} class="w-full h-full flex {isWide ? 'flex-row' : 'flex-col'} justify-center items-center p-2 min-h-0 text-foreground gap-4">
	{#if filebrowser.isPending}
		<div class="flex flex-col items-center justify-center gap-3 w-full h-full">
			<div class="size-16 sm:size-20 rounded-full border-4 border-muted flex items-center justify-center animate-pulse shrink-0">
				<HardDrive class="size-6 text-muted-foreground" />
			</div>
			<div class="h-3 w-16 bg-muted rounded-full animate-pulse"></div>
		</div>
	{:else if filebrowser.isError}
		<div class="flex flex-col items-center justify-center gap-2 text-destructive text-center w-full h-full">
			<AlertCircle class="size-8 sm:size-10 mb-1" strokeWidth={1.5} />
			<span class="text-xs font-medium max-w-full truncate px-2" title={filebrowser.error?.message}>
				{filebrowser.error?.message || 'Errore di connessione'}
			</span>
		</div>
	{:else}
		<div class="relative flex items-center justify-center shrink-0">
			<!-- Background Circle -->
			<svg class="size-20 sm:size-28 -rotate-90 transform" viewBox="0 0 80 80">
				<circle
					cx="40"
					cy="40"
					r="36"
					fill="none"
					class="stroke-muted"
					stroke-width="8"
				/>
				<!-- Progress Circle -->
				<circle
					cx="40"
					cy="40"
					r="36"
					fill="none"
					class="stroke-primary transition-all duration-1000 ease-in-out"
					stroke-width="8"
					stroke-linecap="round"
					stroke-dasharray={strokeDasharray}
					stroke-dashoffset={strokeDashoffset}
				/>
			</svg>
			<div class="absolute inset-0 flex flex-col items-center justify-center">
				<span class="text-base sm:text-xl font-bold">{percentage.toFixed(1)}%</span>
			</div>
		</div>
		<div class="flex flex-col {isWide ? 'items-start text-left' : 'items-center text-center'} gap-0.5 mt-1 sm:mt-2 w-full min-w-0">
			<span class="text-xs sm:text-sm font-medium text-muted-foreground truncate w-full px-2 {isWide ? 'px-0' : ''}">
				{formatBytes(used)} / {formatBytes(total)}
			</span>
			<span class="text-[10px] sm:text-xs text-muted-foreground/70 uppercase tracking-widest truncate w-full {isWide ? 'px-0' : ''}">
				{formatBytes(free)} Liberi
			</span>
		</div>
	{/if}
</div>
