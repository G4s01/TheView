<script lang="ts">
	import { useJellyfin } from '$lib/queries/useJellyfin';
	import { Film, Tv, Music, Users, AlertCircle } from '@lucide/svelte';
	import { Progress } from "$lib/components/ui/progress";

	let { service, size = 'gs-2x2' } = $props<{ service: any; size?: string }>();

	let nodeW = $derived(parseInt(size.split('x')[0].replace('gs-', '')) || 2);
	let nodeH = $derived(parseInt(size.split('x')[1]) || 2);
	let rectW = $state(0);
	let rectH = $state(0);
	let isWide = $derived(rectW && rectH ? rectW > rectH * 1.1 : nodeW > nodeH);
	let isTall = $derived(rectW && rectH ? rectH > rectW * 1.1 : nodeH > nodeW);

	const query = useJellyfin(() => service.id);

	let data = $derived(query.data || {});
	let nowPlaying = $derived(data.nowPlaying);
	let stats = $derived(data.stats);
	let baseUrl = $derived(data.url);

	// Ticks to percentage
	let progressPercent = $derived(nowPlaying && nowPlaying.runTimeTicks > 0 
		? (nowPlaying.positionTicks / nowPlaying.runTimeTicks) * 100 
		: 0);

	function formatTicks(ticks: number) {
		if (!ticks) return "0:00";
		const totalSeconds = Math.floor(ticks / 10000000);
		const h = Math.floor(totalSeconds / 3600);
		const m = Math.floor((totalSeconds % 3600) / 60);
		const s = totalSeconds % 60;
		if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}
	
</script>

<div bind:clientWidth={rectW} bind:clientHeight={rectH} class="w-full h-full flex flex-col justify-center items-center overflow-hidden bg-card text-card-foreground relative">
	{#if query.isPending}
		<div class="flex flex-col items-center justify-center gap-3 w-full h-full animate-pulse p-4">
			<div class="w-16 h-16 bg-muted rounded-full"></div>
			<div class="h-4 w-24 bg-muted rounded"></div>
			<div class="h-2 w-full bg-muted rounded mt-2"></div>
		</div>
	{:else if query.isError}
		<div class="flex flex-col items-center justify-center gap-2 text-destructive text-center p-4">
			<AlertCircle class="size-8 sm:size-10 mb-1" strokeWidth={1.5} />
			<span class="text-xs font-medium max-w-full truncate px-2" title={query.error?.message}>
				{query.error?.message || 'Errore Jellyfin'}
			</span>
		</div>
	{:else}
		{#if nowPlaying}
			<!-- Background Blur Image -->
			<div 
				class="absolute inset-0 bg-cover bg-center opacity-40 blur-sm scale-110" 
				style="background-image: url('{baseUrl}/Items/{nowPlaying.backdropImageId}/Images/Backdrop');"
			></div>
			<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
			
			<div class="relative z-10 flex {isWide ? 'flex-row' : 'flex-col'} w-full h-full p-3 gap-3">
				
				<!-- Poster Area -->
				<div class="{isWide ? 'w-1/3 h-full max-w-[120px]' : 'w-full flex-1 min-h-0'} flex items-center justify-center shrink-0">
					<img 
						src="{baseUrl}/Items/{nowPlaying.posterImageId}/Images/Primary" 
						alt="Poster" 
						class="rounded-md shadow-lg object-contain {isWide ? 'h-full w-full object-left' : 'h-full max-h-[140px]'}" 
					/>
				</div>

				<!-- Info Area -->
				<div class="flex flex-col justify-center flex-1 min-w-0 {isWide ? 'items-start text-left' : 'items-center text-center'} text-white text-shadow-sm">
					<span class="text-xs font-semibold text-primary/90 uppercase tracking-widest mb-0.5">{nowPlaying.userName} sta guardando</span>
					<h3 class="text-base sm:text-lg font-bold leading-tight truncate w-full" title={nowPlaying.title}>{nowPlaying.title}</h3>
					{#if nowPlaying.subtitle}
						<span class="text-xs text-gray-300 mt-0.5 truncate w-full">{nowPlaying.subtitle}</span>
					{/if}

					<!-- Controls & Progress -->
					<div class="w-full mt-auto pt-2 flex flex-col gap-2">
						<div class="flex items-center gap-2 w-full text-[10px] font-medium text-gray-300">
							<span class="w-8 text-right shrink-0">{formatTicks(nowPlaying.positionTicks)}</span>
							<Progress value={progressPercent} class="h-1.5 flex-1 bg-white/20 [&>div]:bg-primary" />
							<span class="w-8 shrink-0">{formatTicks(nowPlaying.runTimeTicks)}</span>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- Idle State -->
			<div class="flex flex-col items-center justify-center p-4 w-full h-full text-foreground gap-4">
				{#if stats}
					<span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Libreria</span>
					<div class="grid grid-cols-2 gap-3 w-full max-w-[240px]">
						<div class="flex flex-col items-center justify-center p-2.5 bg-muted/40 border border-border/50 rounded-xl transition-colors hover:bg-muted/60">
							<Film class="size-4 text-primary mb-1" />
							<span class="text-base font-black leading-tight">{stats.movies}</span>
							<span class="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Film</span>
						</div>
						<div class="flex flex-col items-center justify-center p-2.5 bg-muted/40 border border-border/50 rounded-xl transition-colors hover:bg-muted/60">
							<Tv class="size-4 text-primary mb-1" />
							<span class="text-base font-black leading-tight">{stats.series}</span>
							<span class="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Serie TV</span>
						</div>
						<div class="flex flex-col items-center justify-center p-2.5 bg-muted/40 border border-border/50 rounded-xl transition-colors hover:bg-muted/60">
							<Music class="size-4 text-primary mb-1" />
							<span class="text-base font-black leading-tight">{stats.songs}</span>
							<span class="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Brani</span>
						</div>
						<div class="flex flex-col items-center justify-center p-2.5 bg-muted/40 border border-border/50 rounded-xl transition-colors hover:bg-muted/60">
							<Users class="size-4 text-primary mb-1" />
							<span class="text-base font-black leading-tight">{stats.users ?? 1}</span>
							<span class="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Utenti</span>
						</div>
					</div>
				{:else}
					<span class="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-2">Pronto per lo streaming</span>
				{/if}
			</div>
		{/if}
	{/if}
</div>
