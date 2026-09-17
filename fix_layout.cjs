const fs = require('fs');
let code = fs.readFileSync('src/routes/+layout.svelte', 'utf-8');
code = code.replace(/let categories = \$derived\(data\.categories \|\| \[\]\);/, 'let grids = $derived(data.grids || []);');
code = code.replace(/categories as category/g, 'grids as grid');
code = code.replace(/category\.count/g, 'grid.count');
code = code.replace(/category\.name/g, 'grid.name');
code = code.replace(/if \(data\.categories\)/, 'if (data.grids)');
fs.writeFileSync('src/routes/+layout.svelte', code);
