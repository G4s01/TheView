<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import UrlInput from '$lib/components/ui/UrlInput.svelte';
	import ToggleInput from '$lib/components/ui/ToggleInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import { invalidateAll } from '$app/navigation';

	import { slide } from "svelte/transition";
	import { marked } from "marked";
	import DOMPurify from "isomorphic-dompurify";
	import { themeStore, themes } from '$lib/client/themeStore.svelte';

		import { onMount } from 'svelte';
	let qbit_url = $state('');
	let qbit_username = $state('');
	let qbit_password = $state('');
	let isSavingQbit = $state(false);
	let showQbitPassword = $state(false);
	
	let showCategoriesDesktop = $state(true);
	let showCategoriesMobile = $state(true);
	let customNavbarTitleDesktop = $state('');
	let customNavbarTitleMobile = $state('');
	let showCategoryCounts = $state(true);
	let showServiceDescriptions = $state(true);
	let iconStyle = $state('rounded-xl');
	let stickyNavbar = $state(true);
	let showEditButton = $state(true);
	let isSavingAppearance = $state(false);

	let versionInfo = $state<any>({});
	let isCheckingVersion = $state(false);
	let showChangelog = $state(false);

	async function checkVersion(force = false) {
		isCheckingVersion = true;
		try {
			const res = await fetch(`/api/version${force ? '?force=1' : ''}`);
			if (res.ok) {
				versionInfo = await res.json();
			}
		} catch (e) {}
		isCheckingVersion = false;
	}

	onMount(async () => {
		checkVersion();
		try {
			const res = await fetch('/api/settings');
			if (res.ok) {
				const data = await res.json(); console.log("FETCHED DATA:", data);
				qbit_url = data.qbit_url || '';
				qbit_username = data.qbit_username || '';
				qbit_password = data.qbit_password || '';
				showCategoriesDesktop = data.showCategoriesDesktop !== false;
				showCategoriesMobile = data.showCategoriesMobile !== false;
				
				// Migration from old customNavbarTitle
				customNavbarTitleDesktop = data.customNavbarTitleDesktop || data.customNavbarTitle || '';
				customNavbarTitleMobile = data.customNavbarTitleMobile || data.customNavbarTitle || '';
				
				showCategoryCounts = data.showCategoryCounts !== false;
				showServiceDescriptions = data.showServiceDescriptions !== false;
				iconStyle = data.iconStyle || 'rounded-xl';
				stickyNavbar = data.stickyNavbar !== false;
				showEditButton = data.showEditButton !== false;
			}
		} catch (e) {
			console.error(e);
		}
	});

	async function saveQbitSettings() {
		isSavingQbit = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ qbit_url, qbit_username, qbit_password })
			});
			if (res.ok) alert('Impostazioni qBittorrent salvate con successo!');
			else alert('Errore durante il salvataggio.');
		} catch (e) {
			alert('Errore di rete.');
		} finally {
			isSavingQbit = false;
		}
	}

	async function saveAppearanceSettings() {
		isSavingAppearance = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ showCategoriesDesktop, showCategoriesMobile, customNavbarTitleDesktop, customNavbarTitleMobile, showCategoryCounts, showServiceDescriptions, iconStyle, stickyNavbar, showEditButton })
			});
			if (res.ok) {
				await invalidateAll();
			} else {
				alert('Errore durante il salvataggio.');
			}
		} catch (e) {
			alert('Errore di rete.');
		} finally {
			isSavingAppearance = false;
		}
	}

	let isChangingAdminPassword = $state(false);
	let adminPassword = $state('');
	let adminPasswordConfirm = $state('');
	let showAdminPassword = $state(false);
	
	const themeFamilies = [
	    {
	        name: "Sistema",
	        options: [
	            themes.find(t => t.id === 'default')
	        ].filter(Boolean) as {id: string, name: string, type: string}[]
	    },
	    {
	        name: "Dracula",
	        options: [
	            themes.find(t => t.id === 'dracula-pro'),
	            themes.find(t => t.id === 'dracula-van-helsing'),
	            themes.find(t => t.id === 'dracula'),
	            themes.find(t => t.id === 'dracula-soft'),
	            themes.find(t => t.id === 'dracula-alucard')
	        ].filter(Boolean) as {id: string, name: string, type: string}[]
	    },
	    {
	        name: "Catppuccin",
	        options: [
	            themes.find(t => t.id === 'catppuccin'),
	            themes.find(t => t.id === 'catppuccin-macchiato'),
	            themes.find(t => t.id === 'catppuccin-frappe'),
	            themes.find(t => t.id === 'catppuccin-latte')
	        ].filter(Boolean) as {id: string, name: string, type: string}[]
	    }
	];
