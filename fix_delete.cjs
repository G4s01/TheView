const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');
code = code.replace(
  /<button onclick=\{\(\) => deleteGrid\(gridObj\.id\)\} class="p-2 text-destructive hover:bg-destructive\/10 transition-colors bg-card rounded-md shadow-sm border border-border" title="Elimina Griglia">\n\s*<Trash class="w-4 h-4" \/>\n\s*<\/button>/g,
  '<ConfirmDeleteButton onConfirm={() => deleteGrid(gridObj.id)} class="h-8 w-8 bg-card text-destructive hover:bg-destructive/10 border border-border rounded-md shadow-sm" />'
);
fs.writeFileSync('src/routes/+page.svelte', code);
