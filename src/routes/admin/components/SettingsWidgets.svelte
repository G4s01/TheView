<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import SettingsQBittorrentWidget from './SettingsQBittorrentWidget.svelte';
	import SettingsAdGuardWidget from './SettingsAdGuardWidget.svelte';

	let {
		qbit_username = $bindable(),
		qbit_password = $bindable(),
		qbit_url = $bindable(),
		qbit_require_auth = $bindable(),
		qbit_separate_cells = $bindable(),
		saveQbitSettings,
		isSavingQbit,
		adguard_username = $bindable(),
		adguard_password = $bindable(),
		adguard_url = $bindable(),
		adguard_require_auth = $bindable(),
		adguard_separate_cells = $bindable(),
		saveAdGuardSettings,
		isSavingAdGuard
	} = $props<{
		qbit_username: string;
		qbit_password: string;
		qbit_url: string;
		qbit_require_auth: boolean;
		qbit_separate_cells: boolean;
		saveQbitSettings: () => void;
		isSavingQbit: boolean;
		adguard_username: string;
		adguard_password: string;
		adguard_url: string;
		adguard_require_auth: boolean;
		adguard_separate_cells: boolean;
		saveAdGuardSettings: () => void;
		isSavingAdGuard: boolean;
	}>();
</script>

<Card.Root>
	<SettingsHeader 
		title="WIDGET" 
		description="CONFIGURA I WIDGET DISPONIBILI"
	>
		{#snippet icon()}
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
			</svg>
		{/snippet}
	</SettingsHeader>
	<Card.Content class="p-0">
		<ul class="divide-y divide-border">
			<SettingsQBittorrentWidget
				bind:qbit_username
				bind:qbit_password
				bind:qbit_url
				bind:qbit_require_auth
				bind:qbit_separate_cells
				{saveQbitSettings}
				{isSavingQbit}
			/>
			<SettingsAdGuardWidget
				bind:adguard_username
				bind:adguard_password
				bind:adguard_url
				bind:adguard_require_auth
				bind:adguard_separate_cells
				{saveAdGuardSettings}
				{isSavingAdGuard}
			/>
		</ul>
	</Card.Content>
</Card.Root>