</script>

<div class="space-y-6">
	<!-- Tema Section -->
	<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
		<div class="p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
			<div class="flex items-center space-x-3 mb-2">
				<div class="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
				</div>
				<h3 class="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">TEMA</h3>
			</div>
			<p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Personalizza l'aspetto di TheView. Scegli tra le varie famiglie di temi supportate.</p>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
				{#each themeFamilies as family}
					{@const isSelected = family.options.some(t => t.id === themeStore.theme)}
					<SelectInput 
						label={family.name}
						placeholder={family.name.toUpperCase()}
						hideLabelWhenEmpty={true}
						value={themeStore.theme}
						class={isSelected ? 'ring-2 ring-blue-500 border-transparent bg-blue-50/50 dark:bg-blue-900/20' : ''}
						options={family.options.map(t => ({
							value: t.id, 
							label: `${t.name} ${t.type === 'both' ? '☀️/🌙' : t.type === 'dark' ? '🌙' : '☀️'}`
						}))}
						onchange={(val) => themeStore.setTheme(val as string)}
					/>
				{/each}
			</div>
		</div>
	</div>

	<!-- Appearance Section -->
	<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
		<div class="p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
			<div class="flex items-center space-x-3 mb-4">
				<div class="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
				</div>
				<h3 class="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">Home</h3>
			</div>
			
			<p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Personalizza l'aspetto della tua schermata principale.</p>
			
			<div class="space-y-6">
				<h4 class="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">Home Navbar</h4>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
						<div>
							<h4 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Categorie su Desktop</h4>
							<p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Mostra la topbar con le categorie sui display grandi</p>
						</div>
						<ToggleInput bind:checked={showCategoriesDesktop} />
					</div>
					
					<div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
						<div>
							<h4 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Categorie su Mobile</h4>
							<p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Mostra la bottom bar con le categorie su smartphone</p>
						</div>
						<ToggleInput bind:checked={showCategoriesMobile} />
					</div>
				</div>

				{#if !showCategoriesDesktop || !showCategoriesMobile}
					<div transition:slide class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
						<TextInput 
							label="Titolo Sostitutivo Desktop" 
							bind:value={customNavbarTitleDesktop} 
							placeholder="Es. TheView Dashboard" 
							disabled={showCategoriesDesktop}
							class={showCategoriesDesktop ? 'opacity-50 cursor-not-allowed' : ''}
						/>
						<TextInput 
							label="Titolo Sostitutivo Mobile" 
							bind:value={customNavbarTitleMobile} 
							placeholder="Es. TheView" 
							disabled={showCategoriesMobile}
							class={showCategoriesMobile ? 'opacity-50 cursor-not-allowed' : ''}
						/>
					</div>
				{/if}

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
							<div>
								<h4 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Navbar Fissa</h4>
								<p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">La navbar rimarrà fissa in alto scorrendo la pagina</p>
							</div>
							<ToggleInput bind:checked={stickyNavbar} />
						</div>
						<div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
							<div>
								<h4 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Tasto Modifica Rapida</h4>
								<p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Mostra la matita di modifica quando si è loggati</p>
							</div>
							<ToggleInput bind:checked={showEditButton} />
						</div>
					</div>

				<h4 class="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 pt-4">Home</h4>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
						<div>
							<h4 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Conteggio Servizi</h4>
							<p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Mostra il numero di servizi accanto a ogni categoria</p>
						</div>
						<ToggleInput bind:checked={showCategoryCounts} />
					</div>
					
					<div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
						<div>
							<h4 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Descrizioni</h4>
							<p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Mostra la descrizione sotto al nome di ogni servizio</p>
						</div>
						<ToggleInput bind:checked={showServiceDescriptions} />
					</div>
				</div>
				
				<div class="flex flex-col space-y-3 pt-4">
						<label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Stile Icone Servizi</label>
						<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<button type="button" onclick={() => iconStyle = 'rounded-xl'} class="flex flex-col items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border {iconStyle === 'rounded-xl' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-200 dark:border-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
								<div class="w-12 h-12 bg-purple-500 rounded-xl shadow-sm flex items-center justify-center">
									<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
								</div>
								<span class="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">Arrotondato</span>
							</button>
							<button type="button" onclick={() => iconStyle = 'rounded-full'} class="flex flex-col items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border {iconStyle === 'rounded-full' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-200 dark:border-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
								<div class="w-12 h-12 bg-purple-500 rounded-full shadow-sm flex items-center justify-center">
									<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
								</div>
								<span class="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">Circolare</span>
							</button>
							<button type="button" onclick={() => iconStyle = 'rounded-none'} class="flex flex-col items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border {iconStyle === 'rounded-none' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-200 dark:border-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
								<div class="w-12 h-12 bg-purple-500 rounded-none shadow-sm flex items-center justify-center">
									<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
								</div>
								<span class="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-center">Quadrato</span>
							</button>
						</div>
					</div>
				
				<div class="flex justify-end pt-2">
					<button 
						onclick={saveAppearanceSettings}
						disabled={isSavingAppearance}
						class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent rounded-xl shadow-md shadow-purple-500/30 text-sm font-bold uppercase tracking-wider text-white bg-purple-600 hover:bg-purple-700 focus:outline-none transition-all disabled:opacity-50"
					>
						{#if isSavingAppearance}
							<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
							Salvataggio...
						{:else}
							Salva Impostazioni Aspetto
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Widget Config Section -->
	<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
		<div class="p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
			<div class="flex items-center space-x-3 mb-4">
				<div class="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<h3 class="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">Integrazioni Widget</h3>
			</div>
			
			<p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Configura le credenziali e gli indirizzi per far comunicare i widget con i tuoi servizi.</p>
			
			<div class="space-y-4">
				<h4 class="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">qBittorrent</h4>
				<div class="space-y-4 pt-2 w-full">
					<!-- Riga 1: Username e Password -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<TextInput label="Username (es. admin)" bind:value={qbit_username} />
						<TextInput label="Password (es. adminadmin)" type={showQbitPassword ? "text" : "password"} bind:value={qbit_password} class="pr-10">
							<button type="button" onclick={() => showQbitPassword = !showQbitPassword} class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
								{#if showQbitPassword}
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
								{:else}
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
								{/if}
							</button>
						</TextInput>
					</div>
					
					<!-- Riga 2: URL e Bottone Salva -->
					<div class="flex flex-col sm:flex-row gap-4">
						<div class="flex-1 min-w-0">
							<UrlInput label="Indirizzo Base (es. 172.17.0.1:8080)" bind:value={qbit_url} />
						</div>
						<div class="w-full sm:w-35 shrink-0">
							<button 
								onclick={saveQbitSettings}
								disabled={isSavingQbit}
								class="w-full h-10.5 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-md shadow-green-500/30 text-sm font-bold uppercase tracking-wider text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-all disabled:opacity-50"
							>
								{#if isSavingQbit}
									...
								{:else}
									<svg class="-ml-1 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
									</svg>
									Salva
								{/if}
							</button>
						</div>
					</div>
			</div>
		</div>
	</div>

	</div>

	<!-- Security Section -->
	<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
		<div class="p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
			<div class="flex items-center space-x-3 mb-4">
				<div class="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
				</div>
				<h3 class="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">Sicurezza</h3>
			</div>
			
			{#if !isChangingAdminPassword}
				<div class="flex items-center justify-between">
					<p class="text-sm text-gray-500 dark:text-gray-400">Proteggi l'accesso alla dashboard di amministrazione.</p>
					<button 
						onclick={() => isChangingAdminPassword = true}
						class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors"
					>
						Cambia Password
					</button>
				</div>
			{:else}
				<div transition:slide class="space-y-4 max-w-sm">
					<TextInput label="Nuova Password Admin" type={showAdminPassword ? "text" : "password"} bind:value={adminPassword} class="pr-10">
						<button type="button" onclick={() => showAdminPassword = !showAdminPassword} class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
							{#if showAdminPassword}
								<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
							{:else}
								<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
							{/if}
						</button>
					</TextInput>
					<TextInput label="Conferma Password" type="password" bind:value={adminPasswordConfirm} />
					<div class="flex space-x-3 pt-2">
						<button 
							onclick={() => {
								isChangingAdminPassword = false;
								adminPassword = '';
								adminPasswordConfirm = '';
							}}
							class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors"
						>
							Annulla
						</button>
						<button
							onclick={async () => {
								if (!adminPassword) return alert("Inserisci una password!");
								if (adminPassword !== adminPasswordConfirm) return alert("Le password non coincidono!");
								try {
									await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminPassword }) });
									adminPassword = '';
									adminPasswordConfirm = '';
									isChangingAdminPassword = false;
									alert("Password modificata!");
								} catch(e) { alert("Errore!"); }
							}}
							class="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-bold uppercase tracking-wider rounded-lg shadow-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
						>
							Salva
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- System & Version Section -->
	<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
		<div class="p-6 bg-white dark:bg-gray-800 rounded-2xl">
			<div class="flex items-center space-x-3 mb-6">
				<div class="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
				</div>
				<h3 class="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">Sistema & Aggiornamenti</h3>
			</div>

			<div class="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
				<div class="space-y-1">
					<div class="flex items-center space-x-2">
						<span class="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Versione Attuale:</span>
						<span class="text-base font-bold text-gray-900 dark:text-white">v{versionInfo.currentVersion || '...'}</span>
					</div>
					{#if versionInfo.latestVersion && versionInfo.latestVersion !== versionInfo.currentVersion}
						<div class="flex items-center space-x-2 text-red-500 dark:text-red-400">
							<svg class="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
							<span class="text-sm font-bold uppercase tracking-wider">Nuova versione disponibile: v{versionInfo.latestVersion}</span>
						</div>
					{:else if versionInfo.latestVersion === versionInfo.currentVersion}
						<div class="flex items-center space-x-2 text-green-600 dark:text-green-500">
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
							<span class="text-xs font-bold uppercase tracking-wider">Il sistema è aggiornato</span>
						</div>
					{/if}
				</div>

				<div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
					{#if versionInfo.latestVersion && versionInfo.latestVersion !== versionInfo.currentVersion && versionInfo.url}
						<button 
							type="button"
							onclick={() => showChangelog = !showChangelog}
							class="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors"
						>
							{showChangelog ? 'Nascondi Changelog' : 'Vedi Changelog'}
						</button>
					{/if}
					<button 
						type="button"
						onclick={() => checkVersion(true)}
						disabled={isCheckingVersion}
						class="inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors"
					>
						{#if isCheckingVersion}
							<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
							Controllo...
						{:else}
							<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
							Controlla
						{/if}
					</button>
				</div>
			</div>
			
			{#if showChangelog && versionInfo.releaseNotes && versionInfo.latestVersion !== versionInfo.currentVersion}
			<div transition:slide class="mt-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
				<div class="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
					<h4 class="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Note di Rilascio v{versionInfo.latestVersion}</h4>
					<a href={versionInfo.url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-3 py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-gray-300 dark:border-gray-600">
						<svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
						Apri su GitHub
					</a>
				</div>
				<div class="prose prose-sm dark:prose-invert max-w-none max-h-64 overflow-y-auto pr-2 custom-scrollbar">
					{@html DOMPurify.sanitize(marked.parse(versionInfo.releaseNotes) as string)}
				</div>
			</div>
			{/if}
		</div>
	</div>

</div>
