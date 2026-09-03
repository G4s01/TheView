<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	let { show, onClose, onSuccess } = $props<{
		show: boolean;
		onClose: () => void;
		onSuccess: () => void;
	}>();

	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			const res = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'login', password })
			});

			if (res.ok) {
				password = '';
				onSuccess();
			} else {
				error = 'Password errata';
			}
		} catch (err) {
			error = 'Errore di rete';
		} finally {
			loading = false;
		}
	}
</script>

{#if show}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
		transition:fade={{ duration: 150 }}
		onclick={onClose}
		role="presentation"
	>
		<!-- Modal -->
		<div 
			class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700"
			transition:scale={{ duration: 150, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
			role="dialog"
		>
			<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Modalità Modifica</h2>
			<p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Inserisci la password di amministrazione per abilitare le modifiche.</p>
			
			<form onsubmit={handleLogin} class="space-y-4">
				<div>
					<input 
						type="password" 
						bind:value={password} 
						placeholder="Password" 
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
						required
						autofocus
					/>
				</div>
				
				{#if error}
					<p class="text-sm text-red-500">{error}</p>
				{/if}

				<div class="flex justify-end space-x-3 mt-6">
					<button 
						type="button" 
						onclick={onClose}
						class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
					>
						Annulla
					</button>
					<button 
						type="submit" 
						disabled={loading}
						class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
					>
						{loading ? 'Sblocco...' : 'Sblocca'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
