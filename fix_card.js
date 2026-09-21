import fs from 'fs';
let content = fs.readFileSync('src/lib/components/EditWidgetSettingsCard.svelte', 'utf8');

// The file currently has:
/*
<!-- Se viene passato onCancel, siamo nel popup standalone (EditSheet) e non serve il bordo superiore -->
<div class={onCancel ? "" : "mt-8 border-t border-border pt-8"}>
	<h3 class="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
		Impostazioni Widget
	</h3>

	<div class="bg-card text-card-foreground rounded-xl shadow-lg border border-border p-5 relative flex flex-col gap-4">
		{#if widgetDef}
*/

const target = `<!-- Se viene passato onCancel, siamo nel popup standalone (EditSheet) e non serve il bordo superiore -->
<div class={onCancel ? "" : "mt-8 border-t border-border pt-8"}>
	<h3 class="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
		Impostazioni Widget
	</h3>

	<div class="bg-card text-card-foreground rounded-xl shadow-lg border border-border p-5 relative flex flex-col gap-4">`;

const replacement = `{#if isStandalone}
	<div class="flex flex-col gap-4">
{:else}
<div class="mt-8 border-t border-border pt-8">
	<h3 class="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
		Impostazioni Widget
	</h3>
	<div class="bg-card text-card-foreground rounded-xl shadow-lg border border-border p-5 relative flex flex-col gap-4">
{/if}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/lib/components/EditWidgetSettingsCard.svelte', content);
