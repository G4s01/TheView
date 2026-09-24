import fs from 'fs';
import path from 'path';

// 1. Update CardWidget to pass service
const cardWidgetPath = 'src/lib/components/card/CardWidget.svelte';
let cardWidgetContent = fs.readFileSync(cardWidgetPath, 'utf8');
cardWidgetContent = cardWidgetContent.replace(/<([A-Za-z]+Widget)\s*(.*?)\/>/g, (match, p1, p2) => {
    if (match.includes('service=')) return match;
    return `<${p1} service={service} ${p2}/>`;
});
// Special case for ClockWidget since it might just be <ClockWidget />
cardWidgetContent = cardWidgetContent.replace(/<([A-Za-z]+Widget)\s*>/g, `<$1 service={service} >`);
fs.writeFileSync(cardWidgetPath, cardWidgetContent);

// 2. Add service to $props in all widgets
const widgetsDir = 'src/lib/components/widgets';
const widgetFiles = fs.readdirSync(widgetsDir).filter(f => f.endsWith('.svelte'));

for (const file of widgetFiles) {
    const filePath = path.join(widgetsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find let { ... } = $props<{ ... }>() or just $props()
    if (content.includes('$props<')) {
        content = content.replace(/let\s+\{\s*([^}]*)\s*\}\s*=\s*\$props<\s*\{\s*([^}]*)\s*\}\s*>\(\);/, (match, p1, p2) => {
            if (p1.includes('service')) return match;
            const newP1 = `service, ${p1}`.trim().replace(/,\s*$/, '');
            const newP2 = `service: any; ${p2}`.trim();
            return `let { ${newP1} } = $props<{ ${newP2} }>();`;
        });
    } else if (content.includes('$props()')) {
        content = content.replace(/let\s+\{\s*([^}]*)\s*\}\s*=\s*\$props\(\);/, (match, p1) => {
            if (p1.includes('service')) return match;
            const newP1 = `service, ${p1}`.trim().replace(/,\s*$/, '');
            return `let { ${newP1} } = $props<any>();`;
        });
    } else {
        // No props, add it
        content = content.replace(/<script[^>]*>/, `$&
	let { service } = $props<any>();`);
    }

    fs.writeFileSync(filePath, content);
}
