<script lang="ts">
	import { CircleAlert, Hash, Percent, Timer } from "@lucide/svelte";
	import { useAdGuardStats, useAdGuardToggle } from '$lib/queries/useAdGuard';
	import { Skeleton } from "$lib/components/ui/skeleton";
	import { Switch } from "$lib/components/ui/switch";
	import { appState } from '$lib/client/state.svelte';
	import { onMount, onDestroy } from "svelte";
	import { Button } from "$lib/components/ui/button";
	import TimeWheelPicker from '$lib/components/ui/TimeWheelPicker.svelte';
	
	let { size = '1x1' } = $props<{ size?: string }>();
	
	const query = useAdGuardStats();
	const toggle = useAdGuardToggle();
	
	let isAdmin = $derived(appState.isAdmin);

	let customDurationMs = $state(0);

	// Countdown logic
	let targetTime = $state<number | null>(null);
	let timeRemainingStr = $state("");
	let interval: ReturnType<typeof setInterval>;

	function startTimer(durationMs: number) {
		targetTime = Date.now() + durationMs;
		updateTimeStr();
	}

	function updateTimeStr() {
		if (!targetTime) {
			timeRemainingStr = "";
			return;
		}
		const diff = Math.max(0, targetTime - Date.now());
		if (diff === 0) {
			targetTime = null;
			timeRemainingStr = "";
			return;
		}
		const m = Math.floor(diff / 60000);
		const s = Math.floor((diff % 60000) / 1000);
		timeRemainingStr = `${m}:${s.toString().padStart(2, '0')}`;
	}

	onMount(() => {
		interval = setInterval(updateTimeStr, 1000);
		return () => clearInterval(interval);
	});

	let containerWidth = $state(0);

	function observeResize(node: HTMLElement) {
		const observer = new ResizeObserver(entries => {
			for (let entry of entries) {
				containerWidth = entry.contentRect.width;
			}
		});
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	let wasDisabled = $state(false);
	$effect(() => {
		if (query.data && !query.data.status?.protection_enabled) {
			wasDisabled = true;
		} else if (query.data && query.data.status?.protection_enabled && wasDisabled) {
			targetTime = null;
			timeRemainingStr = "";
			wasDisabled = false;
		}
	});

</script>

<div class="flex flex-col gap-2 h-full min-h-0">
	{#if query.isPending}
		<div class="flex items-center justify-between">
			<Skeleton class="h-4 w-16" />
			<Skeleton class="h-4 w-8" />
		</div>
	{:else if query.isError}
		<div class="text-xs text-destructive truncate flex items-center justify-center gap-1" title={query.error?.message || 'Errore'}>
			<CircleAlert class="w-3.5 h-3.5" />
			DISCONNESSO
		</div>
	{:else if query.isSuccess}
		<div class="flex flex-wrap items-stretch justify-between text-xs font-medium w-full text-muted-foreground gap-2 min-h-0 flex-1">
			<div class="flex flex-col justify-center gap-1 items-center bg-muted/30 border border-border p-2 rounded-xl flex-1 min-w-35">
				<div class="flex items-center uppercase" title="Query Totali">
					<Hash class="size-3.5 mr-1 text-foreground shrink-0" strokeWidth={2.5} />
					<span class="text-foreground truncate">QUERY DNS: {query.data?.stats?.num_dns_queries || 0}</span>
				</div>
				<div class="flex items-center text-primary uppercase" title="Bloccate (%)">
					<Percent class="size-3.5 mr-1 shrink-0" strokeWidth={2.5} />
					<span class="truncate">BLOCCATE: {(((query.data?.stats?.num_blocked_filtering || 0) / Math.max(1, query.data?.stats?.num_dns_queries || 1)) * 100).toFixed(1)}%</span>
				</div>
			</div>
			<div class="flex flex-col items-end gap-2 flex-1 min-w-35 max-w-full">
				<div class="bg-card border border-border rounded-xl flex flex-col w-full overflow-hidden divide-y divide-border h-full">
					<div class="flex items-center justify-between w-full p-2 px-3">
						<span class="font-semibold text-sm uppercase {query.data?.status?.protection_enabled ? 'text-primary' : 'text-destructive'} truncate pr-2">
							{query.data?.status?.protection_enabled ? 'ATTIVO' : 'DISATTIVO'}
						</span>
						<Switch 
							class="shrink-0"
							checked={query.data?.status?.protection_enabled}
							disabled={!isAdmin || toggle.isPending}
							onCheckedChange={(v) => { 
								if (!v) {
									toggle.mutate({ action: "disable", duration: customDurationMs }); 
									if (customDurationMs > 0) startTimer(customDurationMs);
									else targetTime = null;
								} else {
									toggle.mutate({ action: "enable" }); 
									targetTime = null;
								}
							}}
						/>
					</div>
					{#if !query.data?.status?.protection_enabled && targetTime}
						<div class="p-2 bg-muted/20 flex items-center justify-center text-[10px] sm:text-xs text-destructive font-medium text-center flex-1">
							SI RIATTIVA IN... {timeRemainingStr}
						</div>
					{:else if query.data?.status?.protection_enabled}
						<div use:observeResize class="p-1.5 sm:p-2 bg-muted/10 w-full flex justify-center items-center flex-1">
							<div class="origin-center transition-transform" style="width: 170px; transform: scale({containerWidth > 0 && containerWidth < 170 ? containerWidth / 170 : 1});">
								<TimeWheelPicker bind:durationMs={customDurationMs} />
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
