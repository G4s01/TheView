<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	let { localCategories = $bindable(), services = [] } = $props();

	const flipDurationMs = 200;
	let isSaving = $state(false);

	function handleDndConsider(e: CustomEvent) {
		localCategories = e.detail.items;
	}
	
	function handleDndFinalize(e: CustomEvent) {
		localCategories = e.detail.items;
	}

	function addCategory() {
		localCategories = [
			...localCategories, 
			{ id: 'new_' + Math.random().toString(36).substring(2), name: '' }
		];
	}

	let categoryToDelete = $state<string | number | null>(null);

	function deleteCategory(catId: string | number) {
		if (typeof catId === 'string' && catId.startsWith('new_')) {
			// Just remove from local array
			localCategories = localCategories.filter((c: any) => c.id !== catId);
			return;
		}
		categoryToDelete = catId;
	}

	async function confirmDeleteCategory() {
		if (categoryToDelete === null) return;
		const catId = categoryToDelete;
		categoryToDelete = null;

		// Instant delete for existing ones
		const formData = new FormData();
		formData.append('id', catId.toString());
		
		try {
			await fetch('?/deleteCategory', {
				method: 'POST',
				body: formData
			});
			localCategories = localCategories.filter((c: any) => c.id !== catId);
		} catch (e) {
			console.error(e);
			alert("Errore durante l'eliminazione della categoria.");
		}
	}

	async function saveAll() {
		isSaving = true;
		try {
			const res = await fetch('/api/categories/sync', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ syncData: localCategories })
			});
			if (res.ok) {
				window.location.reload();
			} else {
				alert("Errore durante il salvataggio.");
			}
		} catch (e) {
			console.error(e);
			alert("Errore di rete.");
		}
		isSaving = false;
	}
</script>

<div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
	
	<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
		
		<!-- Header -->
		<div class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-row items-center justify-between gap-4">
			<div>
				<h3 class="text-lg leading-6 font-bold text-gray-900 dark:text-white uppercase tracking-wider">Gestione Categorie</h3>
				<p class="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trascina per riordinare, modifica i nomi e salva tutto in un colpo solo.</p>
			</div>
			<button onclick={addCategory} class="inline-flex justify-center items-center rounded-xl border border-transparent bg-blue-100 dark:bg-blue-900/30 py-2.5 px-5 text-sm font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40 focus:outline-none uppercase tracking-wider transition-colors">
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
				Aggiungi
			</button>
		</div>

		<!-- List -->
		<ul 
			class="divide-y divide-gray-100 dark:divide-gray-700 min-h-[50px] w-full"
			use:dndzone={{items: localCategories, flipDurationMs}}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
		>
			{#each localCategories as category (category.id)}
				{@const catServices = services.filter(s => s.categoryId === category.id)}
				<li 
					animate:flip={{duration: flipDurationMs}}
					class="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-800 cursor-move hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors w-full gap-4"
				>
					<div class="flex items-center flex-1 w-full gap-4">
						<svg class="h-6 w-6 text-gray-400 shrink-0 cursor-grab active:cursor-grabbing hover:text-gray-600 dark:hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
						</svg>
						
						<div class="w-full sm:max-w-md">
							<TextInput label="Nome Categoria" bind:value={category.name} />
						</div>

						<div class="hidden sm:flex flex-wrap gap-2 items-center flex-1 min-w-0">
							{#each catServices as s}
								<div class="flex items-center bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600" title={s.name}>
									<span class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">{s.name}</span>
								</div>
							{/each}
						</div>
					</div>
					
					<div class="flex flex-row w-full sm:w-auto items-center justify-between sm:justify-end shrink-0 gap-4 mt-2 sm:mt-0">
						<div class="flex sm:hidden flex-wrap gap-2 items-center">
							{#each catServices as s}
								<div class="flex items-center bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600" title={s.name}>
									<span class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[80px]">{s.name}</span>
								</div>
							{/each}
						</div>

						<button onclick={() => deleteCategory(category.id)} class="text-sm font-bold uppercase tracking-wider text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30" title="Elimina Categoria">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
						</button>
					</div>
				</li>
			{/each}
			
			{#if localCategories.length === 0}
				<li class="px-6 py-8 text-center text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
					Nessuna categoria. Aggiungine una!
				</li>
			{/if}
		</ul>

		<!-- Footer Actions -->
		<div class="px-6 py-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end">
			<button onclick={saveAll} disabled={isSaving} class="inline-flex justify-center items-center rounded-xl border border-transparent bg-green-600 py-3 px-8 text-sm font-bold text-white shadow-md hover:bg-green-700 focus:outline-none uppercase tracking-wider transition-colors hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
				{#if isSaving}
					<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
					Salvataggio...
				{:else}
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
					Salva Tutte Le Modifiche
				{/if}
			</button>
		</div>

	</div>
</div>

{#if categoryToDelete !== null}
	<div class="fixed inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
		<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden transform transition-all border border-gray-100 dark:border-gray-700 p-6" role="dialog" aria-modal="true">
			<div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
				<svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
			</div>
			
			<h3 class="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
				Elimina Categoria
			</h3>
			<p class="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
				Attenzione: cancellando questa categoria eliminerai anche <strong>tutti i servizi al suo interno</strong>. Vuoi davvero procedere?
			</p>
			
			<div class="flex gap-3 justify-center w-full">
				<button 
					type="button" 
					class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-bold uppercase tracking-wider rounded-xl transition-colors"
					onclick={() => categoryToDelete = null}
				>
					Annulla
				</button>
				<button 
					type="button" 
					class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-md shadow-red-500/30 transition-colors"
					onclick={confirmDeleteCategory}
				>
					Elimina
				</button>
			</div>
		</div>
	</div>
{/if}
