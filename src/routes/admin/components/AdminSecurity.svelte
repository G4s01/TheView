<script lang="ts">
	import { slide } from 'svelte/transition';

	let isChangingAdminPassword = $state(false);
	let adminPassword = $state('');
	let adminPasswordConfirm = $state('');
	let showAdminPassword = $state(false);
</script>

<div class="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
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
			<div>
				<label class="block text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">Nuova Password Admin</label>
				<div class="relative">
					<input type={showAdminPassword ? "text" : "password"} bind:value={adminPassword} class="block w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all dark:text-white">
					<button type="button" onclick={() => showAdminPassword = !showAdminPassword} class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
						{#if showAdminPassword}
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
						{:else}
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
						{/if}
					</button>
				</div>
			</div>
			<div>
				<label class="block text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">Conferma Password</label>
				<input type="password" bind:value={adminPasswordConfirm} class="block w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all dark:text-white">
			</div>
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

