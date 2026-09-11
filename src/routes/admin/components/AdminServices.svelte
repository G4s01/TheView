<script lang="ts">
	import TextInput from "$lib/components/ui/TextInput.svelte";
	import SelectInput from "$lib/components/ui/SelectInput.svelte";
	import ToggleInput from "$lib/components/ui/ToggleInput.svelte";
	import UrlInput from "$lib/components/ui/UrlInput.svelte";

	import { enhance } from "$app/forms";
	import { slide } from "svelte/transition";
	import { invalidateAll } from "$app/navigation";
	import { onMount } from "svelte";
	import {
		ArrowUpCircle,
		Box,
		Plus,
		AlertTriangle,
		Upload,
		Check,
		Trash2,
		X,
		GripHorizontal,
		Ghost,
	} from "@lucide/svelte";
	import ServiceForm from "$lib/components/ServiceForm.svelte";
	import ConfirmDeleteButton from "$lib/components/ui/ConfirmDeleteButton.svelte";
	import ServiceIcon from "$lib/components/ui/ServiceIcon.svelte";
	import IconCombobox from "$lib/components/IconCombobox.svelte";
	import SaveButton from "$lib/components/ui/SaveButton.svelte";
	import BackButton from "$lib/components/ui/BackButton.svelte";
	import { dndzone } from "svelte-dnd-action";
	import { flip } from "svelte/animate";
	import { clickOutside } from "$lib/actions/clickOutside";
	import { page } from "$app/stores";

	let { services, localCategories = $bindable() } = $props();

	let updateStatuses = $state<
		Record<number, { updateAvailable: boolean; updateUrl?: string }>
	>({});

	onMount(() => {
		services.forEach((s: any) => {
			if (s.dockerImage) {
				fetch(
					`/api/docker/version?image=${encodeURIComponent(s.dockerImage)}`,
				)
					.then((r) => r.json())
					.then((d) => {
						if (d.updateAvailable) {
							updateStatuses[s.id] = {
								updateAvailable: d.updateAvailable,
								updateUrl: d.updateUrl,
							};
						}
					})
					.catch(() => {});
			}
		});
	});

	let editingServiceId = $state<number | null>(null);
	let editingServiceClone = $state<any>(null);
	let deletingServiceId = $state<number | null>(null);

	let newService = $state({
		name: "",
		url: "",
		icon: "",
		description: "",
		categoryId: "",
		pingEnabled: true,
		widgetType: "",
		dockerImage: "",
	});

	let isAddServiceExpanded = $state(false);
	let isCreatingCategory = $state(false);
	let newCategoryName = $state("");
	let newServiceCategoryId = $state("");
	let newPingEnabled = $state(true);

	const flipDurationMs = 200;
	let isSavingOrder = $state(false);
	let editingCategoryId = $state<number | string | null>(null);

	function handleDndConsider(e: CustomEvent) {
		localCategories = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent) {
		localCategories = e.detail.items;
		saveCategoryOrder();
	}

	async function saveCategoryOrder() {
		isSavingOrder = true;
		try {
			const res = await fetch("/api/categories/sync", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ syncData: localCategories }),
			});
			if (!res.ok) {
				alert("ERRORE DURANTE IL SALVATAGGIO DELL'ORDINE.");
			}
		} catch (e) {
			console.error(e);
			alert("ERRORE DI RETE.");
		}
		isSavingOrder = false;
	}

	async function deleteCategory(catId: string | number) {
		const formData = new FormData();
		formData.append("id", catId.toString());

		try {
			await fetch("?/deleteCategory", {
				method: "POST",
				body: formData,
			});
			await invalidateAll();
			editingCategoryId = null;
		} catch (e) {
			console.error(e);
			alert("ERRORE NELL'ELIMINAZIONE DELLA CATEGORIA");
		}
	}

	let enableCategories = $derived($page.data.settings?.enableCategories !== false);

	let groupedServices = $derived.by(() => {
		const newGrouped: Record<number, any[]> = {};
		
		if (!enableCategories) {
			newGrouped[-1] = [...services].filter(s => s).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
			return newGrouped;
		}

		for (const cat of localCategories) {
			newGrouped[cat.id] = [];
		}

		for (const s of services) {
			if (s) {
				if (!newGrouped[s.categoryId]) {
					newGrouped[s.categoryId] = [];
				}
				newGrouped[s.categoryId].push(s);
			}
		}

		for (const catId in newGrouped) {
			newGrouped[catId].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
		}

		return newGrouped;
	});

	let iconStyle = $derived($page.data.settings?.iconStyle || "rounded-xl");
