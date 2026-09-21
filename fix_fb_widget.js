import fs from 'fs';
let content = fs.readFileSync('src/lib/components/widgets/FilebrowserWidget.svelte', 'utf8');

content = content.replace(
    /let isWide = \$derived\(nodeW > nodeH\);/,
    `let nodeW = $derived(parseInt(size.split('x')[0]) || 1);\n\tlet nodeH = $derived(parseInt(size.split('x')[1]) || 1);\n\tlet isWide = $derived(nodeW > nodeH);`
);

fs.writeFileSync('src/lib/components/widgets/FilebrowserWidget.svelte', content);
