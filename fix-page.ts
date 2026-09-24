import fs from 'fs';

const filePath = 'src/routes/+page.svelte';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix update()
content = content.replace(
    /if \(el\) grid!\.removeWidget\(el, true\);/g,
    `if (el) {
\t\t\t\t\t\t\t\tif (nodeId) {
\t\t\t\t\t\t\t\t\tconst idNum = parseInt(nodeId);
\t\t\t\t\t\t\t\t\tconst instance = mountedWidgets.get(idNum);
\t\t\t\t\t\t\t\t\tif (instance) {
\t\t\t\t\t\t\t\t\t\tunmount(instance);
\t\t\t\t\t\t\t\t\t\tmountedWidgets.delete(idNum);
\t\t\t\t\t\t\t\t\t\tmountedServices.delete(idNum);
\t\t\t\t\t\t\t\t\t}
\t\t\t\t\t\t\t\t}
\t\t\t\t\t\t\t\tgrid!.removeWidget(el, true);
\t\t\t\t\t\t\t}`
);

// 2. Fix grid!.on('removed')
content = content.replace(
    /grid!\.on\('removed',\s*\(event:\s*Event,\s*items:\s*any\[\]\)\s*=>\s*\{\s*if\s*\(appState\.isEditMode\)\s*saveGridState\(\);\s*\}\);/g,
    `grid!.on('removed', (event: Event, items: any[]) => {
\t\t\t\tif (items) {
\t\t\t\t\titems.forEach((n: any) => {
\t\t\t\t\t\tif (n.id) {
\t\t\t\t\t\t\tconst idNum = parseInt(n.id.toString());
\t\t\t\t\t\t\tconst instance = mountedWidgets.get(idNum);
\t\t\t\t\t\t\tif (instance) {
\t\t\t\t\t\t\t\tunmount(instance);
\t\t\t\t\t\t\t\tmountedWidgets.delete(idNum);
\t\t\t\t\t\t\t\tmountedServices.delete(idNum);
\t\t\t\t\t\t\t}
\t\t\t\t\t\t}
\t\t\t\t\t});
\t\t\t\t}
\t\t\t\tif (appState.isEditMode) saveGridState();
\t\t\t});`
);

fs.writeFileSync(filePath, content);
