with open('src/pages/Accounts.jsx', 'r') as f:
    content = f.read()

content = content.replace("join('\n');", r"join('\n');")

with open('src/pages/Accounts.jsx', 'w') as f:
    f.write(content)
