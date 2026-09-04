with open("src/routes/admin/components/AdminDiscovery.svelte", "r") as f:
    content = f.read()

open_divs = []
lines = content.split('\n')
for i, line in enumerate(lines):
    opens = line.count('<div')
    closes = line.count('</div')
    
    for _ in range(opens):
        open_divs.append(i + 1)
    
    for _ in range(closes):
        if open_divs:
            open_divs.pop()
        else:
            print(f"Extra closing div on line {i + 1}")

if open_divs:
    print("Unclosed divs opened on lines:")
    for line_num in open_divs:
        print(line_num)
else:
    print("All divs balanced.")

