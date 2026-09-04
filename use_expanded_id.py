import re

with open("src/routes/admin/components/AdminDiscovery.svelte", "r") as f:
    content = f.read()

# Add expandedId state
content = content.replace("let isDiscovering = $state(false);", "let isDiscovering = $state(false);\n\tlet expandedId = $state<string | null>(null);")

# Remove ds.expanded assignment from map
content = content.replace("discoveredServices = data.services.map(s => ({ ...s, expanded: !s.url }));", "discoveredServices = data.services;")

# Update li onclick
old_li = 'onclick={() => discoveredServices[i].expanded = !discoveredServices[i].expanded}'
new_li = 'onclick={() => expandedId = expandedId === ds.id ? null : ds.id}'
content = content.replace(old_li, new_li)

# Update button onclick
old_btn = 'onclick={(e) => { e.stopPropagation(); discoveredServices[i].expanded = !discoveredServices[i].expanded; }}'
new_btn = 'onclick={(e) => { e.stopPropagation(); expandedId = expandedId === ds.id ? null : ds.id; }}'
content = content.replace(old_btn, new_btn)

# Update {#if ds.expanded} -> {#if expandedId === ds.id}
content = content.replace('{#if ds.expanded}', '{#if expandedId === ds.id}')

# Update {#if !ds.added && ds.expanded}
content = content.replace('{#if !ds.added && ds.expanded}', '{#if !ds.added && expandedId === ds.id}')

# Update success callback
content = content.replace('ds.expanded = false;', 'expandedId = null;')

with open("src/routes/admin/components/AdminDiscovery.svelte", "w") as f:
    f.write(content)

print("Switched to expandedId")
