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
		onConfirm?: () => void;
	}>({ show: false, title: '', message: '' });

	function showConfirm(title: string, message: string, onConfirm: () => void) {
		modalConfig = { show: true, title, message, onConfirm };
	}

	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';

	// State for Appearance initialized directly from server data
	let showCategoriesDesktop = $state($page.data.settings?.showCategoriesDesktop === 'true' || $page.data.settings?.showCategoriesDesktop === true);
	let showCategoriesMobile = $state($page.data.settings?.showCategoriesMobile === 'true' || $page.data.settings?.showCategoriesMobile === true);
	let customNavbarTitleDesktop = $state($page.data.settings?.customNavbarTitleDesktop || $page.data.settings?.customNavbarTitle || 'HOMELAB');
	let customNavbarTitleMobile = $state($page.data.settings?.customNavbarTitleMobile || $page.data.settings?.customNavbarTitle || 'HOMELAB');
	let showCategoryCounts = $state($page.data.settings?.showCategoryCounts === 'true' || $page.data.settings?.showCategoryCounts === true);
	let showServiceDescriptionsDesktop = $state(
		$page.data.settings?.showServiceDescriptionsDesktop === 'false' || $page.data.settings?.showServiceDescriptionsDesktop === false ? false :
		($page.data.settings?.showServiceDescriptionsDesktop === 'true' || $page.data.settings?.showServiceDescriptionsDesktop === true ? true :
		($page.data.settings?.showServiceDescriptions !== false))
	);
	let showServiceDescriptionsMobile = $state(
		$page.data.settings?.showServiceDescriptionsMobile === 'true' || $page.data.settings?.showServiceDescriptionsMobile === true
	);
	let iconStyle = $state($page.data.settings?.iconStyle || 'rounded-xl');
	let stickyNavbar = $state($page.data.settings?.stickyNavbar !== false);
	let showEditButton = $state($page.data.settings?.showEditButton !== false);
	let editModeSidebarPosition = $state($page.data.settings?.editModeSidebarPosition || 'right');
	let editServiceSheetPosition = $state($page.data.settings?.editServiceSheetPosition || 'left');
	let isSavingAppearance = $state(false);

	async function saveAppearanceSettings() {
		isSavingAppearance = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ showCategoriesDesktop, showCategoriesMobile, customNavbarTitleDesktop, customNavbarTitleMobile, showCategoryCounts, showServiceDescriptionsDesktop, showServiceDescriptionsMobile, iconStyle, stickyNavbar, showEditButton, editModeSidebarPosition, editServiceSheetPosition })
			});
			if (res.ok) {
				await invalidateAll();
				toast.success('Impostazioni salvate con successo');
			} else {
				toast.error('Errore durante il salvataggio.');
			}
		} catch (e) {
			toast.error('Errore di rete.');
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
		bind:showServiceDescriptionsDesktop bind:showServiceDescriptionsMobile
		bind:iconStyle
		bind:stickyNavbar
		bind:showEditButton
		bind:editModeSidebarPosition
		bind:editServiceSheetPosition
		{saveAppearanceSettings}
		{isSavingAppearance}
	/>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<SettingsSecurity />
		<SettingsBackup {showConfirm} />
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
		</div>
	{/snippet}
</BaseModal>
