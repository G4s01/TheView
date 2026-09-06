<script lang="ts">
	import { appState } from '$lib/client/state.svelte';
	import { ArrowUpCircle, Box, GripHorizontal, Settings, Upload, Trash2, Eye } from "@lucide/svelte";
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
			dockerImage?: string | null;
			iconDetails?: { type: 'custom' | 'brand' | 'lucide', value: string } | null;
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
	let editDockerImage = $state('');
	
	let showDeleteConfirm = $state(false);
	let isSaving = $state(false);

	let dockerVersionInfo = $state<{ version: string; updateAvailable: boolean; updateUrl?: string } | null>(null);

	import { onMount } from 'svelte';
	onMount(() => {
		if (service.dockerImage) {
			fetch(`/api/docker/version?image=${encodeURIComponent(service.dockerImage)}`)
				.then(res => res.json())
				.then(data => {
					if (!data.error) {
						dockerVersionInfo = { version: data.version, updateAvailable: data.updateAvailable, updateUrl: data.updateUrl };
					}
				})
				.catch(e => console.error(e));
		}
	});

	function startEdit() {
		editName = service.name;
		editUrl = service.url;
		editIcon = service.icon || '';
		editDesc = service.description || '';
		editCat = service.categoryId || null;
		editPing = service.pingEnabled ?? true;
		editWidget = service.widgetType || '';
		editDockerImage = service.dockerImage || '';
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
					widgetType: editWidget,
					dockerImage: editDockerImage
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

	let bgColor = $derived('');
	let borderColor = $derived('');
	let iconBgColor = $derived('');
</script>

<div class="relative h-full group">
	{#if appState.isEditMode && !isExpanded}
		<div class="absolute top-2 right-2 flex space-x-1.5 z-20">
			<button onclick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(); }} class="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-colors text-gray-600 dark:text-gray-300" title="Impostazioni Servizio">
				<Eye class="w-4 h-4" strokeWidth={1.5} />
			</button>
			<div class="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-colors text-gray-600 dark:text-gray-300 cursor-move" title="Trascina per spostare">
				<GripHorizontal class="w-4 h-4 pointer-events-none" strokeWidth={1.5} />
			</div>
		</div>
	{/if}

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<svelte:element
	this={appState.isEditMode ? 'form' : 'a'}
	href={appState.isEditMode ? undefined : service.url} 
	target={appState.isEditMode ? '_self' : '_blank'} 
	rel="noopener noreferrer"
	class="flex flex-col relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-colors duration-200"
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
					{#if service.iconDetails.type === 'custom' || service.iconDetails.type === 'brand'}
						<img src={service.iconDetails.value} alt={service.name} class="h-6 w-6 object-contain {iconStyle === 'rounded-full' ? 'rounded-full' : (iconStyle === 'rounded-xl' ? 'rounded' : 'rounded-none')}" />
					{:else}
						<Box class="h-6 w-6 text-white" strokeWidth={1.5} />
					{/if}
				{:else}
					<Box class="h-6 w-6 text-white" strokeWidth={1.5} />
				{/if}
			</div>

			{#if appState.isEditMode && !isExpanded}
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<label class="absolute -bottom-1.5 -right-1.5 bg-blue-600 text-white p-1 rounded-full shadow cursor-pointer hover:bg-blue-700 z-20 border-2 border-white dark:border-gray-800" title="Cambia Icona (Upload)" onclick={(e) => e.stopPropagation()}>
					<Upload class="w-3 h-3" strokeWidth={1.5} />
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
									body: JSON.stringify({ id: service.id, name: service.name, url: service.url, categoryId: service.categoryId, icon: data.url, dockerImage: service.dockerImage })
								});
								window.location.reload();
							}
						} catch (err) { console.error(err); }
					}} />
				</label>
			{/if}

			{#if dockerVersionInfo && dockerVersionInfo.updateAvailable && !appState.isEditMode}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div 
					class="absolute -top-1.5 -right-1.5 flex items-center justify-center z-20 cursor-pointer text-red-500 hover:text-red-600 transition-colors bg-white dark:bg-gray-800 rounded-full shadow-sm" 
					title="Aggiornamento disponibile online! Clicca per vedere la release."
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						if (dockerVersionInfo?.updateUrl) {
							window.open(dockerVersionInfo.updateUrl, '_blank');
						}
					}}
				>
					<span class="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-40 animate-ping"></span>
					<ArrowUpCircle class="w-4 h-4 animate-pulse relative" />
				</div>
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

	<div class="mt-4 flex-1 pb-4">
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
								body: JSON.stringify({ id: service.id, name: target.value.trim(), url: service.url, categoryId: service.categoryId, icon: service.icon, dockerImage: service.dockerImage }) 
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
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<UrlInput label="URL" bind:value={editUrl} required />
					<TextInput label="Immagine Docker (es. linuxserver/radarr:latest)" bind:value={editDockerImage} placeholder="es. ghcr.io/user/repo:latest" />
				</div>
				
				<div class="flex gap-2 h-10.5 items-center">
					<div class="flex-1 min-w-0">
						<TextInput label="ICONA (ES. SIMPLE-ICONS o URL)" bind:value={editIcon} />
					</div>
					<label class="cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl px-4 flex items-center justify-center transition-colors shadow-sm shrink-0 h-full">
						<Upload class="h-5 w-5 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
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
							<Trash2 class="w-5 h-5" strokeWidth={1.5} />
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
