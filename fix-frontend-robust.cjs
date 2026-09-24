const fs = require('fs');
const path = require('path');

// 1. Queries
const queriesDir = 'src/lib/queries';
const queryFiles = fs.readdirSync(queriesDir).filter(f => f.startsWith('use') && f.endsWith('.ts') && f !== 'usePing.ts');

for (const file of queryFiles) {
    const filePath = path.join(queriesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const funcName = 'use' + file.replace('use', '').replace('.ts', '');
    
    // Replace export function useX(...) { with export function useX(serviceId: () => number, ...) {
    // We can do this by finding the exact function declaration
    const lines = content.split('\n');
    let updated = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(`export function ${funcName}(`)) {
            const signature = lines[i];
            if (signature.includes('serviceId:')) continue; // already updated
            
            if (signature.includes('() {')) {
                lines[i] = signature.replace('() {', '(serviceId: () => number) {');
            } else {
                lines[i] = signature.replace('(', '(serviceId: () => number, ');
            }
            
            // Now we need to find the queryKey and queryFn in the next few lines
            let j = i + 1;
            while (j < lines.length && j < i + 20) {
                if (lines[j].includes('queryKey:')) {
                    lines[j] = lines[j].replace(/\[\s*['"](.*?)['"]\s*\]/, `["$1", serviceId()]`);
                }
                if (lines[j].includes('fetch(')) {
                    if (lines[j].includes('?sysId=')) {
                        lines[j] = lines[j].replace('?sysId=', '?id=${serviceId()}&sysId=');
                    } else if (lines[j].includes('fetch(') && !lines[j].includes('method:')) {
                        // It's the GET fetch
                        lines[j] = lines[j].replace(/['"](\/api\/widgets\/[^'"]+)['"]/, '`$1?id=${serviceId()}`');
                    }
                }
                j++;
            }
            updated = true;
            break; // only the main function
        }
    }

    if (updated) {
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`Updated query ${file}`);
    }
}

// 2. Components
const widgetsDir = 'src/lib/components/widgets';
const widgetFiles = fs.readdirSync(widgetsDir).filter(f => f.endsWith('.svelte'));

for (const file of widgetFiles) {
    const filePath = path.join(widgetsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const funcName = 'use' + file.replace('Widget.svelte', '').replace('Node.svelte', '');
    
    // QBittorrentWidget -> useQBittorrent but the file is useQbittorrent.ts (b lowercase)
    // We just find const query = useX(...);
    let updated = false;
    content = content.replace(/(?:let|const)\s+(?:[a-zA-Z0-9_]+)?query\s*=\s*(use[A-Za-z0-9]+)\s*\(([^;]*)\)\s*;/g, (match, fn, p2) => {
        // If it's a mutation like useQbittorrentPause, skip
        if (fn.includes('Pause') || fn.includes('Resume') || fn.includes('Delete') || fn.includes('Add') || fn.includes('Actions') || fn.includes('Toggle')) {
            return match;
        }
        updated = true;
        let params = p2.trim();
        if (params === '') {
            return match.replace(`${fn}()`, `${fn}(() => service.id)`);
        } else {
            return match.replace(`${fn}(${params})`, `${fn}(() => service.id, ${params})`);
        }
    });

    if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated component ${file}`);
    }
}
