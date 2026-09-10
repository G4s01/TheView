<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from "$lib/components/ui/card";
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import SettingsQBittorrentWidget from './SettingsQBittorrentWidget.svelte';
	import SettingsAdGuardWidget from './SettingsAdGuardWidget.svelte';
	import BaseModal from '$lib/components/ui/BaseModal.svelte';

	let modalConfig = $state<{
		show: boolean;
		title: string;
		message: string;
		type: 'alert' | 'confirm';
		onConfirm?: () => void;
	}>({ show: false, title: '', message: '', type: 'alert' });

	function showAlert(title: string, message: string) {
		modalConfig = { show: true, title, message, type: 'alert' };
	}

	let qbit_url = $state('');
	let qbit_username = $state('');
	let qbit_password = $state('');
	let qbit_require_auth = $state(false);
	let qbit_separate_cells = $state(false);
	let isSavingQbit = $state(false);

	async function saveQbitSettings() {
		isSavingQbit = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ qbit_url, qbit_username, qbit_password, qbit_require_auth, qbit_separate_cells })
			});
			if (res.ok) showAlert('Successo', 'Impostazioni qBittorrent salvate con successo!');
			else showAlert('Errore', 'Errore durante il salvataggio.');
		} catch (e) {
			showAlert('Errore', 'Errore di rete.');
		} finally {
			isSavingQbit = false;
		}
	}

	let adguard_url = $state('');
	let adguard_username = $state('');
	let adguard_password = $state('');
	let adguard_require_auth = $state(false);
	let adguard_separate_cells = $state(false);
	let isSavingAdGuard = $state(false);

	async function saveAdGuardSettings() {
		isSavingAdGuard = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ adguard_url, adguard_username, adguard_password, adguard_require_auth, adguard_separate_cells })
			});
			if (res.ok) showAlert('Successo', 'Impostazioni AdGuard salvate con successo!');
			else showAlert('Errore', 'Errore durante il salvataggio.');
		} catch (e) {
			showAlert('Errore', 'Errore di rete.');
		} finally {
			isSavingAdGuard = false;
		}
	}

	onMount(async () => {
		try {
			const res = await fetch('/api/settings');
			if (res.ok) {
				const data = await res.json();
				qbit_url = data.qbit_url || '';
				qbit_username = data.qbit_username || '';
				qbit_password = data.qbit_password || '';
				qbit_require_auth = data.qbit_require_auth === true || data.qbit_require_auth === 'true';
				qbit_separate_cells = data.qbit_separate_cells === true || data.qbit_separate_cells === 'true';
				adguard_url = data.adguard_url || '';
				adguard_username = data.adguard_username || '';
				adguard_password = data.adguard_password || '';
				adguard_require_auth = data.adguard_require_auth === true || data.adguard_require_auth === 'true';
				adguard_separate_cells = data.adguard_separate_cells === true || data.adguard_separate_cells === 'true';
			}
		} catch (e) {
			console.error(e);
		}
	});
</script>

<div class="flex flex-col gap-6">
	<Card.Root>
		<SettingsHeader 
			title="WIDGET" 
			description="CONFIGURA I WIDGET DISPONIBILI"
		>
			{#snippet icon()}
				<svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
</div>

<BaseModal 
	bind:open={modalConfig.show} 
	title={modalConfig.title} 
	description={modalConfig.message}
>
	{#snippet children()}
		<div></div>
	{/snippet}
	{#snippet footer()}
		<div class="flex justify-end gap-3 w-full">
			<button 
				type="button" 
				onclick={() => modalConfig.show = false}
				class="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors"
			>
				OK
			</button>
		</div>
	{/snippet}
</BaseModal>
