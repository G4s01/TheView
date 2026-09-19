<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from "$lib/components/ui/card";
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import DynamicWidgetForm from '$lib/components/ui/DynamicWidgetForm.svelte';
	import { toast } from 'svelte-sonner';
	import { WIDGET_REGISTRY } from '$lib/config/widgetRegistry';

	let expandedStates = $state<Record<string, boolean>>({});
	let settingsValues = $state<Record<string, any>>({});
	let savingStates = $state<Record<string, boolean>>({});

	async function saveWidgetSettings(widgetId: string, values: Record<string, any>) {
		savingStates[widgetId] = true;
		
		// Only send the fields belonging to this widget
		const widgetDef = WIDGET_REGISTRY.find(w => w.id === widgetId);
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
			if (res.ok) toast.success(`Impostazioni ${widgetDef.name} salvate con successo!`);
			else toast.error('Errore durante il salvataggio.');
		} catch (e) {
			toast.error('Errore di rete.');
		} finally {
			savingStates[widgetId] = false;
		}
	}

	onMount(async () => {
		try {
			const res = await fetch('/api/settings');
			if (res.ok) {
				const data = await res.json();
				
				// Initialize settingsValues with empty strings or default values based on schema
				const initialValues: Record<string, any> = {};
				
				for (const widget of WIDGET_REGISTRY) {
					for (const field of widget.fields) {
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

<div class="space-y-6">
	<Card.Root class="border border-border bg-card shadow-sm overflow-hidden">
		<Card.Header class="pb-4 bg-muted/20 border-b border-border">
			<SettingsHeader
				title="IMPOSTAZIONI WIDGET"
				description="Configura le connessioni API e le credenziali per i widget interattivi della dashboard."
			/>
		</Card.Header>
		<Card.Content class="p-0">
			<ul class="divide-y divide-border">
				{#each WIDGET_REGISTRY as widget}
					<DynamicWidgetForm 
						{widget}
						bind:values={settingsValues}
						bind:isExpanded={expandedStates[widget.id]}
						onSave={(vals) => saveWidgetSettings(widget.id, vals)}
						isSaving={savingStates[widget.id] || false}
					/>
				{/each}
			</ul>
		</Card.Content>
	</Card.Root>
</div>
