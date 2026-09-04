with open("src/lib/server/discovery.ts", "r") as f:
    content = f.read()

content = 'import { rewriteUrlForDocker } from "$lib/server/dockerHost";\n' + content
content = content.replace('fetch(`${npmUrl.replace(/\\/$/, "")}/api/tokens`', 'fetch(rewriteUrlForDocker(`${npmUrl.replace(/\\/$/, "")}/api/tokens`)')
content = content.replace('fetch(\n      `${npmUrl.replace(/\\/$/, "")}/api/nginx/proxy-hosts?expand=owner,access_list,certificate`', 'fetch(\n      rewriteUrlForDocker(`${npmUrl.replace(/\\/$/, "")}/api/nginx/proxy-hosts?expand=owner,access_list,certificate`)')
content = content.replace('fetch(\n          `${npmUrl.replace(/\\/$/, "")}/api/nginx/proxy-hosts?expand=owner,access_list,certificate`', 'fetch(\n          rewriteUrlForDocker(`${npmUrl.replace(/\\/$/, "")}/api/nginx/proxy-hosts?expand=owner,access_list,certificate`)')

with open("src/lib/server/discovery.ts", "w") as f:
    f.write(content)
