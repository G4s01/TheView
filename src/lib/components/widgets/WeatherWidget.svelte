<script lang="ts">
  import { useWeather } from '$lib/queries/useWeather';
  import { 
    Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, 
    CloudSnow, CloudLightning, Wind
  } from '@lucide/svelte';
  
  let { nodeW = 1, nodeH = 1 } = $props<{ nodeW?: number, nodeH?: number }>();
  let rectW = $state(0);
  let rectH = $state(0);
  let isWide = $derived(rectW > 450 || (rectW && rectH ? rectW > rectH * 1.2 : nodeW > nodeH));
  let isTall = $derived(rectW < 350 || (rectW && rectH ? rectH > rectW * 1.2 : nodeH > nodeW));
  let isLarge = $derived(rectW >= 250 || (nodeW >= 2 && nodeH >= 2));
  
  const query = useWeather();
  let selectedDayIndex = $state(0);

  function getWeatherIcon(code: number) {
    if (code === 0) return Sun;
    if (code === 1 || code === 2) return CloudSun;
    if (code === 3) return Cloud;
    if (code === 45 || code === 48) return CloudFog;
    if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) return CloudDrizzle;
    if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67 || code === 80 || code === 81 || code === 82) return CloudRain;
    if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) return CloudSnow;
    if (code === 95 || code === 96 || code === 99) return CloudLightning;
    return Sun;
  }

  function getWeatherDesc(code: number) {
    if (code === 0) return "Sereno";
    if (code === 1 || code === 2) return "Poco Nuvoloso";
    if (code === 3) return "Nuvoloso";
    if (code === 45 || code === 48) return "Nebbia";
    if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) return "Pioviggine";
    if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67 || code === 80 || code === 81 || code === 82) return "Pioggia";
    if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) return "Neve";
    if (code === 95 || code === 96 || code === 99) return "Temporale";
    return "Sconosciuto";
  }
  
  function getDayName(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth()) return "Oggi";
    return d.toLocaleDateString('it-IT', { weekday: 'short' });
  }

  function formatHour(timeStr: string) {
    return new Date(timeStr).getHours() + ":00";
  }

  // Filter next 24 hours
  function getHoursForDay(hourly: any, dayIndex: number) {
    if (!hourly) return [];
    const result = [];
    const startIdx = dayIndex * 24;
    const endIdx = startIdx + 24;
    
    for (let i = startIdx; i < endIdx && i < hourly.time.length; i++) {
        result.push({
            time: hourly.time[i],
            temp: hourly.temperature_2m[i],
            code: hourly.weather_code[i]
        });
    }
    
    // For today, only show current and future hours (up to 24)
    if (dayIndex === 0) {
        const now = new Date().getTime();
        return result.filter(r => new Date(r.time).getTime() >= now - 3600000);
    }
    return result;
  }

  // Action to allow drag-to-scroll on desktop, and stop event propagation to Gridstack
  function dragScroll(node: HTMLElement) {
    let isDown = false;
    let startX: number;
    let startY: number;
    let scrollLeft: number;
    let scrollTop: number;
    let hasDragged = false;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      hasDragged = false;
      startX = e.pageX - node.offsetLeft;
      startY = e.pageY - node.offsetTop;
      scrollLeft = node.scrollLeft;
      scrollTop = node.scrollTop;
      node.style.cursor = 'grabbing';
      e.stopPropagation(); // Prevent Gridstack drag
    };

    const onMouseLeave = () => {
      isDown = false;
      node.style.cursor = 'grab';
    };

    const onMouseUp = () => {
      isDown = false;
      node.style.cursor = 'grab';
      // hasDragged is kept true until next mousedown so click handler can read it
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - node.offsetLeft;
      const y = e.pageY - node.offsetTop;
      const walkX = (x - startX) * 1.5;
      const walkY = (y - startY) * 1.5;
      if (Math.abs(x - startX) > 5 || Math.abs(y - startY) > 5) {
         hasDragged = true;
      }
      node.scrollLeft = scrollLeft - walkX;
      node.scrollTop = scrollTop - walkY;
    };

    const onClick = (e: MouseEvent) => {
      if (hasDragged) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
        e.stopPropagation(); // Prevent Gridstack drag on mobile
    };

    const onPointerDown = (e: PointerEvent) => {
        e.stopPropagation();
    }

    node.style.cursor = 'grab';
    node.addEventListener('mousedown', onMouseDown);
    node.addEventListener('mouseleave', onMouseLeave);
    node.addEventListener('mouseup', onMouseUp);
    node.addEventListener('mousemove', onMouseMove);
    node.addEventListener('click', onClick, { capture: true });
    node.addEventListener('touchstart', onTouchStart, { passive: false });
    node.addEventListener('pointerdown', onPointerDown);

    return {
      destroy() {
        node.removeEventListener('mousedown', onMouseDown);
        node.removeEventListener('mouseleave', onMouseLeave);
        node.removeEventListener('mouseup', onMouseUp);
        node.removeEventListener('mousemove', onMouseMove);
        node.removeEventListener('click', onClick, { capture: true });
        node.removeEventListener('touchstart', onTouchStart);
        node.removeEventListener('pointerdown', onPointerDown);
      }
    };
  }

</script>

