import fs from 'fs';

let content = fs.readFileSync('src/routes/+page.svelte', 'utf8');

// Fix the clickOutside handlers. 
// We know both modals currently have `use:clickOutside={() => isWidgetModalOpen = false}`
// or `use:clickOutside={() => isDiscoveryModalOpen = false}` if I messed it up.
// Let's reset both to their correct handlers with ignore option.

// First, restore the bare div class for both to make it uniform for replacing
content = content.replace(
    /use:clickOutside=\{[^}]*\}\s*/g,
    ''
);

// Now carefully add the correct clickOutside to Discovery (which has 'Aggiunta Servizio')
let discoveryIndex = content.indexOf('<h2 class="text-xl font-bold uppercase tracking-wider text-foreground">Aggiunta Servizio</h2>');
let discoveryDivStart = content.lastIndexOf('<div transition:slide ', discoveryIndex);
content = content.substring(0, discoveryDivStart) + 
          content.substring(discoveryDivStart).replace(
              /<div transition:slide class="w-full bg-card rounded-2xl border-2/, 
              `<div transition:slide use:clickOutside={{ handler: () => isDiscoveryModalOpen = false, ignore: '.ignore-click-outside' }} class="w-full bg-card rounded-2xl border-2`
          );

// Now for Widget Modal
let widgetIndex = content.indexOf('<h2 class="text-xl font-bold uppercase tracking-wider text-foreground">Aggiunta Rapida Widget</h2>');
let widgetDivStart = content.lastIndexOf('<div transition:slide ', widgetIndex);
content = content.substring(0, widgetDivStart) + 
          content.substring(widgetDivStart).replace(
              /<div transition:slide class="w-full bg-card rounded-2xl border-2/, 
              `<div transition:slide use:clickOutside={{ handler: () => isWidgetModalOpen = false, ignore: '.ignore-click-outside' }} class="w-full bg-card rounded-2xl border-2`
          );


// Add the ignore class to the buttons
content = content.replace(
    /onclick=\{\(e\) => \{ e\.stopPropagation\(\); isDiscoveryModalOpen = \!isDiscoveryModalOpen; if \(isDiscoveryModalOpen\) \{ isWidgetModalOpen = false; window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\); \} \}\}\s*class="(.*?)"/,
    `onclick={(e) => { e.stopPropagation(); isDiscoveryModalOpen = !isDiscoveryModalOpen; if (isDiscoveryModalOpen) { isWidgetModalOpen = false; window.scrollTo({ top: 0, behavior: 'smooth' }); } }} class="$1 ignore-click-outside"`
);

content = content.replace(
    /onclick=\{\(e\) => \{ e\.stopPropagation\(\); isWidgetModalOpen = \!isWidgetModalOpen; if \(isWidgetModalOpen\) \{ isDiscoveryModalOpen = false; window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\); \} \}\}\s*class="(.*?)"/,
    `onclick={(e) => { e.stopPropagation(); isWidgetModalOpen = !isWidgetModalOpen; if (isWidgetModalOpen) { isDiscoveryModalOpen = false; window.scrollTo({ top: 0, behavior: 'smooth' }); } }} class="$1 ignore-click-outside"`
);


fs.writeFileSync('src/routes/+page.svelte', content);
