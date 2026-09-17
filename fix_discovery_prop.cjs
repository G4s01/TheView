const fs = require('fs');
let code = fs.readFileSync('src/routes/admin/components/AdminDiscovery.svelte', 'utf-8');

code = code.replace(/let \{ \} = \$props\(\);/, "let { mode = 'admin' } = $props();");

// Hide NPM Settings
code = code.replace(/<SettingsNPMWidget \/>/, "{#if mode === 'admin'}\n\t\t\t\t\t<SettingsNPMWidget />\n\t\t\t\t{/if}");

fs.writeFileSync('src/routes/admin/components/AdminDiscovery.svelte', code);
