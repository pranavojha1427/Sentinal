import os
import re

path = "src/components/ChatAssistant.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# I need to find the matching closing div for the Chat Widget Panel and add </>
# Since it's at the end of the file:
old_end = """        </div>
      )}
    </>
  );
}"""

new_end = """        </div>
        </>
      )}
    </>
  );
}"""

content = content.replace(old_end, new_end)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed fragment in ChatAssistant")
