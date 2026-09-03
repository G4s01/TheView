<script lang="ts">
	import QBittorrentWidget from './widgets/QBittorrentWidget.svelte';

	let { service, liveStatus = null } = $props<{
		service: {
			id: number;
			name: string;
			description: string | null;
			url: string;
			icon: string | null;
			pingEnabled: boolean;
			widgetType: string | null;
			iconDetails?: { hex: string, url: string } | null;
		};
		liveStatus?: { isOnline: boolean; latencyMs?: number } | null;
	}>();

	// Calculate current visual status
	let status = $derived(
		!service.pingEnabled ? 'disabled' 
		: liveStatus === null ? 'checking' 
		: liveStatus.isOnline ? 'online' 
		: 'offline'
	);
	
	let tooltipText = $derived(
		status === 'online' ? `Online (${liveStatus?.latencyMs}ms)` 
		: status === 'offline' ? 'Offline'
		: 'Checking...'
	);

	function hexToRgba(hex: string | undefined, alpha: number) {
		if (!hex) return '';
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	let bgColor = $derived(service.iconDetails ? hexToRgba(service.iconDetails.hex, 0.1) : '');
	let borderColor = $derived(service.iconDetails ? hexToRgba(service.iconDetails.hex, 0.3) : '');
	let iconBgColor = $derived(service.iconDetails ? service.iconDetails.hex : '');
</script>

<a 
	href={service.url} 
	target="_blank" 
	rel="noopener noreferrer"
	class="group flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-200"
	style="background-color: {bgColor}; border-color: {borderColor};"
>
	<div class="flex items-start justify-between">
		<!-- Icon -->
		<div 
			class="h-10 w-10 rounded-lg flex items-center justify-center shadow-sm"
			style="background-color: {iconBgColor || '#4B5563'}"
		>
			{#if service.iconDetails}
				<img src={service.iconDetails.url} alt={service.name} class="h-6 w-6" style="filter: brightness(0) invert(1);" />
			{:else if service.icon}
				<span class="text-lg font-bold uppercase text-white">{service.icon.charAt(0)}</span>
			{:else}
				<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
			{/if}
		</div>

		<!-- Status Indicator -->
		{#if service.pingEnabled}
			<div class="flex items-center space-x-1.5" title={tooltipText}>
				<span class="relative flex h-2.5 w-2.5">
					{#if status === 'checking'}
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
					{:else if status === 'online'}
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
					{:else}
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
					{/if}
				</span>
			</div>
		{/if}
	</div>

	<div class="mt-4 flex-1">
		<h3 class="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
			{service.name}
		</h3>
		<p class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[40px]">
			{service.description || service.url}
		</p>
	</div>

	{#if service.widgetType === 'qbittorrent'}
		<!-- Previene il click sul link della card quando si interagisce (se necessario in futuro) col widget -->
		<div role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
			<QBittorrentWidget />
		</div>
	{/if}
</a>

