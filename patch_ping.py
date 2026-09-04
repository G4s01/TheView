with open("src/lib/server/ping.ts", "r") as f:
    content = f.read()

content = 'import { rewriteUrlForDocker } from "$lib/server/dockerHost";\n' + content
content = content.replace('await fetch(url', 'await fetch(rewriteUrlForDocker(url)')

with open("src/lib/server/ping.ts", "w") as f:
    f.write(content)

import os
qbit_path = "src/routes/api/widgets/qbittorrent/+server.ts"
if os.path.exists(qbit_path):
    with open(qbit_path, "r") as f:
        content = f.read()
    
    content = 'import { rewriteUrlForDocker } from "$lib/server/dockerHost";\n' + content
    content = content.replace('await fetch(`${baseUrl}', 'await fetch(rewriteUrlForDocker(`${baseUrl}')
    
    with open(qbit_path, "w") as f:
        f.write(content)
