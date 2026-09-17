<script lang="ts">
	import { ArrowUpCircle, X } from "@lucide/svelte";
	import { slide } from "svelte/transition";
	import { clickOutside } from "$lib/actions/clickOutside";
	import ServiceIcon from "$lib/components/ui/ServiceIcon.svelte";
	import ConfirmDeleteButton from "$lib/components/ui/ConfirmDeleteButton.svelte";
	import ServiceForm from "$lib/components/ServiceForm.svelte";
	import { toast } from "svelte-sonner";

	let {
		service,
		catId,
		updateStatuses,
		editingServiceId = $bindable(),
		editingServiceClone = $bindable(),
		iconStyle,
		onDelete
	} = $props();

</script>

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
				<p class="text-sm font-bold text-foreground uppercase tracking-wider">
					{service.name}
				</p>
				<p class="text-xs text-muted-foreground font-medium truncate w-48 sm:w-64 md:w-auto">
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
					<span class="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-40 animate-ping"></span>
					<ArrowUpCircle class="w-5 h-5 animate-pulse relative" />
				</a>
			{/if}
			<ConfirmDeleteButton
					class="shrink-0"
					onConfirm={async () => {
						await onDelete(service.id);
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
			<div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-accent rounded-t-xl z-10"></div>
			<div class="p-5 bg-card text-card-foreground border border-border rounded-xl shadow-md">
				<ServiceForm
					mode="edit"
					bind:service={editingServiceClone}
					action="/admin?/updateService"
					useEnhance={true}
					hideDelete={true}
					hideCancel={true}
					enhanceFn={() => {
						return async ({ update, result }: any) => {
							await update();
							if (result.type === 'success') {
								toast.success("Servizio aggiornato!");
							} else if (result.type === 'failure') {
								toast.error("Errore nell'aggiornamento del servizio.");
							}
							editingServiceId = null;
						};
					}}
				/>
			</div>
		</div>
	{/if}
</li>
