with open('src/App.jsx', 'r') as f:
    content = f.read()

import_pattern = "import React, { useState } from 'react';"
new_import = "import React, { useState, useEffect } from 'react';"
content = content.replace(import_pattern, new_import)

layout_start_pattern = "const MainLayout = ({ children }) => {\n  const [isSidebarOpen, setIsSidebarOpen] = useState(false);"
new_layout = """const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDarkMode } = useCrm();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);"""
content = content.replace(layout_start_pattern, new_layout)

import_usecrm_pattern = "import { CrmProvider } from './context/CrmContext';"
new_import_usecrm = "import { CrmProvider, useCrm } from './context/CrmContext';"
content = content.replace(import_usecrm_pattern, new_import_usecrm)

with open('src/App.jsx', 'w') as f:
    f.write(content)
