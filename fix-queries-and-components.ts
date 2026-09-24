import fs from 'fs';
import path from 'path';

// 1. Fix Queries
const queriesDir = 'src/lib/queries';
const queryFiles = fs.readdirSync(queriesDir).filter(f => f.startsWith('use') && f.endsWith('.ts'));

for (const file of queryFiles) {
    if (file === 'usePing.ts') continue; // already has id
    const filePath = path.join(queriesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Identify the main query function (e.g. useQbittorrent, useAdGuard, etc.)
    const funcNameMatch = content.match(/export function (use[A-Z][a-zA-Z0-9]+)\(/);
    if (funcNameMatch) {
        const funcName = funcNameMatch[1];
        
        // Add serviceId param to the main query function
        content = content.replace(
            new RegExp(`export function ${funcName}\\s*\\(([^)]*)\\)\\s*{`), 
            (match, p1) => {
                if (p1.trim() === '') return `export function ${funcName}(serviceId: () => number) {`;
                if (p1.includes('serviceId:')) return match; // already there
                return `export function ${funcName}(serviceId: () => number, ${p1}) {`;
            }
        );

        // Add ?id=${serviceId()} to the fetch calls inside queryFn
        content = content.replace(
            /fetch\s*\(\s*['"](\/api\/widgets\/[^?'"]+)['"]\s*/g,
            "fetch(`$1?id=${serviceId()}`"
        );
        content = content.replace(
            /fetch\s*\(\s*`(\/api\/widgets\/[^?`]+)`\s*/g,
            "fetch(`$1?id=${serviceId()}`"
        );
        content = content.replace(
            /fetch\s*\(\s*`(\/api\/widgets\/[^?`]+)\?([^`]+)`\s*/g,
            "fetch(`$1?id=${serviceId()}&$2`"
        );
        
        fs.writeFileSync(filePath, content);
    }
}

// 2. Fix Components
const widgetsDir = 'src/lib/components/widgets';
const widgetFiles = fs.readdirSync(widgetsDir).filter(f => f.endsWith('.svelte'));

for (const file of widgetFiles) {
    const filePath = path.join(widgetsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find const query = useX(...);
    content = content.replace(/const\s+(?:[a-zA-Z0-9_]+)?query\s*=\s*(use[A-Z][a-zA-Z0-9]+)\s*\(([^)]*)\)\s*;/g, (match, p1, p2) => {
        // e.g. useQbittorrent() -> useQbittorrent(() => service.id)
        if (p2.trim() === '') return match.replace(`${p1}()`, `${p1}(() => service.id)`);
        if (p2.includes('service.id')) return match;
        return match.replace(`${p1}(${p2})`, `${p1}(() => service.id, ${p2})`);
    });

    fs.writeFileSync(filePath, content);
}
