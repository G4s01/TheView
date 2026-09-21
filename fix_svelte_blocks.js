import fs from 'fs';
let content = fs.readFileSync('src/lib/components/EditWidgetSettingsCard.svelte', 'utf8');

// The file currently has:
/*
{#if isStandalone}
	<div class="flex flex-col gap-4">
{:else}
<div class="mt-8 border-t border-border pt-8">
	<h3 class="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
		Impostazioni Widget
	</h3>
	<div class="bg-card text-card-foreground rounded-xl shadow-lg border border-border p-5 relative flex flex-col gap-4">
{/if}
... content ...
		</div>
{#if !isStandalone}
</div>
{/if}
*/

const replacement = `<div class={isStandalone ? "flex flex-col gap-4" : "mt-8 border-t border-border pt-8"}>
	{#if !isStandalone}
	<h3 class="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
		Impostazioni Widget
	</h3>
	{/if}
	<div class={isStandalone ? "" : "bg-card text-card-foreground rounded-xl shadow-lg border border-border p-5 relative flex flex-col gap-4"}>
`;

const target = /\{#if isStandalone\}[\s\S]*?\{#if !isStandalone\}\n<\/div>\n\{\/if\}/;

// Wait, I will just rewrite the bottom half using a regex that grabs the whole component starting from the {#if isStandalone}
// Actually, it's easier to just overwrite the entire template block since it's short.

