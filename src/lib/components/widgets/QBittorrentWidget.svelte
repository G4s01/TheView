<script lang="ts">
	import { ArrowDown, ArrowUp } from "@lucide/svelte";
	import { onMount, onDestroy } from 'svelte';
	
	let data = $state<{ dl_info_speed: number, up_info_speed: number } | null>(null);
	let error = $state<string | null>(null);
	let interval: ReturnType<typeof setInterval>;
	
	async function fetchWidgetData() {
		try {
			const res = await fetch('/api/widgets/qbittorrent');
			if (res.ok) {
				data = await res.json();
				error = null;
			} else {
				const errBody = await res.json().catch(() => ({}));
				error = errBody.error || 'ERRORE API';
			}
		} catch (e: any) {
			error = 'IRRAGGIUNGIBILE';
		}
	}

	onMount(() => {
		fetchWidgetData();
		interval = setInterval(fetchWidgetData, 3000); // Poll ogni 3 secondi per velocità in real-time
	});
	
	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
	
	function formatBytes(bytes: number) {
		if (bytes === 0) return '0 B/s';
		const k = 1024;
		const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}
</script>

<div class="mt-3 pt-3 border-t border-border">
	{#if error}
		<div class="text-xs text-destructive truncate" title={error}>{error}</div>
	{:else if data}
		<div class="flex items-center justify-between text-xs font-medium">
			<div class="flex items-center text-foreground">
				<!-- Down arrow -->
				<ArrowDown class="w-3 h-3 mr-1" strokeWidth={2.5} />
				{formatBytes(data.dl_info_speed)}
			</div>
			<div class="flex items-center text-foreground">
				<!-- Up arrow -->
				<ArrowUp class="w-3 h-3 mr-1" strokeWidth={2.5} />
				{formatBytes(data.up_info_speed)}
			</div>
		</div>
	{:else}
		<div class="text-xs text-muted-foreground animate-pulse">Caricamento widget...</div>
	{/if}
</div>

