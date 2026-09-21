<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { WIDGET_REGISTRY } from '$lib/config/widgetRegistry';
	import DynamicWidgetForm from '$lib/components/ui/DynamicWidgetForm.svelte';
	import { invalidateAll } from '$app/navigation';
	import { useQueryClient } from '@tanstack/svelte-query';

	let { widgetType } = $props<{
		widgetType: string;
	}>();

	let settingsValues = $state<Record<string, any>>({});
	let isSaving = $state(false);
	const queryClient = useQueryClient();

	let widgetDef = $derived(WIDGET_REGISTRY.find(w => w.id === widgetType));

	async function saveSettings(values: Record<string, any>) {
		isSaving = true;
		
		if (!widgetDef) return;
		
		const payload: Record<string, any> = {};
		for (const field of widgetDef.fields) {
			payload[field.id] = values[field.id];
		}
		
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (res.ok) {
				toast.success(`Impostazioni ${widgetDef.name} salvate con successo!`);
				await invalidateAll();
				queryClient.invalidateQueries();
			}
			else toast.error('Errore durante il salvataggio.');
		} catch (e) {
			toast.error('Errore di rete.');
		} finally {
			isSaving = false;
		}
	}

	onMount(async () => {
		try {
			const res = await fetch('/api/settings');
			if (res.ok) {
				const data = await res.json();
				
				const initialValues: Record<string, any> = {};
				
				if (widgetDef) {
					for (const field of widgetDef.fields) {
						if (data[field.id] !== undefined) {
							if (field.type === 'checkbox') {
								initialValues[field.id] = data[field.id] === true || data[field.id] === 'true';
							} else {
								initialValues[field.id] = data[field.id];
							}
						} else {
							if (field.type === 'checkbox') {
								initialValues[field.id] = false;
							} else if (field.type === 'select' && field.options) {
								initialValues[field.id] = field.options[0].value;
							} else {
								initialValues[field.id] = '';
							}
						}
					}
				}
				settingsValues = initialValues;
			}
		} catch (e) {}
	});
</script>

<div class="mt-8 border-t border-border pt-8">
	<h3 class="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
		Impostazioni Widget
	</h3>

	<div class="bg-card text-card-foreground rounded-xl shadow-lg border border-border p-5 relative flex flex-col gap-4">
		{#if widgetDef}
			<DynamicWidgetForm 
				widget={widgetDef}
				bind:values={settingsValues}
				isExpanded={true}
				hideHeader={true}
				onSave={saveSettings}
				isSaving={isSaving}
			/>
		{:else}
			<p class="text-sm text-muted-foreground italic text-center py-4">
				Nessuna impostazione necessaria per questo widget.
			</p>
		{/if}
	</div>
</div>
