import re

with open('src/context/CrmContext.jsx', 'r') as f:
    content = f.read()

# Add isDarkMode state
state_pattern = r"const \[isSweeping, setIsSweeping\] = useState\(false\);"
new_state = "const [isSweeping, setIsSweeping] = useState(false);\n  const [isDarkMode, setIsDarkMode] = useState(true);"
content = re.sub(state_pattern, new_state, content)

# Export the state and toggle function in the value prop
provider_pattern = r"refreshData: loadAllData, realtimeStatus, authLoading, enrichmentQueue"
new_provider = "refreshData: loadAllData, realtimeStatus, authLoading, enrichmentQueue, isDarkMode, setIsDarkMode, toggleDarkMode: () => setIsDarkMode(prev => !prev)"
content = re.sub(provider_pattern, new_provider, content)

with open('src/context/CrmContext.jsx', 'w') as f:
    f.write(content)
