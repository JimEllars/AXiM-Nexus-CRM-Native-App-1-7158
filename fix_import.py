with open('src/pages/Accounts.jsx', 'r') as f:
    content = f.read()

content = content.replace("import { activityService } from '../services/activityService'; from '../services/accountService';", "import { accountService } from '../services/accountService';\nimport { activityService } from '../services/activityService';")

with open('src/pages/Accounts.jsx', 'w') as f:
    f.write(content)
