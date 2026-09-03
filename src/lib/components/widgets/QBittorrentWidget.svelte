<script lang="ts">
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
				error = errBody.error || 'Errore di connessione API';
			}
		} catch (e: any) {
			error = 'Server irraggiungibile';
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

<div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
	{#if error}
		<div class="text-xs text-red-500 truncate" title={error}>{error}</div>
	{:else if data}
		<div class="flex items-center justify-between text-xs font-medium">
			<div class="flex items-center text-emerald-600 dark:text-emerald-400">
				<!-- Down arrow -->
				<svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
				</svg>
				{formatBytes(data.dl_info_speed)}
			</div>
			<div class="flex items-center text-blue-600 dark:text-blue-400">
				<!-- Up arrow -->
				<svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
				</svg>
				{formatBytes(data.up_info_speed)}
			</div>
		</div>
	{:else}
		<div class="text-xs text-gray-400 animate-pulse">Caricamento widget...</div>
	{/if}
</div>

