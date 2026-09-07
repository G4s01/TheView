<script lang="ts">
	import { Loader2, GripHorizontal, Plus, AlertTriangle, Check, Trash2, Box } from "@lucide/svelte";
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SaveButton from '$lib/components/ui/SaveButton.svelte';
	import { Button } from "$lib/components/ui/button";
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
			alert("ERRORE NELL'ELIMINAZIONE DELLA CATEGORIA");
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
				alert("ERRORE DURANTE IL SALVATAGGIO.");
			}
		} catch (e) {
			console.error(e);
			alert("ERRORE DI RETE.");
		}
		isSaving = false;
	}
</script>

<div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
	
	<div class="bg-card text-card-foreground rounded-2xl shadow-lg border border-border overflow-hidden flex flex-col">
		
		<!-- Header -->
		<div class="px-6 py-5 border-b border-border bg-muted/50 flex flex-row items-center justify-between gap-4">
			<div>
				<h3 class="text-lg leading-6 font-bold text-foreground uppercase tracking-wider">Gestione Categorie</h3>
				<p class="mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Trascina per riordinare, modifica i nomi e salva tutto in un colpo solo.</p>
			</div>
			<div class="flex items-center gap-2">
				<Button variant="outline" size="icon" onclick={addCategory} title="Aggiungi">
					<Plus class="w-5 h-5" strokeWidth={1.5} />
				</Button>
				<SaveButton onclick={saveAll} isLoading={isSaving} class="h-10 w-10 p-0" title="Salva" />
			</div>
		</div>

		<!-- List -->
		<ul 
			class="divide-y divide-border min-h-[50px] w-full"
			use:dndzone={{items: localCategories, flipDurationMs}}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
		>
			{#each localCategories as category (category.id)}
				{@const catServices = services.filter(s => s.categoryId === category.id)}
				<li 
					animate:flip={{duration: flipDurationMs}}
					class="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card text-card-foreground cursor-move hover:bg-muted/50 transition-colors w-full gap-4"
				>
					<div class="flex items-center flex-1 w-full gap-4">
						<GripHorizontal class="h-6 w-6 text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing hover:text-foreground" strokeWidth={1.5} />
						
						<div class="w-full sm:max-w-md">
							<TextInput label="Nome Categoria" bind:value={category.name} />
						</div>

						<div class="hidden sm:flex flex-wrap gap-2 items-center flex-1 min-w-0">
							{#each catServices as s}
								<div class="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-muted relative group cursor-pointer" title={s.name}>
									{#if s.iconDetails}
										{#if s.iconDetails.type === 'custom' || s.iconDetails.type === 'brand'}
											<img src={s.iconDetails.value} alt={s.name} class="h-5 w-5 object-contain" />
										{:else}
											<Box class="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
										{/if}
									{:else if s.icon}
										<span class="text-sm font-bold uppercase text-muted-foreground">{s.icon.charAt(0)}</span>
									{:else}
										<Box class="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
									{/if}
								</div>
							{/each}
						</div>
					</div>
					
					<div class="flex flex-row w-full sm:w-auto items-center justify-between sm:justify-end shrink-0 gap-4 mt-2 sm:mt-0">
						<div class="flex sm:hidden flex-wrap gap-2 items-center">
							{#each catServices as s}
								<div class="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-muted relative group cursor-pointer" title={s.name}>
									{#if s.iconDetails}
										{#if s.iconDetails.type === 'custom' || s.iconDetails.type === 'brand'}
											<img src={s.iconDetails.value} alt={s.name} class="h-5 w-5 object-contain" />
										{:else}
											<Box class="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
										{/if}
									{:else if s.icon}
										<span class="text-sm font-bold uppercase text-muted-foreground">{s.icon.charAt(0)}</span>
									{:else}
										<Box class="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
									{/if}
								</div>
							{/each}
						</div>

						<Button variant="ghost" size="icon" onclick={() => deleteCategory(category.id)} class="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 w-10" title="Elimina Categoria">
							<Trash2 class="w-5 h-5" strokeWidth={1.5} />
						</Button>
					</div>
				</li>
			{/each}
			
			{#if localCategories.length === 0}
				<li class="px-6 py-8 text-center text-sm font-bold text-muted-foreground uppercase tracking-wider">
					Nessuna categoria. Aggiungine una!
				</li>
			{/if}
		</ul>



	</div>
</div>

{#if categoryToDelete !== null}
	<div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
		<div class="bg-card text-card-foreground rounded-2xl shadow-xl max-w-sm w-full overflow-hidden transform transition-all border border-border p-6" role="dialog" aria-modal="true">
			<div class="flex items-center justify-center w-12 h-12 mx-auto bg-destructive/10 rounded-full mb-4">
				<AlertTriangle class="w-6 h-6 text-destructive" strokeWidth={1.5} />
			</div>
			
			<h3 class="text-lg font-bold text-center text-foreground mb-2">
				ELIMINA
			</h3>
			<p class="text-sm text-center text-muted-foreground mb-6">
				FACENDOLO <strong>ELIMINI I SUOI SERVIZI</strong>. SEI SICURO?
			</p>
			
			<div class="flex gap-3 justify-center w-full">
				<Button 
					variant="outline"
					class="flex-1"
					onclick={() => categoryToDelete = null}
				>
					ANNULLA
				</Button>
				<Button 
					variant="destructive"
					class="flex-1"
					onclick={confirmDeleteCategory}
				>
					ELIMINA
				</Button>
			</div>
		</div>
	</div>
{/if}
