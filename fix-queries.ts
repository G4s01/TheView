import fs from 'fs';
import path from 'path';

const queriesDir = 'src/lib/queries';
const files = fs.readdirSync(queriesDir).filter(f => f.startsWith('use') && f.endsWith('.ts'));

for (const file of files) {
    const filePath = path.join(queriesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. For exported functions that return createQuery, add serviceId: () => number
    // We match `export function useAdGuard(enabled:` or `export function useAdGuard() {`
    // Wait, some have parameters, some don't.
    content = content.replace(/(export function use[a-zA-Z0-9]+)\s*\(\s*(enabled:[^)]+)?\)\s*{/, (match, p1, p2) => {
        if (p2) return `${p1}(serviceId: () => number, ${p2}) {`;
        return `${p1}(serviceId: () => number) {`;
    });
    
    // Also some have no arguments: `export function useFilebrowser() {`
    // The regex above handles it. But we should only do this for the main query, not Mutations.
    // Actually the regex export function useX() matches everything.
    // Let's be more specific.

    fs.writeFileSync(filePath, content);
}
