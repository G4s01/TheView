<script lang="ts">
    import { onMount } from 'svelte';
    import WidgetSettingsForm from '../../routes/admin/components/WidgetSettingsForm.svelte';
    import { toast } from 'svelte-sonner';

    let { widgetType = 'none' } = $props<{ widgetType: string }>();

    let isLoading = $state(true);
    let isSaving = $state(false);

    // QBit
    let qbit_url = $state('');
    let qbit_username = $state('');
    let qbit_password = $state('');
    let qbit_require_auth = $state(false);

    // AdGuard
    let adguard_url = $state('');
    let adguard_username = $state('');
    let adguard_password = $state('');
    let adguard_require_auth = $state(false);

    // Beszel
    let beszel_url = $state('');
    let beszel_username = $state('');
    let beszel_password = $state('');

    // WgEasy
    let wgeasy_url = $state('');
    let wgeasy_password = $state('');

    // Duplicati
    let duplicati_url = $state('');
    let duplicati_password = $state('');

    // Docker
    let docker_socket_path = $state('');

    // Dockhand
    let dockhandUrl = $state('');
    let dockhandUsername = $state('');
    let dockhandPassword = $state('');

    // Filebrowser
    let filebrowser_url = $state('');
    let filebrowser_username = $state('');
    let filebrowser_password = $state('');
    let filebrowser_require_auth = $state(false);

    // Clock
    let clock_timezone = $state('');
    let clock_format = $state('digital');

    // Weather
    let weather_location = $state('');

    let isExpanded = $state(true); // Always expand in this card

    $effect(() => {
        // Reset loading when widget changes
        if (widgetType) {
            fetchSettings();
        }
    });

    async function fetchSettings() {
        if (widgetType === 'none') return;
        isLoading = true;
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                if (widgetType === 'qbittorrent') {
                    qbit_url = data.qbit_url || '';
                    qbit_username = data.qbit_username || '';
                    qbit_password = data.qbit_password || '';
                    qbit_require_auth = data.qbit_require_auth === true || data.qbit_require_auth === 'true';
                } else if (widgetType === 'adguard') {
                    adguard_url = data.adguard_url || '';
                    adguard_username = data.adguard_username || '';
                    adguard_password = data.adguard_password || '';
                    adguard_require_auth = data.adguard_require_auth === true || data.adguard_require_auth === 'true';
                } else if (widgetType === 'beszel') {
                    beszel_url = data.beszel_url || '';
                    beszel_username = data.beszel_username || '';
                    beszel_password = data.beszel_password || '';
                } else if (widgetType === 'wgeasy') {
                    wgeasy_url = data.wgeasy_url || '';
                    wgeasy_password = data.wgeasy_password || '';
                } else if (widgetType === 'duplicati') {
                    duplicati_url = data.duplicati_url || '';
                    duplicati_password = data.duplicati_password || '';
                } else if (widgetType === 'docker') {
                    docker_socket_path = data.docker_socket_path || '/var/run/docker.sock';
                } else if (widgetType === 'dockhand') {
                    dockhandUrl = data.dockhand_url || '';
                    dockhandUsername = data.dockhand_username || '';
                    dockhandPassword = data.dockhand_password || '';
                } else if (widgetType === 'filebrowser') {
                    filebrowser_url = data.filebrowser_url || '';
                    filebrowser_username = data.filebrowser_username || '';
                    filebrowser_password = data.filebrowser_password || '';
                    filebrowser_require_auth = data.filebrowser_require_auth === true || data.filebrowser_require_auth === 'true';
                } else if (widgetType === 'clock') {
                    clock_timezone = data.clock_timezone || '';
                    clock_format = data.clock_format || 'digital';
                } else if (widgetType === 'weather') {
                    weather_location = data.weather_location || '';
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            isLoading = false;
        }
    }

    async function saveSettings(body: any) {
        isSaving = true;
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) toast.success('Impostazioni widget salvate con successo!');
            else toast.error('Errore durante il salvataggio.');
        } catch (e) {
            toast.error('Errore di rete.');
        } finally {
            isSaving = false;
        }
    }
</script>

