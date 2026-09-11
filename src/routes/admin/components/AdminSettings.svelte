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

	import { page } from '$app/stores';

	// State for Appearance initialized directly from server data
	let showCategoriesDesktop = $state($page.data.settings?.showCategoriesDesktop !== false);
	let showCategoriesMobile = $state($page.data.settings?.showCategoriesMobile !== false);
	let customNavbarTitleDesktop = $state($page.data.settings?.customNavbarTitleDesktop || $page.data.settings?.customNavbarTitle || '');
	let customNavbarTitleMobile = $state($page.data.settings?.customNavbarTitleMobile || $page.data.settings?.customNavbarTitle || '');
	let showCategoryCounts = $state($page.data.settings?.showCategoryCounts !== false);
	let showServiceDescriptions = $state($page.data.settings?.showServiceDescriptions !== false);
	let iconStyle = $state($page.data.settings?.iconStyle || 'rounded-xl');
	let stickyNavbar = $state($page.data.settings?.stickyNavbar !== false);
	let showEditButton = $state($page.data.settings?.showEditButton !== false);
	let enableCategories = $state($page.data.settings?.enableCategories !== false);
	let isSavingAppearance = $state(false);

	async function saveAppearanceSettings() {
		isSavingAppearance = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ showCategoriesDesktop, showCategoriesMobile, customNavbarTitleDesktop, customNavbarTitleMobile, showCategoryCounts, showServiceDescriptions, iconStyle, stickyNavbar, showEditButton, enableCategories })
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
		bind:enableCategories
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
