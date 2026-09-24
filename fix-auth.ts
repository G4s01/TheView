import fs from 'fs';
import path from 'path';

const widgetsDir = 'src/routes/api/widgets';
const folders = fs.readdirSync(widgetsDir);

for (const folder of folders) {
    const serverPath = path.join(widgetsDir, folder, '+server.ts');
    if (!fs.existsSync(serverPath)) continue;

    let content = fs.readFileSync(serverPath, 'utf8');
    
    // Fix GET
    content = content.replace(
        /if \(\s*service\.requireAuth\s*&&\s*!locals\.isAdmin\s*\)\s*\{/g,
        `if ((service.requireAuth === true || service.requireAuth === 1) && !locals.isAdmin) {`
    );

    // Fix POST
    // Look for export const POST: RequestHandler = async ({ request, locals }) => {
    // If locals is missing, add it. Then check if !locals.isAdmin check exists.
    content = content.replace(/export const POST: RequestHandler = async \(([^)]*)\)\s*=>\s*\{/g, (match, p1) => {
        let params = p1.trim();
        if (params.startsWith('{') && params.endsWith('}')) {
            let inner = params.slice(1, -1).trim();
            if (!inner.includes('locals')) inner += ', locals';
            params = `{ ${inner} }`;
        } else if (params === '') {
            params = '{ request, locals }';
        }
        return `export const POST: RequestHandler = async (${params}) => {`;
    });

    // Now inject if (!locals.isAdmin) return json({ error: "Unauthorized" }, { status: 401 }); if it doesn't exist
    if (content.includes('export const POST: RequestHandler')) {
        const postRegex = /export const POST: RequestHandler = async \([^)]*\)\s*=>\s*\{/;
        const postMatch = content.match(postRegex);
        if (postMatch) {
            const index = postMatch.index! + postMatch[0].length;
            const textAfter = content.slice(index, index + 100);
            if (!textAfter.includes('locals.isAdmin')) {
                content = content.slice(0, index) + `\n\tif (!locals.isAdmin) return new Response('Unauthorized', { status: 401 });\n` + content.slice(index);
            }
        }
    }

    fs.writeFileSync(serverPath, content);
    console.log(`Fixed ${serverPath}`);
}
