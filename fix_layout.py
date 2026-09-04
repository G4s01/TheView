import re

with open("src/routes/+layout.svelte", "r") as f:
    content = f.read()

# I need to close the div correctly.
# The structure is currently:
# 					<div class="relative w-full overflow-hidden flex items-center">
# ...
# 					</nav>
# 				{/if}

# I should find `</nav>\n\t\t\t\t{/if}` and replace it with `</nav>\n\t\t\t\t\t</div>\n\t\t\t\t{/if}`.

content = re.sub(
    r"</nav>\s*\{/if\}\s*</div>\s*<!-- Right Column \(Actions\) -->",
    """</nav>\n\t\t\t\t\t</div>\n\t\t\t\t{/if}\n\t\t\t</div>\n\n\t\t\t<!-- Right Column (Actions) -->""",
    content
)

with open("src/routes/+layout.svelte", "w") as f:
    f.write(content)
