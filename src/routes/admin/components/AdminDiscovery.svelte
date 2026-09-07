<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import ToggleInput from '$lib/components/ui/ToggleInput.svelte';
	import UrlInput from '$lib/components/ui/UrlInput.svelte';

	import { slide } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { Pencil, Plus, Box, LoaderCircle, TriangleAlert, Eye, X, Search, Upload, Check, Save, Trash, EyeOff, Link } from "@lucide/svelte";
	import ServiceForm from '$lib/components/ServiceForm.svelte';
	import SettingsNPMWidget from './SettingsNPMWidget.svelte';
	
	let { localCategories = $bindable() } = $props();

	let discoveredServices = $state<any[]>([]);
	let npmError = $state<string | null>(null);
	let isDiscovering = $state(false);
	let expandedId = $state<string | null>(null);
	let isNpmEditing = $state(true);
	let showNpmPassword = $state(false);
	let showNpmDisconnectModal = $state(false);

	let npmUrlCombined = $state('');
	let npmEmail = $state('');
	let npmPassword = $state('');

	async function confirmNpmDisconnect() {
		showNpmDisconnectModal = false;
		npmUrlCombined = ''; npmEmail = ''; npmPassword = '';
		isNpmEditing = true;
		showNpmPassword = false;
		await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ npmUrl: '', npmEmail: '', npmPassword: '' }) });
	}

	onMount(async () => {
		const res = await fetch('/api/settings');
		const data = await res.json();
		if (data.npmUrl) {
			npmUrlCombined = data.npmUrl;
		}
		npmEmail = data.npmEmail || '';
		npmPassword = data.npmPassword || '';
		if (npmUrlCombined && npmEmail && npmPassword) isNpmEditing = false;
		
		if (discoveredServices.length === 0 && !isDiscovering) {
			fetchDiscovery();
		}
	});

	async function fetchDiscovery() {
		isDiscovering = true;
		try {
			// Save settings first
			await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ npmUrl: npmUrlCombined, npmEmail, npmPassword })
			});

			const res = await fetch('/api/discovery');
			if (res.ok) {
				const data = await res.json();
				discoveredServices = data.services;
				npmError = data.npmError;
			}
		} catch (e) {
			console.error(e);
		} finally {
			isDiscovering = false;
		}
	}
</script>

