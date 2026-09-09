<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	
	import SettingsTheme from './SettingsTheme.svelte';
	import SettingsAppearance from './SettingsAppearance.svelte';
	import SettingsSecurity from './SettingsSecurity.svelte';
	import SettingsBackup from './SettingsBackup.svelte';
	import SettingsSystem from './SettingsSystem.svelte';
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

	function showConfirm(title: string, message: string, onConfirm: () => void) {
		modalConfig = { show: true, title, message, type: 'confirm', onConfirm };
	}

	// State for Appearance
	let showCategoriesDesktop = $state(true);
	let showCategoriesMobile = $state(true);
	let customNavbarTitleDesktop = $state('');
	let customNavbarTitleMobile = $state('');
	let showCategoryCounts = $state(true);
	let showServiceDescriptions = $state(true);
	let iconStyle = $state('rounded-xl');
	let stickyNavbar = $state(true);
	let showEditButton = $state(true);
	let isSavingAppearance = $state(false);

	async function saveAppearanceSettings() {
		isSavingAppearance = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ showCategoriesDesktop, showCategoriesMobile, customNavbarTitleDesktop, customNavbarTitleMobile, showCategoryCounts, showServiceDescriptions, iconStyle, stickyNavbar, showEditButton })
			});
			if (res.ok) {
				await invalidateAll();
			} else {
				showAlert('Errore', 'Errore durante il salvataggio.');
			}
		} catch (e) {
			showAlert('Errore', 'Errore di rete.');
		} finally {
			isSavingAppearance = false;
		}
	}

	// State for System
	let versionInfo = $state<any>({});
	let isCheckingVersion = $state(false);

	async function checkVersion(force = false) {
		isCheckingVersion = true;
		try {
			const res = await fetch(`/api/version${force ? '?force=1' : ''}`);
			if (res.ok) {
				versionInfo = await res.json();
			}
		} catch (e) {}
		isCheckingVersion = false;
	}

	onMount(async () => {
		checkVersion();
		try {
			const res = await fetch('/api/settings');
			if (res.ok) {
				const data = await res.json();
				showCategoriesDesktop = data.showCategoriesDesktop !== false;
				showCategoriesMobile = data.showCategoriesMobile !== false;
				
				customNavbarTitleDesktop = data.customNavbarTitleDesktop || data.customNavbarTitle || '';
				customNavbarTitleMobile = data.customNavbarTitleMobile || data.customNavbarTitle || '';
				
				showCategoryCounts = data.showCategoryCounts !== false;
				showServiceDescriptions = data.showServiceDescriptions !== false;
				iconStyle = data.iconStyle || 'rounded-xl';
				stickyNavbar = data.stickyNavbar !== false;
				showEditButton = data.showEditButton !== false;
			}
		} catch (e) {
			console.error(e);
		}
	});
</script>

<div class="space-y-6">
	<SettingsTheme />

	<SettingsAppearance 
		bind:showCategoriesDesktop
		bind:showCategoriesMobile
		bind:customNavbarTitleDesktop
		bind:customNavbarTitleMobile
		bind:showCategoryCounts
		bind:showServiceDescriptions
		bind:iconStyle
		bind:stickyNavbar
		bind:showEditButton
		{saveAppearanceSettings}
		{isSavingAppearance}
	/>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<SettingsSecurity {showAlert} />
		<SettingsBackup {showAlert} {showConfirm} />
	</div>

	<SettingsSystem 
		{versionInfo}
		{isCheckingVersion}
		{checkVersion}
	/>
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
		<div class="flex justify-end space-x-3 w-full">
			{#if modalConfig.type === 'confirm'}
				<button 
					type="button" 
					onclick={() => modalConfig.show = false}
					class="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors border border-border"
				>
					Annulla
				</button>
				<button 
					type="button" 
					onclick={() => {
						modalConfig.show = false;
						if (modalConfig.onConfirm) modalConfig.onConfirm();
					}}
					class="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-lg shadow-sm transition-colors"
				>
					Procedi
				</button>
			{:else}
				<button 
					type="button" 
					onclick={() => modalConfig.show = false}
					class="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors"
				>
					OK
				</button>
			{/if}
		</div>
	{/snippet}
</BaseModal>
