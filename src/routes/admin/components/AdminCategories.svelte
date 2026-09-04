<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	let { localCategories = $bindable() } = $props();

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

	async function deleteCategory(catId: string | number) {
		if (typeof catId === 'string' && catId.startsWith('new_')) {
			// Just remove from local array
			localCategories = localCategories.filter((c: any) => c.id !== catId);
			return;
		}

		if (!confirm("Attenzione: cancellando la categoria eliminerai anche tutti i servizi al suo interno. Procedere?")) {
			return;
		}

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
				<li 
					animate:flip={{duration: flipDurationMs}}
					class="px-6 py-4 flex flex-row items-center justify-between bg-white dark:bg-gray-800 cursor-move hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors w-full gap-4"
				>
					<div class="flex items-center flex-1 w-full">
						<svg class="h-6 w-6 text-gray-400 mr-4 shrink-0 cursor-grab active:cursor-grabbing hover:text-gray-600 dark:hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
						</svg>
						
						<div class="flex-1 max-w-md">
							<TextInput label="Nome Categoria" bind:value={category.name} />
						</div>
					</div>
					
					<div class="flex items-center shrink-0">
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
