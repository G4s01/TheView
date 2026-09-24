<script lang="ts">
	import { useWgEasy, useWgEasyActions } from '$lib/queries/useWgEasy';
	import { Activity, Shield, ArrowDown, ArrowUp, Network, Plus, Trash2, QrCode, Download } from '@lucide/svelte';
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Switch } from "$lib/components/ui/switch";
    import * as Dialog from "$lib/components/ui/dialog";
    import ConfirmDeleteButton from "$lib/components/ui/ConfirmDeleteButton.svelte";
    import { appState } from '$lib/client/state.svelte';

	let { service, size = 'gs-2x2', hideHeader = false } = $props<{ service: any; size?: string;
		hideHeader?: boolean; }>();

	let nodeW = $derived(parseInt(size.split('x')[0].replace('gs-', '')) || 2);
	let nodeH = $derived(parseInt(size.split('x')[1]) || 2);
	let rectW = $state(0);
	let rectH = $state(0);
	let isWide = $derived(rectW && rectH ? rectW > rectH * 1.1 : nodeW > nodeH);

	let query = useWgEasy(() => service.id);
    let actions = useWgEasyActions();
	let clients = $derived(Array.isArray(query.data) ? query.data : []);
    let isAdmin = $derived(appState.isAdmin);

	// Active clients (handshake in last 5 minutes)
	let activeClients = $derived(clients.filter((c: any) => {
		if (!c.enabled || !c.latestHandshakeAt) return false;
		const handshake = new Date(c.latestHandshakeAt).getTime();
		const now = Date.now();
		return (now - handshake) < 5 * 60 * 1000;
	}));

	let totalRx = $derived(clients.reduce((acc: number, c: any) => acc + (c.transferRx || 0), 0));
	let totalTx = $derived(clients.reduce((acc: number, c: any) => acc + (c.transferTx || 0), 0));

	function formatBytes(bytes: number) {
		if (!bytes || bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	function timeAgo(dateString: string | null | undefined) {
		if (!dateString) return 'Mai';
		const date = new Date(dateString);
		if (date.getTime() === 0) return 'Mai';
		
		const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
		let interval = Math.floor(seconds / 31536000);
		if (interval > 1) return interval + ' anni fa';
		interval = Math.floor(seconds / 2592000);
		if (interval > 1) return interval + ' mesi fa';
		interval = Math.floor(seconds / 86400);
		if (interval >= 1) return interval + 'g fa';
		interval = Math.floor(seconds / 3600);
		if (interval >= 1) return interval + 'h fa';
		interval = Math.floor(seconds / 60);
		if (interval >= 1) return interval + 'm fa';
		return Math.floor(seconds) + 's fa';
	}

    let newDeviceName = $state('');
    let showAddDialog = $state(false);
    let selectedQrClient = $state<any>(null);

    async function downloadConfig(id: string, name: string) {
        try {
            const res = await fetch(`/api/widgets/wg-easy/download?id=${id}&type=config`);
            if (!res.ok) throw new Error('Download failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${name}.conf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (err) {
            console.error('Failed to download config:', err);
        }
    }

    function handleAdd() {
        if (!newDeviceName.trim()) return;
        actions.mutate({ action: 'add', name: newDeviceName.trim() }, {
            onSuccess: () => {
                newDeviceName = '';
                showAddDialog = false;
            }
        });
    }

    function handleDelete(id: string) {
        actions.mutate({ action: 'delete', id });
    }

    function toggleClient(client: any) {
        actions.mutate({ action: client.enabled ? 'disable' : 'enable', id: client.id });
    }
</script>

<div class="h-full w-full flex flex-col p-2  overflow-hidden text-card-foreground @container">
	{#if !hideHeader}
	<div class="flex items-center justify-between pb-2 mb-2 border-b border-border/50 shrink-0">
		<div class="flex items-center gap-2">
			<Shield class="size-4 text-primary" />
			<span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Wg-easy</span>
		</div>
		<div class="flex items-center gap-2">
            {#if isAdmin}
                <Button variant="ghost" size="icon" class="size-6 rounded text-primary hover:bg-primary/20 hover:text-primary" onclick={() => showAddDialog = true} title="Aggiungi dispositivo">
                    <Plus class="size-4" />
                </Button>
            {/if}
        </div>
		</div>
	{/if}

	<div class="flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
		{#if query.isPending}
			<div class="flex flex-col gap-3 p-1">
				<div class="h-10 w-full bg-muted/50 rounded-lg animate-pulse"></div>
				<div class="h-10 w-full bg-muted/50 rounded-lg animate-pulse"></div>
			</div>
		{:else if query.isError}
			<div class="flex flex-col items-center justify-center h-full text-center text-destructive/80 gap-2 p-4">
				<Network class="size-8 opacity-50" />
				<p class="text-xs font-medium">{query.error?.message || 'Errore di connessione'}</p>
			</div>
		{:else if clients.length === 0}
			<div class="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
				<Shield class="size-8 opacity-50" />
				<p class="text-xs">Nessun client configurato</p>
			</div>
		{:else}
			<div class="flex flex-col gap-2 h-full">
				<!-- Sommari globali -->
				<div class="flex justify-between items-center w-full bg-muted/20 px-3 py-2 rounded-lg border border-border/40 shrink-0">
					<div class="flex items-center gap-2">
						<span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attivi</span>
						<span class="text-sm font-bold text-foreground">{activeClients.length} / {clients.length}</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
							<ArrowDown class="size-4" />
							<span class="font-medium">{formatBytes(totalRx)}</span>
						</div>
						<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
							<ArrowUp class="size-4" />
							<span class="font-medium">{formatBytes(totalTx)}</span>
						</div>
					</div>
				</div>

				<!-- Lista client -->
				<div class="flex flex-col gap-2 mt-1 pb-1 flex-1 overflow-y-auto pr-1 custom-scrollbar">
					{#each clients as client}
						<div class="flex flex-col p-2.5 rounded-lg bg-card border border-border shadow-sm text-xs transition-opacity {client.enabled ? '' : 'opacity-60'}">
							<div class="flex items-center justify-between mb-2 border-b border-border/40 pb-1.5">
								<div class="flex items-center gap-2 font-semibold">
									<div class="size-2.5 rounded-full {client.enabled ? (activeClients.includes(client) ? 'bg-primary shadow-[0_0_6px_rgba(var(--primary),0.5)]' : 'bg-muted-foreground') : 'bg-destructive'}"></div>
									<span class="truncate max-w-24 md:max-w-32 text-[13px]">{client.name}</span>
								</div>
                                <div class="flex items-center gap-2">
                                    <span class="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">{client.address}</span>
                                    <Switch checked={client.enabled} onCheckedChange={() => toggleClient(client)} disabled={actions.isPending} class="scale-75 origin-right" />
                                </div>
							</div>
							
							<div class="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
								<div class="flex items-center gap-2">
									<span class="text-primary/90 inline-flex items-center gap-0.5" title="Download (RX)"><ArrowDown class="size-3" />{formatBytes(client.transferRx)}</span>
									<span class="text-muted-foreground/90 inline-flex items-center gap-0.5" title="Upload (TX)"><ArrowUp class="size-3" />{formatBytes(client.transferTx)}</span>
								</div>
                                <div class="flex items-center gap-1">
                                    {#if isAdmin}
                                        <Button variant="ghost" size="icon" class="size-6 rounded-md hover:bg-primary/20 text-primary" onclick={() => selectedQrClient = client} title="Mostra QR Code">
                                            <QrCode class="size-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" class="size-6 rounded-md hover:bg-primary/20 text-primary" onclick={() => downloadConfig(client.id, client.name)} title="Scarica Configurazione">
                                            <Download class="size-3.5" />
                                        </Button>
                                        <ConfirmDeleteButton class="size-6 ml-1" onConfirm={() => handleDelete(client.id)} />
                                    {/if}
                                </div>
							</div>
                            <div class="text-[9px] text-muted-foreground/50 mt-1.5">
                                Ultimo accesso: {timeAgo(client.latestHandshakeAt)}
                            </div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Add Dialog -->
<Dialog.Root bind:open={showAddDialog}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Nuovo Dispositivo</Dialog.Title>
      <Dialog.Description>
        Inserisci un nome per il nuovo client WireGuard.
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex items-center gap-2 my-4">
      <div class="grid flex-1 gap-2">
        <Input bind:value={newDeviceName} id="name" placeholder="es. iPhone di Mario" onkeydown={(e) => e.key === 'Enter' && handleAdd()} />
      </div>
    </div>
    <Dialog.Footer class="sm:justify-start">
      <Button type="button" variant="default" onclick={handleAdd} disabled={!newDeviceName.trim() || actions.isPending}>
        Aggiungi
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- QR Code Dialog -->
<Dialog.Root open={!!selectedQrClient} onOpenChange={(open) => { if (!open) selectedQrClient = null; }}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>QR Code - {selectedQrClient?.name}</Dialog.Title>
      <Dialog.Description>
        Scansiona questo QR Code dall'app WireGuard per configurare il dispositivo.
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-col items-center justify-center p-4 bg-white rounded-lg my-2">
        {#if selectedQrClient}
            <img src="/api/widgets/wg-easy/download?id={selectedQrClient.id}&type=qrcode" alt="QR Code" class="size-48 sm:size-64 object-contain" />
        {/if}
    </div>
    <Dialog.Footer class="sm:justify-between flex items-center">
        <Button variant="outline" onclick={() => selectedQrClient = null}>Chiudi</Button>
        {#if selectedQrClient}
            <Button onclick={() => downloadConfig(selectedQrClient.id, selectedQrClient.name)} class="h-10 px-4 py-2">
                <Download class="size-4 mr-2" /> Scarica .conf
            </Button>
        {/if}
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
