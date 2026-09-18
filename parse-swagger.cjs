const fs = require('fs');
let content = fs.readFileSync('swagger.json', 'utf8');
// content is something like {"openapi":"3.0.3",...}}}</script>...
// Find the first { and the matching closing }
let start = content.indexOf('{"openapi"');
let end = content.lastIndexOf('}');
// actually we can just extract until the end of the JSON object, SvelteKit embeds it as window.__svelte... or just JSON string.
// Let's just try to parse the whole line if it's cleanly isolated, but it might have trailing HTML.
let objStr = content.substring(start);
let open = 0;
let jsonEnd = 0;
for(let i=0; i<objStr.length; i++) {
  if (objStr[i] === '{') open++;
  if (objStr[i] === '}') open--;
  if (open === 0) { jsonEnd = i + 1; break; }
}
let json = JSON.parse(objStr.substring(0, jsonEnd));
let paths = json.paths;
for (let path in paths) {
  if (path.includes('container') || path.includes('update') || path.includes('recreate')) {
     console.log(path, Object.keys(paths[path]));
     if (paths[path].post && paths[path].post.requestBody) {
        console.log(JSON.stringify(paths[path].post.requestBody, null, 2));
     }
  }
}
