<script lang="ts">
  import { useWeather } from '$lib/queries/useWeather';
  import { 
    Sun, 
    CloudSun, 
    Cloud, 
    CloudFog, 
    CloudDrizzle, 
    CloudRain, 
    CloudSnow, 
    CloudLightning,
    Wind,
    Droplets
  } from 'lucide-svelte';
  
  let { nodeW = 1, nodeH = 1 } = $props<{ nodeW?: number, nodeH?: number }>();
  let isWide = $derived(nodeW >= 2 || (nodeW === 2 && nodeH === 2));
  
  const query = useWeather();

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
</script>

<div class="w-full h-full bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col items-center justify-center relative p-4 text-card-foreground">
  {#if query.isPending}
    <div class="flex flex-col items-center justify-center gap-2 animate-pulse w-full">
      <div class="size-10 bg-muted rounded-full"></div>
      <div class="w-16 h-8 bg-muted rounded-md mt-2"></div>
      <div class="w-20 h-3 bg-muted rounded-md mt-1"></div>
    </div>
  {:else if query.isError}
    <div class="text-center text-destructive flex flex-col items-center gap-2">
      <CloudLightning class="size-8 opacity-80" />
      <span class="text-xs font-semibold">{query.error?.message || "Errore Meteo"}</span>
    </div>
  {:else if query.isSuccess}
    {@const data = query.data}
    {@const Icon = getWeatherIcon(data.current.weather_code)}
    
    <div class="flex flex-col w-full h-full {isWide ? 'justify-around' : 'justify-center items-center gap-2'}">
      <!-- Main Current Weather -->
      <div class="flex {isWide ? 'flex-row items-center justify-between px-2' : 'flex-col items-center'} gap-2 w-full">
        <div class="flex flex-col items-center justify-center">
          <Icon class="{isWide ? 'size-12' : 'size-10'} text-primary drop-shadow-sm" strokeWidth={1.5} />
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

      <!-- Extra Details for Wide views -->
      {#if isWide}
        <div class="flex flex-row items-center justify-between w-full bg-muted/30 rounded-lg p-2.5 mt-2 border border-border/50">
          <div class="flex items-center gap-1.5 text-xs font-medium">
            <Wind class="size-3.5 text-muted-foreground" />
            <span>{Math.round(data.current.wind_speed_10m)} km/h</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs font-medium">
            <span class="text-primary font-bold">H:</span> {Math.round(data.daily.temperature_2m_max[0])}°
            <span class="text-blue-500 font-bold ml-1">L:</span> {Math.round(data.daily.temperature_2m_min[0])}°
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
