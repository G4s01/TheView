import re

with open("src/lib/components/ServiceCard.svelte", "r") as f:
    content = f.read()

# 1. Imports
imports = """	import { appState } from '$lib/client/state.svelte';
	import QBittorrentWidget from './widgets/QBittorrentWidget.svelte';
	import TextInput from './ui/TextInput.svelte';
	import UrlInput from './ui/UrlInput.svelte';
	import SelectInput from './ui/SelectInput.svelte';
	import ToggleInput from './ui/ToggleInput.svelte';"""
content = re.sub(r"import \{ appState \} from '\$lib/client/state\.svelte';\n(\s*import QBittorrentWidget from './widgets/QBittorrentWidget\.svelte';)?", imports, content)

# 2. Props
old_props = """	let { service, liveStatus = null, onEdit } = $props<{
		service: {
			id: number;
			name: string;
			description: string | null;
			url: string;
			icon: string | null;
			pingEnabled: boolean;
			widgetType: string | null;
			categoryId?: number;
			iconDetails?: { hex: string, url: string, isCustomUrl?: boolean } | null;
		};
		liveStatus?: { isOnline: boolean; latencyMs?: number } | null;
		onEdit?: () => void;
	}>();"""

# wait, categoryId might not be optional, let's just replace the whole $props block using regex or string match
props_start = content.find("let { service")
props_end = content.find(">();", props_start) + 4
old_props_actual = content[props_start:props_end]

new_props = """	let { service, liveStatus = null, categories = [] } = $props<{
		service: {
			id: number;
			name: string;
			description: string | null;
			url: string;
			icon: string | null;
			pingEnabled: boolean;
			widgetType: string | null;
			categoryId?: number;
			iconDetails?: { hex: string, url: string, isCustomUrl?: boolean } | null;
		};
		liveStatus?: { isOnline: boolean; latencyMs?: number } | null;
		categories?: { id: number; name: string }[];
	}>();

	let isExpanded = $state(false);
	let editName = $state('');
	let editUrl = $state('');
	let editIcon = $state('');
	let editDesc = $state('');
	let editCat = $state<number | null>(null);
	let editPing = $state(false);
	let editWidget = $state('');
	let isSaving = $state(false);

	function startEdit() {
		editName = service.name;
		editUrl = service.url;
		editIcon = service.icon || '';
		editDesc = service.description || '';
		editCat = service.categoryId || null;
		editPing = service.pingEnabled ?? true;
		editWidget = service.widgetType || '';
		isExpanded = true;
	}

	async function saveEdit(e: Event) {
		e.preventDefault();
		isSaving = true;
		try {
			await fetch('/api/services/quick-edit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: service.id,
					name: editName,
					url: editUrl,
					icon: editIcon,
					description: editDesc,
					categoryId: editCat,
					pingEnabled: editPing,
					widgetType: editWidget
				})
			});
			window.location.reload();
		} catch (err) {
			console.error(err);
		} finally {
			isSaving = false;
		}
	}"""
content = content[:props_start] + new_props + content[props_end:]

# 3. Gear icon onClick -> startEdit()
content = content.replace("onclick={(e) => { e.preventDefault(); e.stopPropagation(); if (onEdit) onEdit(); }}", "onclick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(); }}")

# 4. <svelte:element> instead of <a>
# Find `<a` and replace with `<svelte:element this={appState.isEditMode ? 'div' : 'a'}`
content = content.replace("<a \n\thref={appState.isEditMode ? '#' : service.url}", "<svelte:element this={appState.isEditMode ? 'div' : 'a'}\n\thref={appState.isEditMode ? undefined : service.url}")
# also replace `</a>` with `</svelte:element>`
content = content.replace("</a>\n</div>", "</svelte:element>\n</div>")

# 5. Form vs Content
# Inside the <svelte:element>, right after its opening tag and `onclick`...
# It looks like:
# onclick={(e) => { if (appState.isEditMode) e.preventDefault(); }}
# >
# 	<div class="flex items-start justify-between">
# We want to replace `>\n\t<div class="flex items-start justify-between">` with:
# >
# 	{#if isExpanded}
#      [THE FORM]
#   {:else}
#      <div class="flex items-start justify-between">
form_html = """>
	{#if isExpanded}
		<form onsubmit={saveEdit} class="flex flex-col gap-4 w-full h-full justify-between" onclick={(e) => e.stopPropagation()}>
			<div class="space-y-4">
				<TextInput label="Nome" bind:value={editName} required />
				<UrlInput label="URL" bind:value={editUrl} required />
				
				<div class="flex gap-2 h-[42px] items-center">
					<div class="flex-1 min-w-0">
						<TextInput label="Icona (Es. server)" bind:value={editIcon} />
					</div>
					<label class="cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl px-4 flex items-center justify-center transition-colors shadow-sm shrink-0 h-full">
						<svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
						<input type="file" accept="image/png, image/svg+xml, image/jpeg" class="hidden" onchange={async (e) => {
							const target = e.target;
							const file = target?.files?.[0];
							if (!file) return;
							const formData = new FormData(); formData.append('file', file);
							const btn = target.parentElement; btn.classList.add('opacity-50');
							try {
								const res = await fetch('/api/icons', { method: 'POST', body: formData });
								const data = await res.json();
								if (data.url) editIcon = data.url;
							} catch (err) { console.error(err); } finally { btn.classList.remove('opacity-50'); }
						}} />
					</label>
				</div>
				
				<TextInput label="Descrizione" bind:value={editDesc} />
				
				<SelectInput label="Categoria" bind:value={editCat} required>
					{#each categories as cat}
						<option value={cat.id}>{cat.name}</option>
					{/each}
				</SelectInput>
				
				<div class="flex gap-4">
					<div class="flex-1">
						<SelectInput label="Widget" bind:value={editWidget}>
							<option value="">Nessuno</option>
							<option value="qbittorrent">qBittorrent</option>
						</SelectInput>
					</div>
					<div class="flex-1 flex justify-end items-center">
						<ToggleInput label="Ping" bind:checked={editPing} />
					</div>
				</div>
			</div>
			
			<div class="flex justify-end space-x-2 mt-4">
				<button type="button" onclick={() => isExpanded = false} class="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
					Annulla
				</button>
				<button type="submit" disabled={isSaving} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/30 text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50">
					{isSaving ? '...' : 'Salva'}
				</button>
			</div>
		</form>
	{:else}
		<div class="flex items-start justify-between">"""

# Replace
content = content.replace(">\n\t<div class=\"flex items-start justify-between\">", form_html)

# And close the {:else} block at the very end before </svelte:element>
content = content.replace("\t{/if}\n</svelte:element>", "\t{/if}\n\t{/if}\n</svelte:element>")

with open("src/lib/components/ServiceCard.svelte", "w") as f:
    f.write(content)
