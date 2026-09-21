import fs from 'fs';

let content = fs.readFileSync('src/routes/+layout.server.ts', 'utf8');

if (!content.includes('usedWidgetTypes')) {
    content = content.replace(
        /const allServices = await db\s*\.select\(\{ categoryId: services\.categoryId, grid_id: services\.grid_id \}\)\s*\.from\(services\);/,
        `const allServices = await db
    .select({ categoryId: services.categoryId, grid_id: services.grid_id, widgetType: services.widgetType })
    .from(services);
    
  const usedWidgetTypes = Array.from(new Set(allServices.map(s => s.widgetType).filter(t => t && t !== 'none' && t !== 'spacer')));`
    );
    
    content = content.replace(
        /settings,/,
        `settings,
    usedWidgetTypes,`
    );
    
    fs.writeFileSync('src/routes/+layout.server.ts', content);
}
