<script lang="ts">
	import QBittorrentWidget from './widgets/QBittorrentWidget.svelte';
	import { appState } from '$lib/client/state.svelte';

	let { service, liveStatus = null, onEdit } = $props<{
		service: {
			id: number;
			name: string;
			description: string | null;
			url: string;
			icon: string | null;
			pingEnabled: boolean;
			widgetType: string | null;
			iconDetails?: { hex: string, url: string, isCustomUrl?: boolean } | null;
		};
		liveStatus?: { isOnline: boolean; latencyMs?: number } | null;
		onEdit?: () => void;
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

<div class="relative h-full group">
	{#if appState.isEditMode}
		<div class="absolute top-2 right-2 flex space-x-1.5 z-20">
			<button onclick={(e) => { e.preventDefault(); e.stopPropagation(); if (onEdit) onEdit(); }} class="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-colors text-gray-600 dark:text-gray-300" title="Impostazioni Servizio">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
			</button>
			<div class="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-colors text-gray-600 dark:text-gray-300 cursor-move" title="Trascina per spostare">
				<svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
			</div>
		</div>
	{/if}

<a 
	href={appState.isEditMode ? '#' : service.url} 
	target={appState.isEditMode ? '_self' : '_blank'} 
	rel="noopener noreferrer"
	class="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-200"
	style="background-color: {bgColor}; border-color: {borderColor};"
	onclick={(e) => { if (appState.isEditMode) e.preventDefault(); }}
>
	<div class="flex items-start justify-between">
		<!-- Icon -->
		<div class="relative">
			<div 
				class="h-10 w-10 rounded-lg flex items-center justify-center shadow-sm"
				style="background-color: {iconBgColor || '#4B5563'}"
			>
				{#if service.iconDetails}
					{#if service.iconDetails.isCustomUrl}
						<img src={service.iconDetails.url} alt={service.name} class="h-8 w-8 object-contain rounded" />
					{:else}
						<img src={service.iconDetails.url} alt={service.name} class="h-6 w-6" style="filter: brightness(0) invert(1);" />
					{/if}
				{:else if service.icon}
					<span class="text-lg font-bold uppercase text-white">{service.icon.charAt(0)}</span>
				{:else}
					<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				{/if}
			</div>

			{#if appState.isEditMode}
				<label class="absolute -bottom-1.5 -right-1.5 bg-blue-600 text-white p-1 rounded-full shadow cursor-pointer hover:bg-blue-700 z-20 border-2 border-white dark:border-gray-800" title="Cambia Icona (Upload)" onclick={(e) => e.stopPropagation()}>
					<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
					</svg>
					<input type="file" accept="image/png, image/svg+xml, image/jpeg" class="hidden" onchange={async (e) => {
						const target = e.target as HTMLInputElement;
						const file = target?.files?.[0];
						if (!file) return;
						
						const formData = new FormData();
						formData.append('file', file);
						
						try {
							const res = await fetch('/api/icons', { method: 'POST', body: formData });
							const data = await res.json();
							if (data.url) {
								await fetch('/api/services/quick-edit', {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ id: service.id, name: service.name, url: service.url, icon: data.url })
								});
								window.location.reload();
							}
						} catch (err) {
							console.error(err);
						}
					}} />
				</label>
			{/if}
		</div>

		<!-- Status Indicator -->
		{#if service.pingEnabled && !appState.isEditMode}
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
		{#if appState.isEditMode}
			<input 
				type="text" 
				value={service.name} 
				class="text-base font-semibold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 w-full px-1 py-0.5"
				onclick={(e) => { e.preventDefault(); e.stopPropagation(); }}
				onchange={async (e) => {
					const target = e.target as HTMLInputElement;
					if (target.value === service.name || !target.value.trim()) return;
					try {
						await fetch('/api/services/quick-edit', { 
							method: 'POST', 
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ id: service.id, name: target.value.trim(), url: service.url, icon: service.icon }) 
						});
						window.location.reload();
					} catch (err) { console.error(err); }
				}}
				title="Modifica Nome (Premi Invio per salvare)"
			/>
		{:else}
			<h3 class="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
				{service.name}
			</h3>
		{/if}
		
		<p class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[40px]">
			{service.description || service.url}
		</p>
	</div>

	{#if service.widgetType === 'qbittorrent'}
		<div role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
			<QBittorrentWidget />
		</div>
	{/if}
</a>
</div>
