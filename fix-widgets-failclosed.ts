import fs from 'fs';
import path from 'path';

const widgetsDir = 'src/routes/api/widgets';
const folders = fs.readdirSync(widgetsDir);

for (const folder of folders) {
    const serverPath = path.join(widgetsDir, folder, '+server.ts');
    if (!fs.existsSync(serverPath)) continue;

    let content = fs.readFileSync(serverPath, 'utf8');
    
    // Replace the old fail-open logic with the new fail-closed logic
    const oldAuthLogicRegex = /\n\tconst serviceId = url\.searchParams\.get\('id'\);\n\tif \(serviceId\) \{[\s\S]*?return new Response\('Unauthorized', \{ status: 401 \}\);\n\t\t\}\n\t\}\n/;
    
    const newAuthLogic = `
	const serviceId = url.searchParams.get('id');
	if (!serviceId) return new Response('Bad Request: missing id', { status: 400 });
	
	const serviceIdParsed = parseInt(serviceId, 10);
	if (isNaN(serviceIdParsed)) return new Response('Bad Request: invalid id', { status: 400 });

	const service = await db.select().from(services).where(eq(services.id, serviceIdParsed)).get();
	if (!service) return new Response('Not Found: service does not exist', { status: 404 });
	
	if (service.requireAuth && !locals.isAdmin) {
		return new Response('Unauthorized', { status: 401 });
	}
`;
    
    if (oldAuthLogicRegex.test(content)) {
        content = content.replace(oldAuthLogicRegex, newAuthLogic);
        fs.writeFileSync(serverPath, content);
        console.log(`Updated ${serverPath}`);
    } else {
        console.log(`Could not find old logic in ${serverPath}`);
    }
}
