const fs = require('fs');

let content = fs.readFileSync('src/pages/Directory.jsx', 'utf-8');

// Add import correctly this time
if (!content.includes("exportToCsv")) {
  content = content.replace(
    "import { supabase } from '../lib/supabase';",
    "import { supabase } from '../lib/supabase';\nimport { exportToCsv } from '../utils/csv';"
  );
}

// Add button
const importCsvButtonBlock = `          {isAdmin && (<button
            onClick={() => setIsCsvImportModalOpen(true)}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center space-x-2 shrink-0"
          >
            <SafeIcon icon={FiIcons.FiUpload} />
            <span className="hidden sm:inline">Import CSV</span>
          </button>)}`;

const downloadCsvButtonBlock = `          {isAdmin && (<button
            onClick={() => exportToCsv(localContacts, 'axim-contacts-export.csv')}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center space-x-2 shrink-0"
          >
            <SafeIcon icon={FiIcons.FiDownload} />
            <span className="hidden sm:inline">Download CSV</span>
          </button>)}`;

if (content.includes(importCsvButtonBlock) && !content.includes("Download CSV")) {
  content = content.replace(importCsvButtonBlock, importCsvButtonBlock + '\n' + downloadCsvButtonBlock);
}

fs.writeFileSync('src/pages/Directory.jsx', content);
