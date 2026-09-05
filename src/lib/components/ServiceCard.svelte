<script lang="ts">
		import { appState } from '$lib/client/state.svelte';
	import QBittorrentWidget from './widgets/QBittorrentWidget.svelte';
	import TextInput from './ui/TextInput.svelte';
	import UrlInput from './ui/UrlInput.svelte';
	import SelectInput from './ui/SelectInput.svelte';
	import ToggleInput from './ui/ToggleInput.svelte';
	import { slide } from 'svelte/transition';
		let { service, liveStatus = null, categories = [], isExpanded = false, showDescription = true, iconStyle = 'rounded-xl', onExpandToggle } = $props<{
		service: {
			id: number;
			name: string;
			description: string | null;
			url: string;
			icon: string | null;
			pingEnabled: boolean;
			widgetType: string | null;
			categoryId?: number;
			iconDetails?: { hex: string, url: string, isCustomUrl?: boolean } | null;
		};
		liveStatus?: { isOnline: boolean; latencyMs?: number } | null;
		categories?: { id: number; name: string }[];
		isExpanded?: boolean;
		showDescription?: boolean;
		iconStyle?: string;
		onExpandToggle?: (expanded: boolean) => void;
	}>();
	let editName = $state('');
	let editUrl = $state('');
	let editIcon = $state('');
	let editDesc = $state('');
	let editCat = $state<number | null>(null);
	let editPing = $state(false);
	let editWidget = $state('');
	
	let showDeleteConfirm = $state(false);
	let isSaving = $state(false);

	function startEdit() {
		editName = service.name;
		editUrl = service.url;
		editIcon = service.icon || '';
		editDesc = service.description || '';
		editCat = service.categoryId || null;
		editPing = service.pingEnabled ?? true;
		editWidget = service.widgetType || '';
		if (onExpandToggle) onExpandToggle(true);
	}

	async function deleteService() {
		isSaving = true;
		const formData = new FormData();
		formData.append('id', service.id.toString());
		try {
			await fetch('/admin?/deleteService', { method: 'POST', body: formData });
			window.location.reload();
		} catch (err) {
			console.error(err);
		} finally {
			isSaving = false;
		}
	}

	async function saveEdit(e: Event) {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		form.classList.remove('show-errors');
		if (!form.checkValidity()) {
			void form.offsetWidth;
			form.classList.add('show-errors');
			return;
		}
		isSaving = true;
		try {
			const res = await fetch('/api/services/quick-edit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: service.id,
					name: editName,
					url: editUrl,
					icon: editIcon,
					description: editDesc,
					categoryId: editCat,
					pingEnabled: editPing,
					widgetType: editWidget
				})
			});
			window.location.reload();
		} catch (err) {
			console.error(err);
		} finally {
			isSaving = false;
		}
	}

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
	{#if appState.isEditMode && !isExpanded}
		<div class="absolute top-2 right-2 flex space-x-1.5 z-20">
			<button onclick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(); }} class="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-colors text-gray-600 dark:text-gray-300" title="Impostazioni Servizio">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
			</button>
			<div class="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-colors text-gray-600 dark:text-gray-300 cursor-move" title="Trascina per spostare">
				<svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg>
			</div>
		</div>
	{/if}

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<svelte:element
	this={appState.isEditMode ? 'form' : 'a'}
	href={appState.isEditMode ? undefined : service.url} 
	target={appState.isEditMode ? '_self' : '_blank'} 
	rel="noopener noreferrer"
	class="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-colors duration-200"
	style="background-color: {bgColor}; border-color: {borderColor};"
	onclick={(e: Event) => { if (appState.isEditMode && !isExpanded) e.preventDefault(); }}
	onsubmit={(e: Event) => { if (appState.isEditMode && isExpanded) saveEdit(e); }}
