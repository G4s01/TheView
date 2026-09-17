<script lang="ts">
	import AdminServiceRow from "./AdminServiceRow.svelte";
	import { slide } from "svelte/transition";
	import { onMount } from "svelte";
	import { Plus } from "@lucide/svelte";
	import ServiceForm from "$lib/components/ServiceForm.svelte";
	import { clickOutside } from "$lib/actions/clickOutside";
	import { page } from "$app/stores";
	import { toast } from "svelte-sonner";

	let { services } = $props();

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

	let newService = $state({
		name: "",
		url: "",
		icon: "",
		description: "",
		categoryId: null, // Legacy, or map to grid_id: null
		pingEnabled: true,
		widgetType: "",
		dockerImage: "",
	});

	let isAddServiceExpanded = $state(false);

	let sortedServices = $derived(
		[...services].filter(s => s && s.widgetType !== 'spacer').sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: 'base' }))
	);

	let iconStyle = $derived($page.data.settings?.iconStyle || "rounded-xl");
	
	async function handleDeleteService(id: number) {
		const formData = new FormData();
		formData.append("id", id.toString());
		try {
			const res = await fetch("?/deleteService", {
				method: "POST",
				body: formData,
			});
			if (res.ok) {
				toast.success("Servizio eliminato.");
				window.location.reload();
			} else {
				toast.error("Errore nell'eliminazione del servizio.");
			}
		} catch (e) {
			console.error(e);
			toast.error("Errore di rete.");
		}
	}
</script>

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
					action="?/createService"
					useEnhance={true}
					enhanceFn={() => {
						return async ({ update, result }: any) => {
							await update();
							if (result.type === 'success') {
								toast.success("Servizio aggiunto con successo! Lo troverai nell'Inbox della Dashboard.");
								isAddServiceExpanded = false;
								newService = {
									name: "",
									url: "",
									icon: "",
									description: "",
									categoryId: null,
									pingEnabled: true,
									widgetType: "",
									dockerImage: "",
								};
							} else if (result.type === 'failure') {
								toast.error("Errore nell'aggiunta del servizio.");
							}
						};
					}}
				/>
			</div>
		{/if}
	</div>

	<!-- Flat Services List -->
	<div class="space-y-6">
		<div class="bg-card text-card-foreground shadow-md rounded-2xl border border-border overflow-hidden">
			<ul class="divide-y divide-border min-h-15">
				{#if sortedServices.length === 0}
					<li class="px-5 py-8 text-center text-sm font-medium text-muted-foreground uppercase tracking-wider opacity-70">
						Nessun servizio presente
					</li>
				{/if}

				{#each sortedServices as service (service.id)}
					<AdminServiceRow
						{service}
						catId={service.categoryId}
						{updateStatuses}
						bind:editingServiceId
						bind:editingServiceClone
						{iconStyle}
						onDelete={handleDeleteService}
					/>
				{/each}
			</ul>
		</div>
	</div>
</div>

