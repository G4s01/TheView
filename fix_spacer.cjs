const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');
code = code.replace(/const newService = await res\.json\(\);\n\s*grid!\.update\(item\.el, \{ id: newService\.id\.toString\(\) \}\);/g, "const jsonRes = await res.json();\n\t\t\t\t\t\t\t\tgrid!.update(item.el, { id: jsonRes.service.id.toString() });");
fs.writeFileSync('src/routes/+page.svelte', code);