>
	<div class="flex items-start justify-between">
		<!-- Icon -->
		<div class="relative">
			<div 
				class="h-10 w-10 {iconStyle} flex items-center justify-center shadow-sm"
				style="background-color: {iconBgColor || '#4B5563'}"
			>
				{#if service.iconDetails}
					{#if service.iconDetails.isCustomUrl}
						<img src={service.iconDetails.url} alt={service.name} class="h-8 w-8 object-contain {iconStyle === 'rounded-full' ? 'rounded-full' : (iconStyle === 'rounded-xl' ? 'rounded' : 'rounded-none')}" />
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

			{#if appState.isEditMode && !isExpanded}
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<label class="absolute -bottom-1.5 -right-1.5 bg-blue-600 text-white p-1 rounded-full shadow cursor-pointer hover:bg-blue-700 z-20 border-2 border-white dark:border-gray-800" title="Cambia Icona (Upload)" onclick={(e) => e.stopPropagation()}>
					<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
					</svg>
					<input type="file" accept="image/png, image/svg+xml, image/jpeg" class="hidden" onchange={async (e) => {
						const target = e.target as HTMLInputElement;
						const file = target?.files?.[0];
						if (!file) return;
						const formData = new FormData(); formData.append('file', file);
						try {
							const res = await fetch('/api/icons', { method: 'POST', body: formData });
							const data = await res.json();
							if (data.url) {
								await fetch('/api/services/quick-edit', {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ id: service.id, name: service.name, url: service.url, categoryId: service.categoryId, icon: data.url })
								});
								window.location.reload();
							}
						} catch (err) { console.error(err); }
					}} />
				</label>
			{/if}
		</div>

		<!-- Status Indicator (top right) -->
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
			{#if isExpanded}
				<div transition:slide|local={{ duration: 250 }}>
					<TextInput label="NOME" bind:value={editName} required />
				</div>
			{:else}
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
								body: JSON.stringify({ id: service.id, name: target.value.trim(), url: service.url, categoryId: service.categoryId, icon: service.icon }) 
							});
							window.location.reload();
						} catch (err) { console.error(err); }
					}}
					title="Modifica Nome (Premi Invio per salvare)"
				/>
			{/if}
		{:else}
			<h3 class="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
				{service.name}
			</h3>
		{/if}

		{#if !isExpanded}
			<div transition:slide|local={{ duration: 250 }}>
				{#if showDescription}
				<p class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-10">
					{service.description || service.url}
				</p>
				{/if}
				
				{#if service.widgetType === 'qbittorrent'}
					<div class="mt-2" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
						<QBittorrentWidget />
					</div>
				{/if}
			</div>
		{/if}

		{#if isExpanded}
			<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
			<div role="presentation" transition:slide|local={{ duration: 250 }} class="flex flex-col gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700" onclick={(e) => e.stopPropagation()}>
				<UrlInput label="URL" bind:value={editUrl} required />
				
				<div class="flex gap-2 h-10.5 items-center">
					<div class="flex-1 min-w-0">
						<TextInput label="ICONA (ES. SIMPLE-ICONS o URL)" bind:value={editIcon} />
					</div>
					<label class="cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl px-4 flex items-center justify-center transition-colors shadow-sm shrink-0 h-full">
						<svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
						<input type="file" accept="image/png, image/svg+xml, image/jpeg" class="hidden" onchange={async (e) => {
							const target = e.target as HTMLInputElement;
							const file = target?.files?.[0];
							if (!file) return;
							const formData = new FormData(); formData.append('file', file);
							const btn = target.parentElement; btn?.classList.add('opacity-50');
							try {
								const res = await fetch('/api/icons', { method: 'POST', body: formData });
								const data = await res.json();
								if (data.url) editIcon = data.url;
							} catch (err) { console.error(err); } finally { btn?.classList.remove('opacity-50'); }
						}} />
					</label>
				</div>
				
				<TextInput label="DESCRIZIONE" bind:value={editDesc} />
				
				<SelectInput name="categoryId" label="CATEGORIA" bind:value={editCat} required options={categories.map((c: any) => ({value: c.id, label: c.name}))} />
				
				<div class="flex gap-4">
					<div class="flex-1">
						<SelectInput label="WIDGET" bind:value={editWidget} options={[{value: '', label: 'NESSUNO'}, {value: 'qbittorrent', label: 'qBittorrent'}]} />
					</div>
					<div class="flex-1 flex justify-end items-center">
						<ToggleInput label="PING" bind:checked={editPing} />
					</div>
				</div>
				
				<div class="flex justify-between space-x-2 mt-2 items-center">
					{#if showDeleteConfirm}
						<div class="text-sm font-bold text-red-600 flex items-center gap-2">
							SICURO?
							<button type="button" onclick={deleteService} class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">SÌ</button>
							<button type="button" onclick={() => showDeleteConfirm = false} class="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">NO</button>
						</div>
					{:else}
						<button type="button" onclick={() => showDeleteConfirm = true} class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors shrink-0" title="Elimina Servizio">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
						</button>
					{/if}
					<div class="flex space-x-2 shrink-0">
						<button type="button" onclick={() => { if (onExpandToggle) onExpandToggle(false); showDeleteConfirm = false; }} class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold tracking-wider hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors uppercase">
							ANNULLA
						</button>
						<button type="submit" disabled={isSaving} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/30 text-sm font-bold tracking-wider transition-all disabled:opacity-50 uppercase">
							{isSaving ? '...' : 'SALVA'}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</svelte:element>
</div>
