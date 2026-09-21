import fs from 'fs';
let content = fs.readFileSync('src/lib/components/ui/DynamicWidgetForm.svelte', 'utf8');

const target1 = `<SaveButton class="w-32 h-10" onclick={handleSave} isLoading={isSaving} />`;
const replacement1 = `<div class="flex items-center justify-end gap-2 shrink-0">
						{#if onDelete}
							<ConfirmDeleteButton onConfirm={onDelete} disabled={isSaving} />
						{/if}
						{#if onCancel}
							<BackButton onclick={onCancel} disabled={isSaving} text="" title="ANNULLA" />
						{/if}
						<SaveButton class="w-32 h-10 shrink-0" onclick={handleSave} isLoading={isSaving} />
					</div>`;
content = content.replace(target1, replacement1);

const target2 = `<SaveButton class="w-32 h-10 shrink-0" onclick={handleSave} isLoading={isSaving} />`;
const replacement2 = `<div class="flex items-center justify-end gap-2 shrink-0">
				{#if onDelete}
					<ConfirmDeleteButton onConfirm={onDelete} disabled={isSaving} />
				{/if}
				{#if onCancel}
					<BackButton onclick={onCancel} disabled={isSaving} text="" title="ANNULLA" />
				{/if}
				<SaveButton class="w-32 h-10 shrink-0" onclick={handleSave} isLoading={isSaving} />
			</div>`;
content = content.replace(target2, replacement2);

fs.writeFileSync('src/lib/components/ui/DynamicWidgetForm.svelte', content);
