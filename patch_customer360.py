import re

with open("src/pages/Customer360.jsx", "r") as f:
    content = f.read()

search_str = """        <div className="flex w-full sm:w-auto space-x-3">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiPlus} />
            <span>Log Activity</span>
          </button>
          <button className="flex-1 sm:flex-none bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-center">Edit Contact</button>
        </div>"""

replace_str = """        <div className="flex w-full sm:w-auto space-x-3">
          <button
            onClick={() => notificationService.notifyInfo('Ground Game sync API endpoint pending.')}
            className="flex-1 sm:flex-none bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiRefreshCw} />
            <span>Sync to Ground Game</span>
          </button>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiPlus} />
            <span>Log Activity</span>
          </button>
          <button className="flex-1 sm:flex-none bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-center">Edit Contact</button>
        </div>"""

content = content.replace(search_str, replace_str)

with open("src/pages/Customer360.jsx", "w") as f:
    f.write(content)
