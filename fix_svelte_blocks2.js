import fs from 'fs';
let content = fs.readFileSync('src/lib/components/EditWidgetSettingsCard.svelte', 'utf8');

const target = `{#if isStandalone}
	<div class="flex flex-col gap-4">
{:else}
<div class="mt-8 border-t border-border pt-8">
	<h3 class="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
		Impostazioni Widget
	</h3>
	<div class="bg-card text-card-foreground rounded-xl shadow-lg border border-border p-5 relative flex flex-col gap-4">
{/if}
		{#if widgetDef}
			<DynamicWidgetForm 
				widget={widgetDef}
				bind:values={settingsValues}
				isExpanded={true}
				hideHeader={true}
				onSave={saveSettings}
				isSaving={isSaving}
				onDelete={onDelete}
				onCancel={onCancel}
			/>
		{:else}
			<p class="text-sm text-muted-foreground italic text-center py-4">
				Nessuna impostazione necessaria per questo widget.
			</p>
		{/if}
		</div>
{#if !isStandalone}
</div>
{/if}
`;

const replacement = `<div class={isStandalone ? "flex flex-col gap-4" : "mt-8 border-t border-border pt-8"}>
	{#if !isStandalone}
	<h3 class="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
		Impostazioni Widget
	</h3>
	{/if}
	<div class={isStandalone ? "relative flex flex-col gap-4 w-full" : "bg-card text-card-foreground rounded-xl shadow-lg border border-border p-5 relative flex flex-col gap-4"}>
		{#if widgetDef}
			<DynamicWidgetForm 
				widget={widgetDef}
				bind:values={settingsValues}
				isExpanded={true}
				hideHeader={true}
				onSave={saveSettings}
				isSaving={isSaving}
				onDelete={onDelete}
				onCancel={onCancel}
			/>
		{:else}
			<p class="text-sm text-muted-foreground italic text-center py-4">
				Nessuna impostazione necessaria per questo widget.
			</p>
		{/if}
	</div>
</div>
`;

content = content.replace(target, replacement);

fs.writeFileSync('src/lib/components/EditWidgetSettingsCard.svelte', content);
