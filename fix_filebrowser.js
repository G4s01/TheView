import fs from 'fs';
let content = fs.readFileSync('src/lib/components/widgets/FilebrowserWidget.svelte', 'utf8');
content = content.replace(
	`let nodeW = $derived(parseInt(size.split('x')[0]) || 1);`,
	`let nodeW = $derived(parseInt(size.split('x')[0].replace('gs-', '')) || 1);`
);
fs.writeFileSync('src/lib/components/widgets/FilebrowserWidget.svelte', content);
