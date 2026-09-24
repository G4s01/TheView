import fs from 'fs';
import path from 'path';

// 1. Queries
const queriesDir = 'src/lib/queries';
const queryFiles = fs.readdirSync(queriesDir).filter(f => f.startsWith('use') && f.endsWith('.ts'));

for (const file of queryFiles) {
    if (file === 'usePing.ts') continue;
    
    const filePath = path.join(queriesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add serviceId: () => number as the first parameter to the main query function
    // For example: export function useAdGuard(enabled: () => boolean = () => true) {
    // becomes: export function useAdGuard(serviceId: () => number, enabled: () => boolean = () => true) {
    
    // Also, some have NO params: export function useFilebrowser() {
    
    const match = content.match(/export function (use[A-Z][a-zA-Z0-9]+)\s*\(([^)]*)\)\s*{/);
    if (match) {
        const funcName = match[1]; // useAdGuard
        const params = match[2].trim();
        
        let newParams = 'serviceId: () => number';
        if (params.length > 0) {
            newParams += ', ' + params;
        }
        
        content = content.replace(match[0], `export function ${funcName}(${newParams}) {`);
        
        // Now find the queryKey and add serviceId() to it to ensure cache invalidation per widget instance
        // queryKey: ["qbittorrent"] -> queryKey: ["qbittorrent", serviceId()]
        const queryKeyRegex = new RegExp(`queryKey:\\s*\\[\\s*["']([^"']+)["']\\s*\\]`);
        content = content.replace(queryKeyRegex, `queryKey: ["$1", serviceId()]`);

        // Now find the GET fetch call for this query and append ?id=${serviceId()}
        // The fetch call is usually inside queryFn: async () => { ... fetch("/api/widgets/...") }
        // We only want to append ?id to the GET request, not POST mutations!
        // We'll just look for fetch("/api/widgets/X") or fetch(`/api/widgets/X`) or fetch(`/api/widgets/X?sysId=...`)
        // inside the main query.
        
        // A safer way is to just inject it directly to the first fetch call that corresponds to the GET
        content = content.replace(/fetch\s*\(\s*["']\/api\/widgets\/[^"']+["']\s*\)/, (m) => {
            return m.replace('")', '?id=${serviceId()}`)').replace("')", '?id=${serviceId()}`)').replace('("/', '(`/').replace("('/", '(`/');
        });
        content = content.replace(/fetch\s*\(\s*`\/api\/widgets\/[^`]+`\s*\)/, (m) => {
            if (m.includes('?')) return m.replace('`', '`').replace('`)', '&id=${serviceId()}`)');
            return m.replace('`', '`').replace('`)', '?id=${serviceId()}`)');
        });

        fs.writeFileSync(filePath, content);
        console.log(`Updated query ${file}`);
    }
}

// 2. Components
const widgetsDir = 'src/lib/components/widgets';
const widgetFiles = fs.readdirSync(widgetsDir).filter(f => f.endsWith('.svelte'));

for (const file of widgetFiles) {
    const filePath = path.join(widgetsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find const query = useX(...);
    let updated = false;
    content = content.replace(/(?:let|const)\s+(?:[a-zA-Z0-9_]+)?query\s*=\s*(use[A-Z][a-zA-Z0-9]+)\s*\(([^)]*)\)\s*;/g, (match, funcName, p2) => {
        updated = true;
        let params = p2.trim();
        if (params === '') {
            return match.replace(`${funcName}()`, `${funcName}(() => service.id)`);
        } else {
            return match.replace(`${funcName}(${params})`, `${funcName}(() => service.id, ${params})`);
        }
    });

    if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated component ${file}`);
    }
}
