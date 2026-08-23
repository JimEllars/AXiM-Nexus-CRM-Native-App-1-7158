const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.jsx', 'utf-8');

if (!content.includes("notificationService")) {
  content = content.replace(
    "import { useCrm } from '../context/CrmContext';",
    "import { useCrm } from '../context/CrmContext';\nimport { notificationService } from '../services/notificationService';"
  );
}

const sandboxStub = `
        {/* Sandbox Mode Toggle */}
        <div className="px-4 pb-4">
          <div className="bg-slate-800 rounded-xl p-3 flex items-center justify-between border border-slate-700">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiIcons.FiShield} className="text-slate-400" />
              <span className="text-xs font-medium text-slate-300">Sandbox Mode</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                onChange={() => notificationService.notifyInfo('Test environment isolation pending.')}
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500 peer-checked:after:bg-white"></div>
            </label>
          </div>
        </div>
      </div>
    </>
`;

content = content.replace("      </div>\n    </>", sandboxStub);

fs.writeFileSync('src/components/Sidebar.jsx', content);