{#if widgetType !== 'none' && !isLoading}
    <div class="bg-card border border-border rounded-3xl p-0 shadow-sm overflow-hidden flex flex-col mt-6">
        <ul class="divide-y divide-border m-0">
            {#if widgetType === 'qbittorrent'}
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
                    bind:isExpanded={isExpanded}
                    onSave={() => saveSettings({ qbit_url, qbit_username, qbit_password, qbit_require_auth })}
                    {isSaving}
                />
            {:else if widgetType === 'adguard'}
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
                    bind:isExpanded={isExpanded}
                    onSave={() => saveSettings({ adguard_url, adguard_username, adguard_password, adguard_require_auth })}
                    {isSaving}
                />
            {:else if widgetType === 'beszel'}
                <WidgetSettingsForm
                    title="Beszel"
                    icon="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/beszel.svg"
                    usernameLabel="Admin Email"
                    passwordLabel="Admin Password"
                    urlLabel="PocketBase URL (es. http://192.168.1.10:8090)"
                    bind:username={beszel_username}
                    bind:password={beszel_password}
                    bind:url={beszel_url}
                    bind:isExpanded={isExpanded}
                    onSave={() => saveSettings({ beszel_url, beszel_username, beszel_password })}
                    {isSaving}
                    requireAuth={false}
                />
            {:else if widgetType === 'wgeasy'}
                <WidgetSettingsForm
                    title="Wg-easy"
                    icon="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/wireguard.svg"
                    passwordLabel="Admin Password"
                    urlLabel="Wg-easy URL (es. http://192.168.1.10:51821)"
                    hideUsername={true}
                    bind:password={wgeasy_password}
                    bind:url={wgeasy_url}
                    bind:isExpanded={isExpanded}
                    onSave={() => saveSettings({ wgeasy_url, wgeasy_password })}
                    {isSaving}
                    requireAuth={false}
                />
            {:else if widgetType === 'duplicati'}
                <WidgetSettingsForm
                    title="Duplicati"
                    icon="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/duplicati.svg"
                    passwordLabel="Admin Password"
                    urlLabel="Duplicati URL (es. http://192.168.1.10:8200)"
                    hideUsername={true}
                    bind:password={duplicati_password}
                    bind:url={duplicati_url}
                    bind:isExpanded={isExpanded}
                    onSave={() => saveSettings({ duplicati_url, duplicati_password })}
                    {isSaving}
                    requireAuth={false}
                />
            {:else if widgetType === 'docker'}
                <WidgetSettingsForm
                    title="Docker"
                    icon="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/docker.svg"
                    urlLabel="Socket o TCP URL (es. /var/run/docker.sock oppure tcp://10.0.0.5:2375)"
                    hideUsername={true}
                    hidePassword={true}
                    bind:url={docker_socket_path}
                    bind:isExpanded={isExpanded}
                    onSave={() => saveSettings({ docker_socket_path })}
                    {isSaving}
                    requireAuth={false}
                />
            {:else if widgetType === 'dockhand'}
                <WidgetSettingsForm
                    title="Dockhand"
                    icon="dockhand"
                    urlLabel="Dockhand URL"
                    bind:url={dockhandUrl}
                    bind:username={dockhandUsername}
                    bind:password={dockhandPassword}
                    bind:isExpanded={isExpanded}
                    onSave={() => saveSettings({ dockhand_url: dockhandUrl, dockhand_username: dockhandUsername, dockhand_password: dockhandPassword })}
                    {isSaving}
                />
            {:else if widgetType === 'filebrowser'}
                <WidgetSettingsForm
                    title="Filebrowser Quantum"
                    icon="filebrowser"
                    usernameLabel="Username (Admin)"
                    passwordLabel="Password"
                    urlLabel="Filebrowser URL (es. http://192.168.1.10:8085)"
                    bind:username={filebrowser_username}
                    bind:password={filebrowser_password}
                    bind:url={filebrowser_url}
                    bind:requireAuth={filebrowser_require_auth}
                    bind:isExpanded={isExpanded}
                    onSave={() => saveSettings({ filebrowser_url, filebrowser_username, filebrowser_password, filebrowser_require_auth })}
                    {isSaving}
                />
            {:else if widgetType === 'clock'}
                <li class="px-6 py-5 flex flex-col gap-4">
                    <div class="flex items-center gap-4 mb-2">
                        <ServiceIcon icon="lucide:clock" name="Clock" size="lg" class="shadow-sm border border-border bg-card" />
                        <p class="text-sm font-semibold text-foreground uppercase tracking-wider truncate">Orologio</p>
                    </div>
                    <div class="p-5 bg-card text-card-foreground rounded-xl shadow-lg border border-border flex flex-col gap-4">
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div class="md:col-span-6 h-10">
                                <label for="clock_timezone" class="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 ml-1">Fuso Orario</label>
                                <input id="clock_timezone" type="text" class="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow" placeholder="Es. Europe/Rome (vuoto = locale)" bind:value={clock_timezone} />
                            </div>
                            <div class="md:col-span-6 h-10">
                                <label for="clock_format" class="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 ml-1">Formato</label>
                                <select id="clock_format" class="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow" bind:value={clock_format}>
                                    <option value="digital">Digitale</option>
                                    <option value="analog">Analogico</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex justify-end mt-2">
                            <SaveButton class="w-32 h-10" onclick={() => saveSettings({ clock_timezone, clock_format })} isLoading={isSaving} />
                        </div>
                    </div>
                </li>
            {:else if widgetType === 'weather'}
                <li class="px-6 py-5 flex flex-col gap-4">
                    <div class="flex items-center gap-4 mb-2">
                        <ServiceIcon icon="lucide:cloud-sun" name="Weather" size="lg" class="shadow-sm border border-border bg-card" />
                        <p class="text-sm font-semibold text-foreground uppercase tracking-wider truncate">Meteo</p>
                    </div>
                    <div class="p-5 bg-card text-card-foreground rounded-xl shadow-lg border border-border flex flex-col gap-4">
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div class="md:col-span-12 h-10">
                                <label for="weather_location" class="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase mb-1.5 ml-1">Località</label>
                                <input id="weather_location" type="text" class="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow" placeholder="Es. Milano, Roma, IT" bind:value={weather_location} />
                                <p class="text-[10px] text-muted-foreground mt-1 ml-1">La località verrà geolocalizzata tramite Open-Meteo per ottenere le previsioni.</p>
                            </div>
                        </div>
                        <div class="flex justify-end mt-6">
                            <SaveButton class="w-32 h-10" onclick={() => saveSettings({ weather_location })} isLoading={isSaving} />
                        </div>
                    </div>
                </li>
            {/if}
        </ul>
    </div>
{/if}