<div bind:clientWidth={rectW} bind:clientHeight={rectH} class="w-full h-full bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col items-center justify-start relative p-4 text-card-foreground">
  {#if query.isPending}
    <div class="flex flex-col items-center justify-center gap-2 animate-pulse w-full h-full">
      <div class="size-10 bg-muted rounded-full"></div>
      <div class="w-16 h-8 bg-muted rounded-md mt-2"></div>
      <div class="w-20 h-3 bg-muted rounded-md mt-1"></div>
    </div>
  {:else if query.isError}
    <div class="text-center h-full text-destructive flex flex-col justify-center items-center gap-2">
      <CloudLightning class="size-8 opacity-80" />
      <span class="text-xs font-semibold">{query.error?.message || "Errore Meteo"}</span>
    </div>
  {:else if query.isSuccess}
    {@const data = query.data}
    {@const CurrentIcon = getWeatherIcon(data.current.weather_code)}
    
    <div class="flex flex-col w-full h-full">
      
      <!-- HEADER: Current Weather -->
      <div class="flex {isWide ? 'flex-row items-center justify-between' : 'flex-col items-center justify-center shrink-0 mb-1'} w-full gap-2">
        <div class="flex flex-col items-center justify-center">
          <CurrentIcon class="{isWide ? 'size-12' : 'size-10'} text-primary drop-shadow-sm" strokeWidth={1.5} />
          <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1 text-center">{getWeatherDesc(data.current.weather_code)}</span>
        </div>
        
        <div class="flex flex-col {isWide ? 'items-end' : 'items-center'}">
          <span class="text-3xl md:text-4xl font-black tracking-tighter">
            {Math.round(data.current.temperature_2m)}°
          </span>
          <span class="text-xs font-semibold text-muted-foreground capitalize truncate max-w-[120px] text-center" title={data.name}>
            {data.name}
          </span>
        </div>
      </div>

      <!-- MIDDLE: Hourly Forecast (Horizontal Scroll) -->
      {#if isLarge}
        {@const next24 = getHoursForDay(data.hourly, selectedDayIndex)}
        <div use:dragScroll class="w-full flex overflow-x-auto gap-4 mt-4 pb-2 snap-x scrollbar-hide border-y border-border/40 py-3 touch-pan-x">
          {#each next24 as hr}
             {@const HIcon = getWeatherIcon(hr.code)}
             <div class="flex flex-col items-center justify-center min-w-[3rem] snap-start select-none">
                <span class="text-[10px] font-medium text-muted-foreground mb-1">{formatHour(hr.time)}</span>
                <HIcon class="size-5 text-foreground drop-shadow-sm mb-1" strokeWidth={1.5} />
                <span class="text-xs font-bold">{Math.round(hr.temp)}°</span>
             </div>
          {/each}
        </div>
      {/if}

      <!-- BOTTOM: Daily Forecast (Vertical List) -->
      {#if isTall || (isLarge && !isWide)}
        <div use:dragScroll class="w-full flex-1 flex flex-col gap-2 mt-4 overflow-y-auto pr-1 scrollbar-hide touch-pan-y">
          {#each data.daily.time as dateStr, i}
             {@const DIcon = getWeatherIcon(data.daily.weather_code[i])}
             <!-- svelte-ignore a11y_click_events_have_key_events -->
             <!-- svelte-ignore a11y_no_static_element_interactions -->
             <div 
                class="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0 select-none cursor-pointer hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors {selectedDayIndex === i ? 'bg-primary/10 font-bold' : ''}"
                onclick={() => selectedDayIndex = i}
             >
                <span class="text-xs font-semibold w-12 truncate capitalize">{getDayName(dateStr)}</span>
                <div class="flex-1 flex justify-center">
                  <DIcon class="size-4 text-muted-foreground drop-shadow-sm" strokeWidth={1.5} />
                </div>
                <div class="flex items-center gap-2 text-xs font-medium w-20 justify-end">
                   <span class="text-muted-foreground">{Math.round(data.daily.temperature_2m_min[i])}°</span>
                   <div class="h-1 flex-1 bg-gradient-to-r from-blue-400 to-red-400 rounded-full opacity-50"></div>
                   <span class="font-bold">{Math.round(data.daily.temperature_2m_max[i])}°</span>
                </div>
             </div>
          {/each}
        </div>
      {/if}

      <!-- BOTTOM: Daily Forecast (Horizontal List) -->
      {#if isWide && !isTall}
        <div use:dragScroll class="w-full flex overflow-x-auto gap-2 mt-auto pt-2 pb-1 snap-x scrollbar-hide touch-pan-x border-t border-border/40">
          {#each data.daily.time as dateStr, i}
             {@const DIcon = getWeatherIcon(data.daily.weather_code[i])}
             <!-- svelte-ignore a11y_click_events_have_key_events -->
             <!-- svelte-ignore a11y_no_static_element_interactions -->
             <div 
                class="flex flex-col items-center justify-center min-w-[3.5rem] snap-start select-none cursor-pointer hover:bg-muted/50 rounded-md p-1 transition-colors {selectedDayIndex === i ? 'bg-primary/10 font-bold border border-primary/20' : 'border border-transparent'}"
                onclick={() => selectedDayIndex = i}
             >
                <span class="text-[10px] font-semibold uppercase">{getDayName(dateStr).substring(0,3)}</span>
                <DIcon class="size-4 my-1 text-muted-foreground drop-shadow-sm" strokeWidth={1.5} />
                <div class="flex items-center gap-1 text-[10px] font-medium">
                   <span class="text-blue-500/80">{Math.round(data.daily.temperature_2m_min[i])}°</span>
                   <span class="font-bold text-red-500/80">{Math.round(data.daily.temperature_2m_max[i])}°</span>
                </div>
             </div>
          {/each}
        </div>
      {/if}

    </div>
  {/if}
</div>

<style>
  /* Hide scrollbar for cleaner look in widgets */
  .scrollbar-hide::-webkit-scrollbar {
      display: none;
  }
  .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
</style>
