import fs from 'fs';
import path from 'path';

const widgetsDir = 'src/routes/api/widgets';
const folders = fs.readdirSync(widgetsDir);

for (const folder of folders) {
    const serverPath = path.join(widgetsDir, folder, '+server.ts');
    if (!fs.existsSync(serverPath)) continue;

    let content = fs.readFileSync(serverPath, 'utf8');
    
    // Check if it has a GET method
    if (content.includes('export const GET')) {
        if (!content.includes('import { db } from')) {
            content = `import { db } from "$lib/server/db";\nimport { services } from "$lib/server/db/schema";\nimport { eq } from "drizzle-orm";\n` + content;
        }

        const authLogic = `\n\tconst serviceId = url.searchParams.get('id');
\tif (serviceId) {
\t\tconst service = await db.select().from(services).where(eq(services.id, parseInt(serviceId))).get();
\t\tif (service && service.requireAuth && !locals.isAdmin) {
\t\t\treturn new Response('Unauthorized', { status: 401 });
\t\t}
\t}\n`;
        
        // Find export const GET: RequestHandler = async (params) => {
        content = content.replace(/(export const GET(?:.*?)=\s*async\s*\()([^)]*)(\)\s*=>\s*{)/, (match, p1, p2, p3) => {
            // p2 is the params list, e.g. "", "{ request }", "{ locals }"
            let params = p2.trim();
            if (params === '') {
                params = '{ url, locals }';
            } else if (params.startsWith('{') && params.endsWith('}')) {
                // remove braces
                let inner = params.slice(1, -1).trim();
                if (!inner.includes('url')) inner += ', url';
                if (!inner.includes('locals')) inner += ', locals';
                params = `{ ${inner} }`;
            }
            return p1 + params + p3 + authLogic;
        });
        
        fs.writeFileSync(serverPath, content);
    }
}
