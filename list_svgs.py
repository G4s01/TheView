import os
import re

svg_pattern = re.compile(r'<svg.*?</svg>', re.DOTALL)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.svelte'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
                svgs = svg_pattern.findall(content)
                if svgs:
                    print(f"--- {path} ---")
                    for svg in svgs:
                        print(svg)
