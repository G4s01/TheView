const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

code = code.replace(/return async \(\{ update, result \}: any\) => \{\n\s*await update\(\);\n\s*if \(result\.type === 'success'\) \{/g, `return async ({ result }: any) => {
							if (result.type === 'success' || result.type === 'redirect') {`);

fs.writeFileSync('src/routes/+page.svelte', code);
