<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from "$lib/components/ui/card";
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import WidgetSettingsForm from './WidgetSettingsForm.svelte';
	import { toast } from 'svelte-sonner';

	let expandedStates = $state({ qbit: false, adguard: false, beszel: false, wgeasy: false, duplicati: false, docker: false });

	let qbit_url = $state('');
	let qbit_username = $state('');
	let qbit_password = $state('');
	let qbit_require_auth = $state(false);
	let isSavingQbit = $state(false);

	async function saveQbitSettings() {
		isSavingQbit = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ qbit_url, qbit_username, qbit_password, qbit_require_auth })
			});
			if (res.ok) toast.success('Impostazioni qBittorrent salvate con successo!');
			else toast.error('Errore durante il salvataggio.');
		} catch (e) {
			toast.error('Errore di rete.');
		} finally {
			isSavingQbit = false;
		}
	}

	let adguard_url = $state('');
	let adguard_username = $state('');
	let adguard_password = $state('');
	let adguard_require_auth = $state(false);
	let isSavingAdGuard = $state(false);

	async function saveAdGuardSettings() {
		isSavingAdGuard = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ adguard_url, adguard_username, adguard_password, adguard_require_auth })
			});
			if (res.ok) toast.success('Impostazioni AdGuard salvate con successo!');
			else toast.error('Errore durante il salvataggio.');
		} catch (e) {
			toast.error('Errore di rete.');
		} finally {
			isSavingAdGuard = false;
		}
	}

	let beszel_url = $state('');
	let beszel_username = $state('');
	let beszel_password = $state('');
	let isSavingBeszel = $state(false);

	async function saveBeszelSettings() {
		isSavingBeszel = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ beszel_url, beszel_username, beszel_password })
			});
			if (res.ok) toast.success('Impostazioni Beszel salvate con successo!');
			else toast.error('Errore durante il salvataggio.');
		} catch (e) {
			toast.error('Errore di rete.');
		} finally {
			isSavingBeszel = false;
		}
	}

	let wgeasy_url = $state('');
	let wgeasy_password = $state('');
	let isSavingWgEasy = $state(false);

	async function saveWgEasySettings() {
		isSavingWgEasy = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ wgeasy_url, wgeasy_password })
			});
			if (res.ok) toast.success('Impostazioni Wg-easy salvate con successo!');
			else toast.error('Errore durante il salvataggio.');
		} catch (e) {
			toast.error('Errore di rete.');
		} finally {
			isSavingWgEasy = false;
		}
	}

	let duplicati_url = $state('');
	let duplicati_password = $state('');
	let isSavingDuplicati = $state(false);

	async function saveDuplicatiSettings() {
		isSavingDuplicati = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ duplicati_url, duplicati_password })
			});
			if (res.ok) toast.success('Impostazioni Duplicati salvate con successo!');
			else toast.error('Errore durante il salvataggio.');
		} catch (e) {
			toast.error('Errore di rete.');
		} finally {
			isSavingDuplicati = false;
		}
	}

	let docker_socket_path = $state('');
	let isSavingDocker = $state(false);

	async function saveDockerSettings() {
		isSavingDocker = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ docker_socket_path })
			});
			if (res.ok) toast.success('Impostazioni Docker salvate con successo!');
			else toast.error('Errore durante il salvataggio.');
		} catch (e) {
			toast.error('Errore di rete.');
		} finally {
			isSavingDocker = false;
		}
	}

	let dockhandUrl = $state('');
	let dockhandUsername = $state('');
	let dockhandPassword = $state('');
	let isDockhandEditing = $state(true);
	let showDockhandPassword = $state(false);

	async function saveDockhandSettings() {
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ dockhand_url: dockhandUrl, dockhand_username: dockhandUsername, dockhand_password: dockhandPassword })
			});
			if (res.ok) {
				toast.success('Impostazioni Dockhand salvate con successo!');
				isDockhandEditing = false;
				showDockhandPassword = false;
			}
			else toast.error('Errore durante il salvataggio.');
		} catch (e) {
			toast.error('Errore di rete.');
		}
	}

	async function confirmDockhandDisconnect() {
		dockhandUrl = ''; dockhandUsername = ''; dockhandPassword = '';
		isDockhandEditing = true;
		showDockhandPassword = false;
		await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dockhand_url: '', dockhand_username: '', dockhand_password: '' }) });
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
				adguard_url = data.adguard_url || '';
				adguard_username = data.adguard_username || '';
				adguard_password = data.adguard_password || '';
				adguard_require_auth = data.adguard_require_auth === true || data.adguard_require_auth === 'true';
				beszel_url = data.beszel_url || '';
				beszel_username = data.beszel_username || '';
				beszel_password = data.beszel_password || '';
				wgeasy_url = data.wgeasy_url || '';
				wgeasy_password = data.wgeasy_password || '';
				duplicati_url = data.duplicati_url || '';
				duplicati_password = data.duplicati_password || '';
				docker_socket_path = data.docker_socket_path || '/var/run/docker.sock';
				dockhandUrl = data.dockhand_url || '';
				dockhandUsername = data.dockhand_username || '';
				dockhandPassword = data.dockhand_password || '';
				isDockhandEditing = !dockhandUrl;
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
				<WidgetSettingsForm
					title="qBittorrent"
					icon="qbittorrent"
					usernameLabel="Username (es. admin)"
					passwordLabel="Password (es. adminadmin)"
					urlLabel="ES. 172.17.0.1:8080"
					bind:username={qbit_username}
					bind:password={qbit_password}
					bind:url={qbit_url}
					bind:requireAuth={qbit_require_auth}
					bind:isExpanded={expandedStates.qbit}
					onSave={saveQbitSettings}
					isSaving={isSavingQbit}
				/>
				<WidgetSettingsForm
					title="AdGuard Home"
					icon="adguard-home"
					usernameLabel="Username"
					passwordLabel="Password"
					urlLabel="ES. 172.17.0.1:8086"
					bind:username={adguard_username}
					bind:password={adguard_password}
					bind:url={adguard_url}
					bind:requireAuth={adguard_require_auth}
					bind:isExpanded={expandedStates.adguard}
					onSave={saveAdGuardSettings}
					isSaving={isSavingAdGuard}
				/>
				<WidgetSettingsForm
					title="Beszel"
					icon="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/beszel.svg"
					usernameLabel="Admin Email"
					passwordLabel="Admin Password"
					urlLabel="PocketBase URL (es. http://192.168.1.10:8090)"
					bind:username={beszel_username}
					bind:password={beszel_password}
					bind:url={beszel_url}
					bind:isExpanded={expandedStates.beszel}
					onSave={saveBeszelSettings}
					isSaving={isSavingBeszel}
					requireAuth={false}
				/>
				<WidgetSettingsForm
					title="Wg-easy"
					icon="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/wireguard.svg"
					passwordLabel="Admin Password"
					urlLabel="Wg-easy URL (es. http://192.168.1.10:51821)"
					hideUsername={true}
					bind:password={wgeasy_password}
					bind:url={wgeasy_url}
					bind:isExpanded={expandedStates.wgeasy}
					onSave={saveWgEasySettings}
					isSaving={isSavingWgEasy}
					requireAuth={false}
				/>
				<WidgetSettingsForm
					title="Duplicati"
					icon="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/duplicati.svg"
					passwordLabel="Admin Password"
					urlLabel="Duplicati URL (es. http://192.168.1.10:8200)"
					hideUsername={true}
					bind:password={duplicati_password}
					bind:url={duplicati_url}
					bind:isExpanded={expandedStates.duplicati}
					onSave={saveDuplicatiSettings}
					isSaving={isSavingDuplicati}
					requireAuth={false}
				/>
				<WidgetSettingsForm
					title="Docker"
					icon="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/docker.svg"
					urlLabel="Socket o TCP URL (es. /var/run/docker.sock oppure tcp://10.0.0.5:2375)"
					hideUsername={true}
					hidePassword={true}
					bind:url={docker_socket_path}
					bind:isExpanded={expandedStates.docker}
					onSave={saveDockerSettings}
					isSaving={isSavingDocker}
					requireAuth={false}
				/>
				<WidgetSettingsForm
					title="Dockhand"
					icon="dockhand"
					urlLabel="Dockhand URL"
					bind:url={dockhandUrl}
					bind:username={dockhandUsername}
					bind:password={dockhandPassword}
					bind:isExpanded={isDockhandEditing}
					onSave={saveDockhandSettings}
					isSaving={false}
				/>
			</ul>
		</Card.Content>
	</Card.Root>
</div>


