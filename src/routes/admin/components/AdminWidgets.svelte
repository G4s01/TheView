<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from "$lib/components/ui/card";
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import WidgetSettingsForm from './WidgetSettingsForm.svelte';
	import { toast } from 'svelte-sonner';
	import SaveButton from "$lib/components/ui/SaveButton.svelte";
	import ServiceIcon from '$lib/components/ui/ServiceIcon.svelte';
	import { Pencil, Plus, X } from "@lucide/svelte";

	let expandedStates = $state({ qbit: false, adguard: false, beszel: false, wgeasy: false, duplicati: false, filebrowser: false, docker: false, clock: false, weather: false });

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

	let filebrowser_url = $state('');
	let filebrowser_username = $state('');
	let filebrowser_password = $state('');
	let filebrowser_require_auth = $state(false);
	let isSavingFilebrowser = $state(false);

	async function saveFilebrowserSettings() {
		isSavingFilebrowser = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ filebrowser_url, filebrowser_username, filebrowser_password, filebrowser_require_auth })
			});
			if (res.ok) toast.success('Impostazioni Filebrowser salvate con successo!');
			else toast.error('Errore durante il salvataggio.');
		} catch (e) {
			toast.error('Errore di rete.');
		} finally {
			isSavingFilebrowser = false;
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

	let clock_timezone = $state('');
	let clock_format = $state('digital');
	let isSavingClock = $state(false);

	async function saveClockSettings() {
		isSavingClock = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ clock_timezone, clock_format })
			});
			if (res.ok) toast.success('Impostazioni Orologio salvate con successo!');
			else toast.error('Errore durante il salvataggio.');
		} catch (e) {
			toast.error('Errore di rete.');
		} finally {
			isSavingClock = false;
		}
	}

	let weather_location = $state('');
	let isSavingWeather = $state(false);

	async function saveWeatherSettings() {
		isSavingWeather = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ weather_location })
			});
			if (res.ok) toast.success('Impostazioni Meteo salvate con successo!');
			else toast.error('Errore durante il salvataggio.');
		} catch (e) {
			toast.error('Errore di rete.');
		} finally {
			isSavingWeather = false;
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
				filebrowser_url = data.filebrowser_url || '';
				filebrowser_username = data.filebrowser_username || '';
				filebrowser_password = data.filebrowser_password || '';
				filebrowser_require_auth = data.filebrowser_require_auth === true || data.filebrowser_require_auth === 'true';
				docker_socket_path = data.docker_socket_path || '/var/run/docker.sock';
				dockhandUrl = data.dockhand_url || '';
				dockhandUsername = data.dockhand_username || '';
				dockhandPassword = data.dockhand_password || '';
				isDockhandEditing = !dockhandUrl;
				clock_timezone = data.clock_timezone || '';
				clock_format = data.clock_format || 'digital';
				weather_location = data.weather_location || '';
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
					title="Filebrowser"
					icon="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/filebrowser.svg"
					usernameLabel="Username"
					passwordLabel="Password"
					urlLabel="URL (es. http://192.168.1.10:8080)"
					bind:username={filebrowser_username}
					bind:password={filebrowser_password}
					bind:url={filebrowser_url}
					bind:requireAuth={filebrowser_require_auth}
					bind:isExpanded={expandedStates.filebrowser}
					onSave={saveFilebrowserSettings}
					isSaving={isSavingFilebrowser}
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
				<!-- Clock -->
				<li id="widget-clock-row" class="px-6 py-5 hover:bg-muted/50 transition-colors flex flex-col gap-4 cursor-pointer" onclick={() => expandedStates.clock = !expandedStates.clock}>
					<div class="flex items-center justify-between w-full">
						<div class="flex items-center gap-4 flex-1 min-w-0 mr-4">
							<div class="shrink-0">
								<ServiceIcon icon="lucide:clock" name="Orologio" size="lg" class="shadow-sm border border-border bg-card" />
							</div>
							<div class="flex flex-col sm:flex-row sm:items-center sm:gap-3 flex-1 min-w-0">
								<p class="text-sm font-semibold text-foreground uppercase tracking-wider truncate">Orologio</p>
							</div>
						</div>
						
						<div>
							<button type="button" onclick={(e: Event) => { e.stopPropagation(); expandedStates.clock = !expandedStates.clock; }} class="inline-flex items-center justify-center size-10 border border-transparent rounded-full shadow-sm transition-all duration-300 {expandedStates.clock ? 'bg-muted text-muted-foreground hover:bg-accent' : 'bg-primary text-primary-foreground hover:opacity-90'} focus:outline-none hover:scale-110">
								<div class="relative size-5">
									<Pencil class="absolute top-0 left-0 size-4 transition-all duration-300 {expandedStates.clock ? 'opacity-60' : ''}" strokeWidth={2.5} />
									{#if expandedStates.clock}
										<X class="absolute -bottom-1 -right-1 size-3.5 shadow-sm" strokeWidth={3} />
									{:else}
										<Plus class="absolute -bottom-1 -right-1 size-3.5 shadow-sm" strokeWidth={3} />
									{/if}
								</div>
							</button>
						</div>
					</div>
					
					{#if expandedStates.clock}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<div class="w-full mt-2 relative">
							<div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-accent rounded-t-xl z-10"></div>
							<div class="p-5 bg-card text-card-foreground rounded-xl shadow-lg border border-border relative flex flex-col gap-4" onclick={(e) => e.stopPropagation()} role="presentation">
								<div class="grid grid-cols-1 md:grid-cols-12 gap-4">
									<div class="md:col-span-6 h-10">
										<label for="admin_clock_timezone" class="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 ml-1">Fuso Orario</label>
										<input id="admin_clock_timezone" type="text" class="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow" placeholder="Es. Europe/Rome (vuoto = locale)" bind:value={clock_timezone} />
									</div>
									<div class="md:col-span-6 h-10">
										<label for="admin_clock_format" class="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 ml-1">Formato</label>
										<select id="admin_clock_format" class="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow" bind:value={clock_format}>
											<option value="digital">Digitale</option>
											<option value="analog">Analogico</option>
										</select>
									</div>
								</div>
								<div class="flex justify-end mt-2">
									<SaveButton class="w-32 h-10" onclick={saveClockSettings} isLoading={isSavingClock} />
								</div>
							</div>
						</div>
					{/if}
				</li>

				<!-- Weather -->
				<li id="widget-weather-row" class="px-6 py-5 hover:bg-muted/50 transition-colors flex flex-col gap-4 cursor-pointer" onclick={() => expandedStates.weather = !expandedStates.weather}>
					<div class="flex items-center justify-between w-full">
						<div class="flex items-center gap-4 flex-1 min-w-0 mr-4">
							<div class="shrink-0">
								<ServiceIcon icon="lucide:cloud-sun" name="Meteo" size="lg" class="shadow-sm border border-border bg-card" />
							</div>
							<div class="flex flex-col sm:flex-row sm:items-center sm:gap-3 flex-1 min-w-0">
								<p class="text-sm font-semibold text-foreground uppercase tracking-wider truncate">Meteo</p>
							</div>
						</div>
						
						<div>
							<button type="button" onclick={(e: Event) => { e.stopPropagation(); expandedStates.weather = !expandedStates.weather; }} class="inline-flex items-center justify-center size-10 border border-transparent rounded-full shadow-sm transition-all duration-300 {expandedStates.weather ? 'bg-muted text-muted-foreground hover:bg-accent' : 'bg-primary text-primary-foreground hover:opacity-90'} focus:outline-none hover:scale-110">
								<div class="relative size-5">
									<Pencil class="absolute top-0 left-0 size-4 transition-all duration-300 {expandedStates.weather ? 'opacity-60' : ''}" strokeWidth={2.5} />
									{#if expandedStates.weather}
										<X class="absolute -bottom-1 -right-1 size-3.5 shadow-sm" strokeWidth={3} />
									{:else}
										<Plus class="absolute -bottom-1 -right-1 size-3.5 shadow-sm" strokeWidth={3} />
									{/if}
								</div>
							</button>
						</div>
					</div>
					
					{#if expandedStates.weather}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<div class="w-full mt-2 relative">
							<div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-accent rounded-t-xl z-10"></div>
							<div class="p-5 bg-card text-card-foreground rounded-xl shadow-lg border border-border relative flex flex-col gap-4" onclick={(e) => e.stopPropagation()} role="presentation">
								<div class="grid grid-cols-1 md:grid-cols-12 gap-4">
									<div class="md:col-span-12 h-10">
										<label for="admin_weather_location" class="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 ml-1">Località</label>
										<input id="admin_weather_location" type="text" class="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow" placeholder="Es. Milano, Roma, IT" bind:value={weather_location} />
										<p class="text-[10px] text-muted-foreground mt-1 ml-1">La località verrà geolocalizzata tramite Open-Meteo per ottenere le previsioni.</p>
									</div>
								</div>
								<div class="flex justify-end mt-6">
									<SaveButton class="w-32 h-10" onclick={saveWeatherSettings} isLoading={isSavingWeather} />
								</div>
							</div>
						</div>
					{/if}
				</li>
			</ul>
		</Card.Content>
	</Card.Root>
</div>


