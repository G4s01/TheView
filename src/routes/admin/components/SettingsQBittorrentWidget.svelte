<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import UrlInput from '$lib/components/ui/UrlInput.svelte';
	import ToggleInput from '$lib/components/ui/ToggleInput.svelte';
	import { Eye, EyeOff, Pencil, Plus, X } from "@lucide/svelte";
	import SaveButton from "$lib/components/ui/SaveButton.svelte";
	import ServiceIcon from '$lib/components/ui/ServiceIcon.svelte';
	import { clickOutside } from '$lib/actions/clickOutside';

	let {
		qbit_username = $bindable(),
		qbit_password = $bindable(),
		qbit_url = $bindable(),
		qbit_require_auth = $bindable(false),
		qbit_separate_cells = $bindable(false),
		saveQbitSettings,
		isSavingQbit
	} = $props<{
		qbit_username: string;
		qbit_password: string;
		qbit_url: string;
		qbit_require_auth: boolean;
		qbit_separate_cells: boolean;
		saveQbitSettings: () => void;
		isSavingQbit: boolean;
	}>();

	let showQbitPassword = $state(false);
	let isExpanded = $state(false);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<li id="qbit-row" class="px-6 py-5 hover:bg-muted/50 transition-colors flex flex-col gap-4 cursor-pointer qbit-row" onclick={() => isExpanded = !isExpanded}>
	<div class="flex items-center justify-between w-full">
		<div class="flex items-center gap-4 flex-1 min-w-0 mr-4">
			<div class="shrink-0">
				<ServiceIcon icon="qbittorrent" name="qBittorrent" size="lg" iconStyle="rounded-xl" class="shadow-sm border border-border bg-card" />
			</div>
			<div class="flex flex-col sm:flex-row sm:items-center sm:gap-3 flex-1 min-w-0">
				<p class="text-sm font-semibold text-foreground uppercase tracking-wider truncate">qBittorrent</p>
			</div>
		</div>
		
		<div>
			<button id="edit-qbit-btn" type="button" onclick={(e: Event) => { e.stopPropagation(); isExpanded = !isExpanded; }} class="inline-flex items-center justify-center w-10 h-10 border border-transparent rounded-full shadow-sm transition-all duration-300 {isExpanded ? 'bg-muted text-muted-foreground hover:bg-accent' : 'bg-primary text-primary-foreground hover:opacity-90'} focus:outline-none hover:scale-110 edit-qbit-btn">
				<div class="relative w-5 h-5">
					<Pencil class="absolute top-0 left-0 w-4 h-4 transition-all duration-300 {isExpanded ? 'opacity-60' : ''}" strokeWidth={2.5} />
					{#if isExpanded}
						<X class="absolute -bottom-1 -right-1 w-3.5 h-3.5 shadow-sm" strokeWidth={3} />
					{:else}
						<Plus class="absolute -bottom-1 -right-1 w-3.5 h-3.5 shadow-sm" strokeWidth={3} />
					{/if}
				</div>
			</button>
		</div>
	</div>
	
	{#if isExpanded}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="w-full mt-2 relative" use:clickOutside={{ enabled: isExpanded, handler: () => isExpanded = false, ignore: '#edit-qbit-btn, #qbit-row' }}>
			<div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-accent rounded-t-xl z-10"></div>
			<div class="p-5 bg-card text-card-foreground rounded-xl shadow-lg border border-border relative flex flex-col gap-4" onclick={(e) => e.stopPropagation()} role="presentation">
				<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
					<div class="md:col-span-6 h-10">
						<TextInput label="Username (es. admin)" bind:value={qbit_username} />
					</div>
					<div class="md:col-span-6 h-10">
						<TextInput label="Password (es. adminadmin)" type={showQbitPassword ? "text" : "password"} bind:value={qbit_password} class="pr-10">
							<button type="button" onclick={() => showQbitPassword = !showQbitPassword} class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors">
								{#if showQbitPassword}
									<EyeOff class="h-5 w-5" strokeWidth={1.5} />
								{:else}
									<Eye class="h-5 w-5" strokeWidth={1.5} />
								{/if}
							</button>
						</TextInput>
					</div>
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
					<div class="md:col-span-10 h-10">
						<UrlInput label="ES. 172.17.0.1:8080" bind:value={qbit_url} />
					</div>
					<div class="md:col-span-2 h-10">
						<SaveButton class="w-full h-10" onclick={saveQbitSettings} isLoading={isSavingQbit} />
					</div>
				</div>

				<div class="flex gap-4 items-center mt-2">
					<ToggleInput label="AUTENTICAZIONE ATTESA" bind:checked={qbit_require_auth} />
					<ToggleInput label="SEPARAZIONE VISIVA" bind:checked={qbit_separate_cells} />
				</div>
			</div>
		</div>
	{/if}
</li>
