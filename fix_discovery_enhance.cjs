const fs = require('fs');
let code = fs.readFileSync('src/routes/admin/components/AdminDiscovery.svelte', 'utf-8');

code = code.replace(/return async \(\{ result, update \}: any\) => \{\n\s*if \(result\.type === 'success'\) \{\n\s*ds\.added = true;\n\s*expandedId = null;\n\s*\}\n\s*await update\(\);\n\s*\};/g, `return async ({ result }: any) => {
											if (result.type === 'success' || result.type === 'redirect') {
												ds.added = true;
												expandedId = null;
											}
										};`);

fs.writeFileSync('src/routes/admin/components/AdminDiscovery.svelte', code);
