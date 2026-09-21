import fs from 'fs';

let content = fs.readFileSync('src/routes/+layout.svelte', 'utf8');

// Combine into existing svelte:window
content = content.replace(
    /<svelte:window onscroll=\{handleScroll\} \/>/,
    `<svelte:window onscroll={handleScroll} bind:scrollY />`
);

// If it's already there (maybe another run?), ensure it's correct
if (content.indexOf('bind:scrollY') === -1) {
    console.log("Failed to find svelte:window to add bind:scrollY");
}

fs.writeFileSync('src/routes/+layout.svelte', content);
