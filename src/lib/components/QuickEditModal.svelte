<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	let { show, service, onClose, onSuccess } = $props<{
		show: boolean;
		service: { id: number; name: string; url: string; icon: string | null } | null;
		onClose: () => void;
		onSuccess: () => void;
	}>();

	let name = $state('');
	let url = $state('');
	let icon = $state('');
	let loading = $state(false);
	let error = $state('');

	$effect(() => {
		if (show && service) {
			name = service.name;
			url = service.url;
			icon = service.icon || '';
			error = '';
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!service) return;
		loading = true;
		error = '';

		try {
			const res = await fetch('/api/services/quick-edit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: service.id, name, url, icon })
			});

			if (!res.ok) throw new Error('Network response was not ok');
			onSuccess();
		} catch (err) {
			error = 'Failed to update service';
		} finally {
			loading = false;
		}
	}
</script>

{#if show}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={onClose}
	>
		<div 
			class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
			transition:scale={{ duration: 200, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
		>
			<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
				<h3 class="text-lg font-medium text-gray-900 dark:text-white">Modifica Rapida</h3>
			</div>

			<form onsubmit={handleSubmit} class="p-6 space-y-4">
				{#if error}
					<div class="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg">
						{error}
					</div>
				{/if}

				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
					<input
						type="text"
						id="name"
						bind:value={name}
						required
						class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
					/>
				</div>
				
				<div>
					<label for="url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">URL</label>
					<input
						type="url"
						id="url"
						bind:value={url}
						required
						class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
					/>
				</div>

				<div>
					<label for="icon" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Icona (SimpleIcons o Custom)</label>
					<div class="mt-1 flex space-x-2">
						<input
							type="text"
							id="icon"
							bind:value={icon}
							placeholder="es. server o carica ->"
							class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
						/>
						<label class="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 flex items-center justify-center transition-colors shadow-sm">
							<svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
							</svg>
							<input type="file" accept="image/png, image/svg+xml, image/jpeg" class="hidden" onchange={async (e) => {
								const target = e.target as HTMLInputElement;
								const file = target?.files?.[0];
								if (!file) return;
								
								const formData = new FormData();
								formData.append('file', file);
								
								const btn = target.parentElement as HTMLElement;
								btn.classList.add('opacity-50');
								
								try {
									const res = await fetch('/api/icons', { method: 'POST', body: formData });
									const data = await res.json();
									if (data.url) {
										icon = data.url;
									}
								} catch (err) {
									console.error(err);
								} finally {
									btn.classList.remove('opacity-50');
								}
							}} />
						</label>
					</div>
				</div>

				<div class="mt-6 flex justify-end space-x-3">
					<button
						type="button"
						onclick={onClose}
						class="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
					>
						<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Annulla
					</button>
					<button
						type="submit"
						disabled={loading}
						class="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
					>
						{#if loading}
							Salvataggio...
						{:else}
							<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Salva
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
