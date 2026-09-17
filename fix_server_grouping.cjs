const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.server.ts', 'utf-8');

// Replace grouping logic
code = code.replace(/for \(const grid of grids\) \{\n\s*if \(grid\.id !== -1\) groupedServices\[grid\.name\] = \[\];\n\s*\}/, 
`for (const grid of grids) {
    if (grid.id !== -1) groupedServices[grid.id.toString()] = [];
  }`);

code = code.replace(/if \(grid && grid\.id !== -1\) \{\n\s*groupedServices\[grid\.name\]\.push\(decorated\);\n\s*\} else \{/,
`if (grid && grid.id !== -1) {
      groupedServices[grid.id.toString()].push(decorated);
    } else {`);

fs.writeFileSync('src/routes/+page.server.ts', code);
