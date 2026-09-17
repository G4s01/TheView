const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.server.ts', 'utf-8');

const regex = /grids = await db\n\s*\.select\(\)\n\s*\.from\(dashboard_grids\)\n\s*\.orderBy\(dashboard_grids\.position\);/;
const replacement = `grids = await db
      .select()
      .from(dashboard_grids)
      .orderBy(dashboard_grids.position);
      
    if (grids.length === 0) {
      const inserted = await db.insert(dashboard_grids).values({
        name: "MAIN",
        position: 0,
        show_header: false
      }).returning();
      grids = inserted;
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/routes/+page.server.ts', code);
