with open("src/routes/admin/components/AdminServices.svelte", "r") as f:
    lines = f.readlines()

out = []
recording = False
for line in lines:
    if "<!-- Form Aggiungi Servizio -->" in line:
        recording = True
    if recording:
        out.append(line)
    if recording and "</form>" in line:
        out.append("		</div>\n")
        out.append("		{/if}\n")
        break

with open("current_add_form.txt", "w") as f:
    f.writelines(out)