</script>

{#snippet serviceItem(service: any, catId: number | string, i: number)}
	<li
		class="px-5 py-4 hover:bg-accent hover:text-accent-foreground transition-colors bg-card text-card-foreground"
	>
		<div class="flex items-center justify-between w-full">
			<div class="flex items-center">
				<ServiceIcon
					icon={service.iconDetails?.value || service.icon}
					name={service.name}
					size="lg"
					{iconStyle}
					class="mr-3 shadow-sm border border-border"
				/>
				<div>
					<p
						class="text-sm font-bold text-foreground uppercase tracking-wider"
					>
						{service.name}
					</p>
					<p
						class="text-xs text-muted-foreground font-medium truncate w-48 sm:w-64 md:w-auto"
					>
						{service.url}
					</p>
				</div>
			</div>
			<div class="flex items-center space-x-2">
				{#if updateStatuses[service.id]?.updateAvailable}
					<a
						href={updateStatuses[service.id].updateUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="p-2 text-destructive hover:text-destructive/80 transition-colors relative"
						title="Aggiornamento Disponibile!"
					>
						<span
							class="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-40 animate-ping"
						></span>
						<ArrowUpCircle class="w-5 h-5 animate-pulse relative" />
					</a>
				{/if}
				{#if editingCategoryId === null}
					<ConfirmDeleteButton
						class="shrink-0"
						onConfirm={async () => {
							const formData = new FormData();
							formData.append("id", service.id.toString());
							await fetch("?/deleteService", {
								method: "POST",
								body: formData,
							});
							window.location.reload();
						}}
					/>
					<button
						type="button"
						onclick={() => {
							if (editingServiceId === service.id) {
								editingServiceId = null;
							} else {
								editingServiceId = service.id;
								editingServiceClone = structuredClone(
									$state.snapshot(service),
								);
							}
						}}
						class="p-2 text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 rounded-lg shadow-sm edit-service-btn"
						title={editingServiceId === service.id
							? "Chiudi Modifica"
							: "Modifica Servizio"}
					>
						{#if editingServiceId === service.id}
							<X class="w-5 h-5" strokeWidth={2} />
						{:else}
							<svg
								class="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								></path></svg
							>
						{/if}
					</button>
				{/if}
			</div>
		</div>

		{#if editingServiceId === service.id}
			<div
				transition:slide
				class="w-full mt-4 relative cursor-default"
				onclick={(e) => e.stopPropagation()}
				role="presentation"
				use:clickOutside={{
					enabled: editingServiceId === service.id,
					handler: () => {
						editingServiceId = null;
					},
					ignore: ".edit-service-btn",
				}}
			>
				<div
					class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-accent rounded-t-xl z-10"
				></div>
				<div
					class="p-5 bg-card text-card-foreground border border-border rounded-xl shadow-md"
				>
					<ServiceForm
						mode="edit"
						bind:service={editingServiceClone}
						bind:categories={localCategories}
						action="?/updateService"
						useEnhance={true}
						hideDelete={true}
						hideCancel={true}
						enhanceFn={() => {
							return async ({ update }: any) => {
								await update();
								editingServiceId = null;
							};
						}}
					/>
				</div>
			</div>
		{/if}
	</li>
{/snippet}

<div class="space-y-8">
	<!-- Add New Service Form -->
	<div
		class="bg-card text-card-foreground shadow-md rounded-2xl border border-border"
		use:clickOutside={{
			enabled: isAddServiceExpanded,
			handler: () => (isAddServiceExpanded = false),
		}}
	>
		<button
			onclick={() => (isAddServiceExpanded = !isAddServiceExpanded)}
			class="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-muted transition-colors"
		>
			<div class="flex items-center space-x-3">
				<div class="p-1.5 bg-primary/20 text-primary rounded-lg">
					<Plus class="h-5 w-5" strokeWidth={1.5} />
				</div>
				<h3
					class="text-sm font-bold text-foreground uppercase tracking-wider"
				>
					Aggiungi Servizio
				</h3>
			</div>
		</button>

		{#if isAddServiceExpanded}
			<div
				transition:slide|local
				class="px-5 pb-6 border-t border-border pt-5"
			>
				<ServiceForm
					mode="add"
					bind:service={newService}
					bind:categories={localCategories}
					action="?/createService"
					useEnhance={true}
				/>
			</div>
		{/if}
	</div>

	<!-- Services Grouped by Categories List -->
	<div class="space-y-6">
		<div
			class="bg-card text-card-foreground shadow-md rounded-2xl border border-border overflow-hidden"
		>
			{#if enableCategories}
				<div
				use:dndzone={{
					items: localCategories,
					flipDurationMs,
					dragDisabled: editingCategoryId !== null,
				}}
				onconsider={handleDndConsider}
				onfinalize={handleDndFinalize}
				class="min-h-12.5 divide-y divide-border"
			>
				{#each localCategories as category (category.id)}
					{@const catId = category.id}
					{@const categoryName = category.name}

					<div
						animate:flip={{ duration: flipDurationMs }}
						class="flex flex-col bg-card"
					>
						<!-- Category Header -->
						<form
							method="POST"
							action="?/updateCategory"
							use:enhance={() => {
								return async ({ update }: any) => {
									await update();
									editingCategoryId = null;
								};
							}}
							use:clickOutside={{
								enabled: editingCategoryId === catId,
								handler: () => (editingCategoryId = null),
								ignore: ".edit-category-btn",
							}}
							class="px-5 py-3 border-b border-border bg-muted/50 flex flex-col md:flex-row justify-between items-start md:items-center {editingCategoryId === null ? 'cursor-move hover:bg-muted/70' : ''} transition-colors gap-3"
						>
							<input
								type="hidden"
								name="id"
								value={category.id}
							/>
							<div class="flex items-center gap-3 flex-1 w-full">
								{#if editingCategoryId === null}
									<GripHorizontal
										class="w-5 h-5 text-muted-foreground shrink-0"
									/>
								{/if}

								<div
									class="relative group shrink-0 flex items-center gap-2"
								>
									<div class="relative inline-flex">
										{#if catId === -1 && !category.icon}
											<ServiceIcon
												icon="fluent-emoji-high-contrast:ghost"
												name={category.name}
												iconStyle={$page.data.settings?.iconStyle}
												class="w-6 h-6 object-contain"
											/>
										{:else if category.icon}
											<ServiceIcon
												icon={category.icon}
												name={category.name}
												iconStyle={$page.data.settings?.iconStyle}
												class="w-6 h-6 object-contain"
											/>
										{:else}
											<Box
												class="w-6 h-6 text-muted-foreground"
											/>
										{/if}
										{#if editingCategoryId !== catId}
											<div class="absolute -bottom-2 -right-2 bg-muted text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-background z-10 shadow-sm leading-none">
												{groupedServices[catId]?.length || 0}
											</div>
										{/if}
									</div>

									{#if editingCategoryId === catId}
										<div class="w-50">
											<IconCombobox
												name="icon"
												bind:value={category.icon}
											/>
										</div>
									{/if}
								</div>

								{#if editingCategoryId === catId}
									<div class="w-48">
										<TextInput
											name="name"
											bind:value={category.name}
											placeholder="NOME CATEGORIA"
											required
										/>
									</div>
								{:else}
									<h4
										class="text-sm font-bold text-foreground uppercase tracking-wider truncate"
									>
										{categoryName}
									</h4>
								{/if}
							</div>

							<div
								class="flex items-center gap-2 self-end md:self-auto shrink-0"
							>
								{#if editingCategoryId !== catId}
									<div class="flex items-center gap-3">
										<div class="flex -space-x-2 mr-2">
											{#each (groupedServices[catId] || []).slice(0, 5) as service}
												<div class="relative group/tooltip">
													<ServiceIcon
														icon={service.iconDetails?.value || service.icon}
														name={service.name}
														iconStyle={$page.data.settings?.iconStyle}
														class="w-6 h-6 border border-background bg-card object-contain z-10"
													/>
												</div>
											{/each}
											{#if (groupedServices[catId]?.length || 0) > 5}
												<div
													class="w-6 h-6 rounded-full border border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground z-10"
												>
													+{(groupedServices[catId]
														?.length || 0) - 5}
												</div>
											{/if}
										</div>
									</div>
								{/if}

								{#if editingCategoryId === catId}
									<SaveButton
										type="submit"
										class="shadow-sm edit-category-btn"
										text=""
										title="Salva Categoria"
									/>
									<BackButton
										onclick={() => {
											editingCategoryId = null;
										}}
										class="shadow-sm edit-category-btn ml-1"
										text=""
										title="Annulla"
									/>
								{:else}
									<ConfirmDeleteButton
										class="edit-category-btn"
										onConfirm={async () => {
											await deleteCategory(catId);
											await invalidateAll();
										}}
									/>
									<button
										type="button"
										onclick={() =>
											(editingCategoryId = catId)}
										class="p-2 text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 rounded-lg shadow-sm edit-category-btn"
										title="Modifica Categoria"
									>
										<svg
											class="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
											></path>
										</svg>
									</button>
								{/if}
							</div>
						</form>

						<ul class="divide-y divide-border min-h-15">
							{#if !groupedServices[catId] || groupedServices[catId].length === 0}
								<li
									class="px-5 py-8 text-center text-sm font-medium text-muted-foreground uppercase tracking-wider opacity-70"
								>
									Nessun servizio in questa categoria
								</li>
							{/if}

							{#each groupedServices[catId] as service, i (service.id)}
								{@render serviceItem(service, catId, i)}
							{/each}
						</ul>
					</div>
				{/each}
				</div>
			{/if}

			{#if groupedServices[-1] && groupedServices[-1].length > 0}
				<div class="{enableCategories ? 'flex flex-col bg-card border-t border-border mt-0' : 'flex flex-col bg-card mt-0'}">
					<!-- Category Header for Phantom Category (hidden if categories disabled) -->
					{#if enableCategories}
					<div
						class="px-5 py-3 border-b border-border bg-muted/50 flex justify-between items-center transition-colors"
					>
						<div class="flex items-center gap-3">
							<div class="relative inline-flex">
								<ServiceIcon
									icon="fluent-emoji-high-contrast:ghost"
									name="Categoria Fantasma"
									iconStyle={$page.data.settings?.iconStyle}
									class="w-6 h-6 object-contain"
								/>
								<div class="absolute -bottom-2 -right-2 bg-muted text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-background z-10 shadow-sm leading-none">
									{groupedServices[-1].length}
								</div>
							</div>
							<h4
								class="text-sm font-bold text-foreground uppercase tracking-wider italic opacity-70"
							>
								CATEGORIA FANTASMA
							</h4>
						</div>
						<div class="flex items-center gap-3">
							<div class="flex -space-x-2 mr-2">
								{#each groupedServices[-1].slice(0, 5) as service}
									<div class="relative group/tooltip">
										<ServiceIcon
											icon={service.iconDetails?.value || service.icon}
											name={service.name}
											iconStyle={$page.data.settings?.iconStyle}
											class="w-6 h-6 border border-background bg-card object-contain z-10"
										/>
									</div>
								{/each}
								{#if groupedServices[-1].length > 5}
									<div
										class="w-6 h-6 rounded-full border border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground z-10"
									>
										+{groupedServices[-1].length - 5}
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}
				<ul class="divide-y divide-border min-h-15">
						{#each groupedServices[-1] as service, i (service.id)}
							{@render serviceItem(service, -1, i)}
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</div>
</div>
