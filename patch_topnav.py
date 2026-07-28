with open('src/components/TopNav.jsx', 'r') as f:
    content = f.read()

# Make sure toggleDarkMode is imported from context
usecrm_pattern = "const { contacts, accounts, deals, activities } = useCrm();"
new_usecrm = "const { contacts, accounts, deals, activities, isDarkMode, toggleDarkMode } = useCrm();"
content = content.replace(usecrm_pattern, new_usecrm)

# Add the toggle button before the notification bell
bell_pattern = """<div className="relative" ref={dropdownRef}>
          <button
            className="text-slate-400 hover:text-slate-600 relative transition-colors"
            onClick={() => {"""

new_bell = """<button
          onClick={toggleDarkMode}
          className="text-slate-400 hover:text-indigo-600 transition-colors"
          title="Toggle Dark Mode"
        >
          <SafeIcon icon={isDarkMode ? FiIcons.FiSun : FiIcons.FiMoon} className="text-xl" />
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            className="text-slate-400 hover:text-slate-600 relative transition-colors"
            onClick={() => {"""

content = content.replace(bell_pattern, new_bell)

with open('src/components/TopNav.jsx', 'w') as f:
    f.write(content)
