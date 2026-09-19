<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '$lib/client/state.svelte';

  let time = $state(new Date());

  // Reactive options from global settings
  let timezone = $derived(appState.settings?.clock_timezone || undefined);
  let format = $derived(appState.settings?.clock_format || 'digital');

  $effect(() => {
    const interval = setInterval(() => {
      time = new Date();
    }, 1000);
    return () => clearInterval(interval);
  });

  // Digital formatting
  let digitalTime = $derived(time.toLocaleTimeString([], { 
    timeZone: timezone, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  }));
  let digitalDate = $derived(time.toLocaleDateString([], { 
    timeZone: timezone,
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));

  // Analog formatting logic
  // We need to calculate degrees based on the requested timezone
  let tzDate = $derived(timezone 
    ? new Date(time.toLocaleString('en-US', { timeZone: timezone }))
    : time
  );
  
  let hours = $derived(tzDate.getHours() % 12);
  let minutes = $derived(tzDate.getMinutes());
  let seconds = $derived(tzDate.getSeconds());

  let hourDeg = $derived((hours * 30) + (minutes * 0.5));
  let minDeg = $derived((minutes * 6) + (seconds * 0.1));
  let secDeg = $derived(seconds * 6);
</script>

<div class="w-full h-full bg-card border border-border rounded-xl shadow-sm overflow-hidden flex items-center justify-center relative text-card-foreground">
  {#if format === 'analog'}
    <!-- Analog Clock -->
    <div class="relative w-full h-full flex flex-col items-center justify-center p-4">
      <svg viewBox="0 0 100 100" class="w-full h-full max-h-full drop-shadow-md">
        <circle cx="50" cy="50" r="48" fill="transparent" stroke="currentColor" stroke-width="2" class="text-border" />
        
        <!-- Markers -->
        {#each Array(12) as _, i}
          <line 
            x1="50" y1="6" x2="50" y2="10" 
            stroke="currentColor" stroke-width="2" 
            transform="rotate({i * 30} 50 50)" 
            class="text-muted-foreground"
          />
        {/each}

        <!-- Hour Hand -->
        <line x1="50" y1="50" x2="50" y2="25" stroke="currentColor" stroke-width="4" stroke-linecap="round" transform="rotate({hourDeg} 50 50)" class="text-foreground" />
        
        <!-- Minute Hand -->
        <line x1="50" y1="50" x2="50" y2="15" stroke="currentColor" stroke-width="3" stroke-linecap="round" transform="rotate({minDeg} 50 50)" class="text-muted-foreground" />
        
        <!-- Second Hand -->
        <line x1="50" y1="55" x2="50" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" transform="rotate({secDeg} 50 50)" class="text-primary" />
        
        <!-- Center Dot -->
        <circle cx="50" cy="50" r="3" fill="currentColor" class="text-primary" />
      </svg>
    </div>
  {:else}
    <!-- Digital Clock -->
    <div class="flex flex-col items-center justify-center w-full h-full p-4">
      <div class="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-mono text-foreground drop-shadow-sm">
        {digitalTime}
      </div>
      <div class="text-xs md:text-sm text-muted-foreground mt-2 font-medium capitalize tracking-wide">
        {digitalDate}
      </div>
    </div>
  {/if}
</div>
