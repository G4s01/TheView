const fs = require('fs');
let code = fs.readFileSync('src/routes/admin/components/AdminDiscovery.svelte', 'utf-8');

code = code.replace(/let \{ mode = 'admin' \} = \$props\(\);/, "let { mode = 'admin', onServiceAdded } = $props<{ mode?: string, onServiceAdded?: () => void }>();");

code = code.replace(/ds\.added = true;\n\s*expandedId = null;/, `ds.added = true;
												expandedId = null;
												if (onServiceAdded) onServiceAdded();`);

fs.writeFileSync('src/routes/admin/components/AdminDiscovery.svelte', code);
