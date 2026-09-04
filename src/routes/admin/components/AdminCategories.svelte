<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';

	import { enhance } from '$app/forms';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	let { localCategories = $bindable() } = $props();

	const flipDurationMs = 200;

	function handleDndConsider(e: CustomEvent) {
		localCategories = e.detail.items;
	}
	
	async function handleDndFinalize(e: CustomEvent) {
		localCategories = e.detail.items;
		
		// Save new order to DB
		const orderedIds = localCategories.map((c: any) => c.id);
		fetch('/api/categories/reorder', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ orderedIds })
		}).catch(console.error);
	}
</script>

<div class="space-y-8">
	<!-- Add New Category -->
	<div class="bg-white dark:bg-gray-800 shadow-md rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
		<div class="px-5 py-6">
			<h3 class="text-lg leading-6 font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Aggiungi Categoria</h3>
			<form method="POST" action="?/createCategory" use:enhance class="flex items-end space-x-4">
				<div class="flex-1">
					<label for="cat_name" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nome</label>
					<input type="text" name="name" id="cat_name" required class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white sm:text-sm py-2 px-3">
				</div>
				<button type="submit" class="inline-flex justify-center rounded-xl border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none uppercase tracking-wider transition-colors hover:shadow-lg">
					Aggiungi
				</button>
			</form>
		</div>
	</div>

	<!-- Categories List (DnD) -->
	<div class="bg-white dark:bg-gray-800 shadow-md rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
		<div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
			<p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trascina per riordinare. L'ordine si rifletterà sui menu e sulla homepage.</p>
		</div>
		<ul 
			class="divide-y divide-gray-100 dark:divide-gray-700 min-h-[50px]"
			use:dndzone={{items: localCategories, flipDurationMs}}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
		>
			{#each localCategories as category (category.id)}
				<li 
					animate:flip={{duration: flipDurationMs}}
					class="px-5 py-4 flex items-center justify-between bg-white dark:bg-gray-800 cursor-move hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
				>
					<div class="flex items-center flex-1 mr-4">
						<svg class="h-6 w-6 text-gray-400 mr-4 cursor-grab active:cursor-grabbing hover:text-gray-600 dark:hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
						</svg>
						<form method="POST" action="?/updateCategory" use:enhance class="flex-1 flex items-center space-x-3">
							<input type="hidden" name="id" value={category.id}>
							<input type="text" name="name" value={category.name} required class="block w-full max-w-xs rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white sm:text-sm px-3 py-2">
							<button type="submit" class="text-sm font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30" title="Salva Modifiche">
								<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
							</button>
						</form>
					</div>
					<div class="flex items-center space-x-4">
						<form method="POST" action="?/deleteCategory" use:enhance onsubmit={(e) => { if(!confirm('Attenzione: cancellando la categoria eliminerai anche tutti i servizi al suo interno. Procedere?')) e.preventDefault(); }}>
							<input type="hidden" name="id" value={category.id}>
							<button type="submit" class="text-sm font-bold uppercase tracking-wider text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30" title="Elimina Categoria">
								<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
							</button>
						</form>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</div>
