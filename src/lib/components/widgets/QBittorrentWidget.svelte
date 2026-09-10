<script lang="ts">
	import { ArrowDown, ArrowUp, Hash, CircleAlert, Play, Pause, Trash, Upload, Plus } from "@lucide/svelte";
	import { useQbittorrent, useQbittorrentPause, useQbittorrentResume, useQbittorrentDelete, useQbittorrentAdd } from '$lib/queries/useQbittorrent';
	import { Skeleton } from "$lib/components/ui/skeleton";
	import { Progress } from "$lib/components/ui/progress";
	
	let { size = '1x1' } = $props<{ size?: string }>();
	
	const query = useQbittorrent();
	const pauseMutation = useQbittorrentPause();
	const resumeMutation = useQbittorrentResume();
	const deleteMutation = useQbittorrentDelete();
	const addMutation = useQbittorrentAdd();
	
	let addUrl = $state("");
	
	function formatBytes(bytes: number) {
		if (bytes === 0 || !bytes) return '0 B/s';
		const k = 1024;
		const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	function formatETA(seconds: number) {
		if (!seconds || seconds >= 8640000 || seconds < 0) return '∞';
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		if (h > 0) return `${h}h ${m}m`;
		return `${m}m`;
	}
</script>

<div class="flex flex-col gap-2 h-full min-h-0">
	{#if query.isPending}
		<div class="flex flex-col gap-3 h-full animate-pulse w-full">
			<div class="flex items-center justify-between text-xs w-full gap-2 shrink-0">
				<div class="flex items-center flex-1"><div class="h-3 w-12 bg-muted rounded"></div></div>
				<div class="flex items-center justify-center flex-1"><div class="h-3 w-8 bg-muted rounded"></div></div>
				<div class="flex items-center justify-end flex-1"><div class="h-3 w-12 bg-muted rounded"></div></div>
			</div>
			{#if size === '2x1' || size === '1x2' || size === '2x2'}
				<div class="flex flex-col gap-3 mt-2 flex-1">
					<div class="flex flex-col gap-2 w-full">
						<div class="h-3 w-3/4 bg-muted rounded"></div>
						<div class="h-1.5 w-full bg-muted rounded"></div>
					</div>
					<div class="flex flex-col gap-2 w-full">
						<div class="h-3 w-1/2 bg-muted rounded"></div>
						<div class="h-1.5 w-full bg-muted rounded"></div>
					</div>
				</div>
				<div class="mt-auto pt-2 flex gap-2 h-8 shrink-0">
					<div class="flex-1 h-full bg-muted rounded-md"></div>
					<div class="w-8 h-full bg-muted rounded-md"></div>
				</div>
			{/if}
		</div>
	{:else if query.isError}
		<div class="text-xs text-destructive truncate flex items-center justify-center gap-1" title={query.error?.message || 'Errore'}>
			<CircleAlert class="w-3.5 h-3.5" />
			DISCONNESSO
		</div>
	{:else if query.isSuccess}
		<div class="flex items-center justify-between text-xs font-medium w-full text-muted-foreground gap-2 shrink-0">
			<div class="flex items-center justify-start flex-1 min-w-0" title="Download">
				<ArrowDown class="size-3.5 mr-1 text-primary shrink-0" strokeWidth={2.5} />
				<span class="truncate">{formatBytes(query.data?.dl_info_speed || 0)}</span>
			</div>
			<div class="flex items-center justify-center flex-1 min-w-0" title="Torrent Attivi">
				<Hash class="size-3.5 mr-1 text-foreground shrink-0" strokeWidth={2.5} />
				<span class="text-foreground">{Math.max(0, query.data?.active_torrents || 0)}</span>
			</div>
			<div class="flex items-center justify-end flex-1 min-w-0" title="Upload">
				<ArrowUp class="size-3.5 mr-1 text-primary shrink-0" strokeWidth={2.5} />
				<span class="truncate">{formatBytes(query.data?.up_info_speed || 0)}</span>
			</div>
		</div>

		{#if size === '2x1' || size === '1x2' || size === '2x2'}
			{#if query.data?.torrents && query.data.torrents.length > 0}
				<div class="flex flex-col gap-2 mt-2 flex-1">
					{#each query.data.torrents as torrent}
						<div class="flex flex-col gap-1 w-full text-xs">
							<div class="flex flex-col w-full min-w-0 gap-0.5">
								<div class="flex justify-between items-center w-full min-w-0 gap-1">
									<div class="flex-1 min-w-0 pr-2 overflow-hidden hover:overflow-x-auto whitespace-nowrap text-ellipsis scrollbar-none [&::-webkit-scrollbar]:hidden" title={torrent.name}>
										<span class="text-foreground font-medium">{torrent.name}</span>
									</div>
									<div class="flex items-center gap-1 shrink-0">
										<span class="text-muted-foreground tabular-nums text-[10px] pr-0.5">{formatBytes(torrent.dlspeed)}</span>
										{#if torrent.state.includes('paused') || torrent.state.includes('stopped')}
											<button 
												class="p-0.5 rounded hover:bg-accent disabled:opacity-50 text-foreground"
												disabled={resumeMutation.isPending}
												title="Riprendi"
												onclick={(e) => { e.preventDefault(); e.stopPropagation(); resumeMutation.mutate({ hash: torrent.hash }); }}
											>
												<Play class="size-3 text-muted-foreground hover:text-primary transition-colors" />
											</button>
										{:else}
											<button 
												class="p-0.5 rounded hover:bg-accent disabled:opacity-50 text-foreground"
												disabled={pauseMutation.isPending}
												title="Metti in pausa"
												onclick={(e) => { e.preventDefault(); e.stopPropagation(); pauseMutation.mutate({ hash: torrent.hash }); }}
											>
												<Pause class="size-3 text-muted-foreground hover:text-primary transition-colors" />
											</button>
										{/if}
										<button 
											class="p-0.5 rounded hover:bg-destructive/10 disabled:opacity-50 text-foreground ml-0.5"
											disabled={deleteMutation.isPending}
											title="Rimuovi"
											onclick={(e) => { e.preventDefault(); e.stopPropagation(); deleteMutation.mutate({ hash: torrent.hash }); }}
										>
											<Trash class="size-3 text-muted-foreground hover:text-destructive transition-colors" />
										</button>
									</div>
								</div>
								<div class="flex items-center gap-3 text-[10px] text-muted-foreground">
									<span>ETA: {formatETA(torrent.eta)}</span>
									<span>{torrent.connection_status}</span>
								</div>
							</div>
							<Progress value={torrent.progress} class="h-1.5 mt-0.5" />
						</div>
					{/each}
				</div>
			{:else}
				<div class="flex-1 min-h-0 flex items-center justify-center text-muted-foreground text-xs">
					TUTTO TACE
				</div>
			{/if}
			
			<div role="presentation" class="mt-auto pt-2 flex gap-2 items-center h-8 shrink-0 relative z-10" onclick={(e) => e.stopPropagation()}>
				<div class="flex-1 min-w-0 h-full flex items-center border border-input rounded-md px-2 bg-background focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
					<input
						type="text"
						placeholder="🧲 URL"
						bind:value={addUrl}
						class="w-full bg-transparent border-none focus:outline-none text-xs text-foreground placeholder:text-muted-foreground"
						onkeydown={(e) => {
							if (e.key === 'Enter' && addUrl.trim()) {
								e.preventDefault();
								const fd = new FormData();
								fd.append('urls', addUrl.trim());
								addMutation.mutate({ formData: fd }, {
									onSuccess: () => { addUrl = ''; }
								});
							}
						}}
					/>
					{#if addUrl.trim()}
						<button
							class="text-primary hover:text-primary/80 transition-colors"
							title="Aggiungi"
							disabled={addMutation.isPending}
							onclick={() => {
								const fd = new FormData();
								fd.append('urls', addUrl.trim());
								addMutation.mutate({ formData: fd }, {
									onSuccess: () => { addUrl = ''; }
								});
							}}
						>
							<Plus class="size-3.5" />
						</button>
					{/if}
				</div>
				<label
					class="cursor-pointer bg-background text-foreground border border-input rounded-md w-8 h-8 flex items-center justify-center transition-colors shadow-none shrink-0 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
					title="Carica un file .torrent"
				>
					<Upload class="size-3.5 opacity-70" strokeWidth={2} />
					<input
						type="file"
						accept=".torrent"
						class="hidden"
						onchange={async (e) => {
							const target = e.target as HTMLInputElement;
							const file = target?.files?.[0];
							if (!file) return;
							const formData = new FormData();
							formData.append('torrents', file);
							const btn = target.parentElement as HTMLElement;
							btn.classList.add('opacity-50');
							
							addMutation.mutate({ formData }, {
								onSettled: () => {
									btn.classList.remove('opacity-50');
									target.value = '';
								}
							});
						}}
					/>
				</label>
			</div>
		{/if}
	{/if}
</div>

