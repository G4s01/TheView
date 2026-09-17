const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

// The aside string
const asideRegex = /\s*\{#if appState\.isEditMode\}\n\s*<aside[\s\S]*?<\/aside>\n\s*\{\/if\}\n/;

const match = code.match(asideRegex);
if (match) {
    code = code.replace(match[0], ''); // remove from bottom
    // Now insert it right before the closing </div> of the flex container!
    // The closing </div> is just before `{#if totalRealServices === 0}`
    code = code.replace(/<\/div>\n\n\t\{#if totalRealServices === 0\}/, `${match[0]}\n</div>\n\n\t{#if totalRealServices === 0}`);
}
fs.writeFileSync('src/routes/+page.svelte', code);
