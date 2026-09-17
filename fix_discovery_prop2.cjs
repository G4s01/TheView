const fs = require('fs');
let code = fs.readFileSync('src/routes/admin/components/AdminDiscovery.svelte', 'utf-8');

const oldTag = /<SettingsNPMWidget[\s\S]*?\/>/;
code = code.replace(oldTag, `{#if mode === 'admin'}
$&
{/if}`);

fs.writeFileSync('src/routes/admin/components/AdminDiscovery.svelte', code);
