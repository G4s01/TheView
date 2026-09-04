import re

with open("src/routes/admin/components/AdminDiscovery.svelte", "r") as f:
    content = f.read()

# We need to replace the layout block entirely.
start_tag = '<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 mb-8">'
end_tag = '<!-- List of Discovered Services -->'

if start_tag in content and end_tag in content:
    start_idx = content.find(start_tag)
    end_idx = content.find(end_tag)

    new_html = """<div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
	<!-- NPM Block -->
	<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
		<div class="p-6">
			<div class="flex items-center space-x-3 mb-6">
				<img src="https://cdn.simpleicons.org/nginxproxymanager/4B5563" alt="NPM" class="w-8 h-8" />
				<div>
					<h3 class="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">Nginx Proxy Manager</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">Collega NPM per scovare automaticamente i tuoi servizi web esposti.</p>
				</div>
				<div class="flex-1"></div>
				{#if npmUrlCombined && npmEmail && npmPassword}
					<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
						<span class="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
						Configurato
					</span>
				{:else}
					<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
						Non Configurato
					</span>
				{/if}
			</div>

			{#if isNpmEditing}
				<div class="space-y-4 pt-2 w-full" transition:slide>
					<!-- Riga 1: Email e Password -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<TextInput label="Email (es. admin@example.com)" type="email" bind:value={npmEmail} />
						<TextInput label="Password" type={showNpmPassword ? "text" : "password"} bind:value={npmPassword} class="pr-10">
							<button type="button" onclick={() => showNpmPassword = !showNpmPassword} class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
								{#if showNpmPassword}
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
								{:else}
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
								{/if}
							</button>
						</TextInput>
					</div>
					
					<!-- Riga 2: URL e Bottone Salva -->
					<div class="flex gap-4">
						<div class="flex-1 min-w-0">
							<UrlInput label="Indirizzo NPM (es. 192.168.1.100:81)" bind:value={npmUrlCombined} />
						</div>
						<div class="w-[140px] shrink-0">
							<button 
								onclick={async () => {
									await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ npmUrl: npmUrlCombined, npmEmail, npmPassword }) });
									isNpmEditing = false;
								}}
								class="w-full h-[42px] inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-md shadow-blue-500/30 text-sm font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all"
							>
								<svg class="-ml-1 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
								Salva
							</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-200 dark:border-gray-700" transition:slide>
					<div class="flex items-center gap-3 mb-4 sm:mb-0">
						<div class="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-900 dark:text-white">Connesso a {npmUrlCombined}</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">Account: {npmEmail}</p>
						</div>
					</div>
					<div class="flex items-center space-x-3 w-full sm:w-auto justify-end">
						<button 
							onclick={async () => {
								if (!confirm("Sei sicuro di voler disconnettere NPM e cancellare le credenziali salvate?")) return;
								npmUrlCombined = ''; npmEmail = ''; npmPassword = '';
								isNpmEditing = true;
								await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ npmUrl: '', npmEmail: '', npmPassword: '' }) });
							}} 
							class="text-red-500 hover:text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
						>
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
						</button>
						<button onclick={() => isNpmEditing = true} class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold uppercase tracking-wider rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
							Modifica
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Results Block -->
	<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
		<!-- HEADER: RISULTATI + DISCOVERY BUTTON -->
		<div class="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div class="flex items-center space-x-3">
				<div class="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
				</div>
				<h3 class="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">Risultati Discovery</h3>
			</div>
			<div class="flex items-center gap-3">
				<button 
					onclick={fetchDiscovery} 
					disabled={isDiscovering}
					class="inline-flex items-center justify-center w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
				>
					{#if isDiscovering}
						<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
						Ricerca in corso...
					{:else}
						<svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
						Esegui Discovery
					{/if}
				</button>
			</div>
		</div>

		<!-- List of Discovered Services -->
"""

    content = content[:start_idx] + new_html + content[end_idx:]

    # Remove the extra `</div>` at the end of the file since we now have `space-y-8` -> `Results Card` -> `List of Discovered Services`
    # Let's count them carefully.
    
    with open("src/routes/admin/components/AdminDiscovery.svelte", "w") as f:
        f.write(content)
    print("SUCCESS")
else:
    print("FAILED TO FIND BOUNDARIES")

