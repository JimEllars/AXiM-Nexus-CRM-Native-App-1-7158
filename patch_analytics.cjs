const fs = require('fs');
let code = fs.readFileSync('src/pages/Analytics.jsx', 'utf8');

// Change grid-cols-3 to grid-cols-4
code = code.replace(/className="grid grid-cols-1 md:grid-cols-3 gap-6"/, 'className="grid grid-cols-1 md:grid-cols-4 gap-6"');
// Change map([1, 2, 3]) to map([1, 2, 3, 4])
code = code.replace(/\{\[1, 2, 3\]\.map\(\(i\) => \(/, '{[1, 2, 3, 4].map((i) => (');

const addition = `              {i === 4 && (
                <>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Avg. Pipeline Velocity</div>
                  <div className="text-3xl font-black text-slate-900">14 Days</div>
                  <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold">
                    <SafeIcon icon={FiIcons.FiTrendingDown} className="mr-1" />
                    <span>-2 Days to Close</span>
                  </div>
                </>
              )}
            </div>`;

code = code.replace(/              \{\/\* Add it here \*\/\}\n            <\/div>/, addition); // wait, let's just do a string replace on the end of the i === 3 block.

const i3Block = `              {i === 3 && (
                <>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Swarm Tasks</div>
                  <div className="text-3xl font-black text-slate-900">1,204</div>
                  <div className="mt-4 flex items-center text-indigo-600 text-xs font-bold">
                    <SafeIcon icon={FiIcons.FiCpu} className="mr-1" />
                    <span>System Stable</span>
                  </div>
                </>
              )}`;

const replacementBlock = i3Block + `
              {i === 4 && (
                <>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Avg. Pipeline Velocity</div>
                  <div className="text-3xl font-black text-slate-900">14 Days</div>
                  <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold">
                    <SafeIcon icon={FiIcons.FiTrendingDown} className="mr-1" />
                    <span>-2 Days to Close</span>
                  </div>
                </>
              )}`;

code = code.replace(i3Block, replacementBlock);
fs.writeFileSync('src/pages/Analytics.jsx', code);