<div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
	<SettingsNPMWidget
		bind:npmUrlCombined
		bind:npmEmail
		bind:npmPassword
		bind:isNpmEditing
		bind:showNpmPassword
		bind:showNpmDisconnectModal
	/>

	<!-- Results Block -->
	<div class="bg-card text-card-foreground rounded-2xl shadow-lg border border-border">
		<!-- HEADER: RISULTATI + DISCOVERY BUTTON -->
		<div class="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div class="flex items-center space-x-3">
				<div class="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
					<Search class="w-6 h-6" strokeWidth={1.5} />
				</div>
				<h3 class="text-xl font-bold uppercase tracking-wider text-foreground">RISULTATI</h3>
			</div>
			<div class="flex items-center gap-3">
				<button 
					onclick={fetchDiscovery} 
					disabled={isDiscovering}
					class="inline-flex items-center justify-center w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
				>
					{#if isDiscovering}
						<LoaderCircle class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" strokeWidth={2} />
						STO CERCANDO...
					{:else}
						<Search class="-ml-1 mr-2 h-4 w-4" strokeWidth={1.5} />
						DISCOVERY
					{/if}
				</button>
			</div>
		</div>

		<!-- List of Discovered Services -->
<!-- List of Discovered Services -->
	<div class="p-0">
		{#if npmError}
		<div class="p-4 rounded-md bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
			<strong>ERRORE NPM:</strong> {npmError}
			<p class="text-sm mt-1">ASSICURATI L'INDIRIZZO SIA RAGGIUNGIBILE!</p>
		</div>
	{/if}

	<div class="bg-card text-card-foreground shadow-sm border border-border rounded-2xl">
		<ul class="divide-y divide-border">
			{#if isDiscovering}
				<li class="px-6 py-12 text-center text-sm text-muted-foreground">STO CERCANDO...</li>
			{:else if discoveredServices.length === 0}
				<li class="px-6 py-12 text-center text-sm text-muted-foreground">
					<Search class="mx-auto h-12 w-12 text-muted-foreground mb-3" strokeWidth={1.5} />
					NESSUN NUOVO SERVIZIO TROVATO.
				</li>
			{/if}

			{#each discoveredServices as ds, i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<li class="px-6 py-5 hover:bg-muted/50 transition-colors flex flex-col gap-4 cursor-pointer" onclick={() => { expandedId = expandedId === ds.id ? null : ds.id; }}>
					<div class="flex items-center justify-between w-full">
						<div class="flex items-center space-x-4 flex-1 min-w-0 mr-4">
							<div class="shrink-0">
								{#if ds.iconDetails}
									<div class="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border border-border bg-muted">
										{#if ds.iconDetails.type === 'custom' || ds.iconDetails.type === 'brand'}
											<img src={ds.iconDetails.value} alt={ds.name} class="h-6 w-6 object-contain" />
										{:else}
											<Box class="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
										{/if}
									</div>
								{:else if ds.icon}
									<div class="h-10 w-10 bg-muted-foreground rounded-xl flex items-center justify-center mr-3 text-white font-bold text-lg uppercase shadow-sm">
										{ds.icon.charAt(0)}
									</div>
								{:else}
									<div class="h-10 w-10 bg-muted rounded-xl flex items-center justify-center mr-3 shadow-sm border border-border">
										<Box class="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
									</div>
								{/if}
							</div>
							<div class="flex flex-col sm:flex-row sm:items-center sm:gap-3 flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<p class="text-sm font-semibold text-foreground truncate">{ds.name}</p>
									<div class="flex items-center gap-1">
										{#if ds.source === 'npm' || ds.source === 'npm+docker'}
											<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" title="Trovato via Nginx Proxy Manager">
												<Box class="w-3.5 h-3.5" strokeWidth={1.5} />
											</span>
										{/if}
										{#if ds.source === 'docker' || ds.source === 'npm+docker'}
											<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" title="Trovato via Docker">
												<Box class="w-3.5 h-3.5" strokeWidth={1.5} />
											</span>
										{/if}
									</div>
								</div>
								<p class="text-sm text-muted-foreground truncate flex-1">{ds.url || ds.description}</p>
							</div>
						</div>
						
						<div>
							{#if ds.added}
								<span class="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
									<Check class="mr-1.5 h-4 w-4" strokeWidth={2} />
									AGGIUNTO
								</span>
							{:else}
								<button type="button" onclick={(e: Event) => { e.stopPropagation(); expandedId = expandedId === ds.id ? null : ds.id; }} class="inline-flex items-center justify-center w-10 h-10 border border-transparent rounded-full shadow-sm text-white transition-all duration-300 {expandedId === ds.id ? 'bg-gray-500 hover:bg-muted-foreground' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none hover:scale-110">
									<div class="relative w-5 h-5">
										<Pencil class="absolute top-0 left-0 w-4 h-4 transition-all duration-300 {expandedId === ds.id ? 'opacity-60' : ''}" strokeWidth={2.5} />
										{#if expandedId === ds.id}
											<X class="absolute -bottom-1 -right-1 w-3.5 h-3.5 text-white shadow-sm" strokeWidth={3} />
										{:else}
											<Plus class="absolute -bottom-1 -right-1 w-3.5 h-3.5 text-white shadow-sm" strokeWidth={3} />
										{/if}
									</div>
								</button>
							{/if}
						</div>
					</div>
					
					{#if !ds.added && expandedId === ds.id}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<div class="w-full mt-2 relative">
							<div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-indigo-600 rounded-t-xl z-10"></div>
							<div class="p-5 bg-card text-card-foreground rounded-xl shadow-lg border border-border relative" onclick={(e) => e.stopPropagation()} role="presentation">
								<ServiceForm 
									mode="discovery" 
									bind:service={discoveredServices[i]} 
									bind:categories={localCategories} 
									action="?/createService" 
									useEnhance={true} 
									enhanceFn={() => {
										return async ({ result, update }: any) => {
											if (result.type === 'success') {
												ds.added = true;
												expandedId = null;
											}
											await update();
										};
									}}
									onCancel={() => expandedId = null}
								/>
							</div>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</div>

</div>
</div>

{#if showNpmDisconnectModal}
	<div class="fixed inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
		<div class="bg-card rounded-2xl shadow-xl max-w-sm w-full overflow-hidden transform transition-all border border-border p-6" role="dialog" aria-modal="true">
			<div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
				<TriangleAlert class="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={1.5} />
			</div>
			
			<h3 class="text-lg font-bold text-center text-foreground mb-2">
				DISCONNETTI
			</h3>
			<p class="text-sm text-center text-muted-foreground mb-6">
				<strong>ATTENZIONE:</strong> PERDERAI LE <strong>CREDENZIALI</strong>. NE SEI CERTO?
			</p>
			
			<div class="flex gap-3 justify-center w-full">
				<button 
					type="button" 
					class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-muted dark:hover:bg-muted-foreground text-foreground text-sm font-bold uppercase tracking-wider rounded-xl transition-colors"
					onclick={() => showNpmDisconnectModal = false}
				>
					ANNULLA
				</button>
				<button 
					type="button" 
					class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-md shadow-red-500/30 transition-colors"
					onclick={confirmNpmDisconnect}
				>
					DISCONNETTI
				</button>
			</div>
		</div>
	</div>
{/if}
