<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import UrlInput from '$lib/components/ui/UrlInput.svelte';

	import { slide } from 'svelte/transition';
	import { themeStore, themes } from '$lib/client/themeStore.svelte';

		import { onMount } from 'svelte';
	let qbit_url = $state('');
	let qbit_username = $state('');
	let qbit_password = $state('');
	let isSavingQbit = $state(false);
	let showQbitPassword = $state(false);

	onMount(async () => {
		try {
			const res = await fetch('/api/settings');
			if (res.ok) {
				const data = await res.json();
				qbit_url = data.qbit_url || '';
				qbit_username = data.qbit_username || '';
				qbit_password = data.qbit_password || '';
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

	let isChangingAdminPassword = $state(false);
	let adminPassword = $state('');
	let adminPasswordConfirm = $state('');
	let showAdminPassword = $state(false);
	
	const themeFamilies = [
	    {
	        name: "Sistema",
	        options: [
	            themes.find(t => t.id === 'default')
	        ].filter(Boolean) as {id: string, name: string}[]
	    },
	    {
	        name: "Dracula",
	        options: [
	            themes.find(t => t.id === 'dracula-pro'),
	            themes.find(t => t.id === 'dracula-van-helsing'),
	            themes.find(t => t.id === 'dracula'),
	            themes.find(t => t.id === 'dracula-soft'),
	            themes.find(t => t.id === 'dracula-alucard')
	        ].filter(Boolean) as {id: string, name: string}[]
	    },
	    {
	        name: "Catppuccin",
	        options: [
	            themes.find(t => t.id === 'catppuccin'),
	            themes.find(t => t.id === 'catppuccin-macchiato'),
	            themes.find(t => t.id === 'catppuccin-frappe'),
	            themes.find(t => t.id === 'catppuccin-latte')
	        ].filter(Boolean) as {id: string, name: string}[]
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
				<h3 class="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">Aspetto e Tema</h3>
			</div>
			<p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Personalizza l'aspetto di TheView. Scegli tra le varie famiglie di temi supportate.</p>
			
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				{#each themeFamilies as family}
					<div class="space-y-3">
						<h4 class="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">{family.name}</h4>
						<div class="flex flex-col gap-2">
							{#each family.options as themeOption}
								<button 
									onclick={() => themeStore.setTheme(themeOption.id)}
									class="flex items-center justify-between w-full px-4 py-3 rounded-xl border text-left transition-all {themeStore.theme === themeOption.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800'}"
								>
									<span class="text-sm font-medium {themeStore.theme === themeOption.id ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}">{themeOption.name}</span>
									{#if themeStore.theme === themeOption.id}
										<svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/each}
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
						<div class="w-full sm:w-[140px] shrink-0">
							<button 
								onclick={saveQbitSettings}
								disabled={isSavingQbit}
								class="w-full h-[42px] inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-md shadow-green-500/30 text-sm font-bold uppercase tracking-wider text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-all disabled:opacity-50"
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
</div>
