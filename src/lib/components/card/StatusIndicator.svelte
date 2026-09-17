<script lang="ts">
	let { status, latencyMs, visible = true } = $props<{
		status: 'online' | 'offline' | 'checking' | 'disabled';
		latencyMs?: number | null;
		visible?: boolean;
	}>();

	let tooltipText = $derived(
		status === 'online' ? `Online (${latencyMs}ms)` 
		: status === 'offline' ? 'Offline'
		: status === 'checking' ? 'Checking...'
		: ''
	);
</script>

{#if visible && status !== 'disabled'}
	<div class="absolute top-4 right-4 flex items-center space-x-1.5 z-10" title={tooltipText}>
		<span class="relative flex h-2.5 w-2.5">
			{#if status === 'checking'}
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-warning"></span>
			{:else if status === 'online'}
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-30" style="animation-duration: 3s;"></span>
				<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-success shadow-[0_0_8px_hsl(var(--success,142_71%_45%))]"></span>
			{:else if status === 'offline'}
				<span class="animate-pulse absolute inline-flex h-full w-full rounded-full bg-destructive opacity-50"></span>
				<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive shadow-[0_0_8px_hsl(var(--destructive))]"></span>
			{/if}
		</span>
	</div>
{/if}
