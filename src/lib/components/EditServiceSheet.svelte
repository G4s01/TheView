<script lang="ts">
    import * as Sheet from '$lib/components/ui/sheet/index';
    import { appState } from '$lib/client/state.svelte';
    import ServiceForm from '$lib/components/ServiceForm.svelte';
    import { invalidateAll } from '$app/navigation';
    import ServiceIcon from '$lib/components/ui/ServiceIcon.svelte';

    import { page } from "$app/stores";

    let open = $derived(appState.editingServiceId !== null);
    
    let isSaving = $state(false);
    let sidePosition = $derived($page.data.editServiceSheetPosition === 'left' ? 'left' as const : 'right' as const);

    function onOpenChange(newOpen: boolean) {
        if (!newOpen) {
            appState.editingServiceId = null;
            appState.editingService = null;
        }
    }

    async function saveEdit(e: Event) {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        form.classList.remove('show-errors');
        if (!form.checkValidity()) {
            void form.offsetWidth;
            form.classList.add('show-errors');
            return;
        }
        isSaving = true;
        try {
            const res = await fetch('/api/services/quick-edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appState.editingService)
            });
            if (res.ok) {
                appState.editingServiceId = null;
                appState.editingService = null;
                await invalidateAll();
            }
        } catch (err) {
            console.error(err);
        } finally {
            isSaving = false;
        }
    }

    async function deleteService() {
        if (!appState.editingServiceId) return;
        isSaving = true;
        const formData = new FormData();
        formData.append('id', appState.editingServiceId.toString());
        try {
            await fetch('/admin?/deleteService', { method: 'POST', body: formData });
            appState.editingServiceId = null;
            appState.editingService = null;
            await invalidateAll();
        } catch (err) {
            console.error(err);
        } finally {
            isSaving = false;
        }
    }
</script>

<Sheet.Root {open} {onOpenChange}>
    <Sheet.Content side={sidePosition} class="w-[95vw]! sm:w-[90vw]! sm:max-w-none! md:w-200! md:max-w-200! overflow-y-auto p-4 sm:p-6 bg-muted/20">
        {#if appState.editingService}
            <div class="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-6">
                <Sheet.Header>
                    <Sheet.Title class="text-xl font-bold uppercase tracking-wider text-foreground">
                        Modifica {appState.editingService.name}
                    </Sheet.Title>
                    <Sheet.Description class="sr-only">
                        Modifica le impostazioni di questo servizio.
                    </Sheet.Description>
                </Sheet.Header>
                
                <div class="pb-2">
                    {#snippet iconSlot()}
                        <div class="size-12 rounded-xl flex items-center justify-center bg-muted border border-border shadow-inner">
                            <ServiceIcon name={appState.editingService.name} icon={appState.editingService.icon} />
                        </div>
                    {/snippet}

                    <ServiceForm 
                        mode="edit" 
                        bind:service={appState.editingService} 
                        {isSaving}
                        {iconSlot}
                        onSubmit={saveEdit} 
                        onCancel={() => onOpenChange(false)} 
                        onDelete={deleteService} 
                    />
                </div>
            </div>
        {/if}
    </Sheet.Content>
</Sheet.Root>

