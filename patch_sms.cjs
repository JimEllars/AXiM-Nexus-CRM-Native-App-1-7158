const fs = require('fs');
let code = fs.readFileSync('src/pages/Customer360.jsx', 'utf8');

const target = `<h3 className="text-sm font-black text-slate-900 mb-4 flex items-center space-x-2">
              <SafeIcon icon={FiIcons.FiMail} className="text-indigo-500" />
              <span>Send Email</span>
            </h3>`;

const replacement = `<div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                <SafeIcon icon={FiIcons.FiMail} className="text-indigo-500" />
                <span>Send Email</span>
              </h3>
              <button
                onClick={() => notificationService.notifyInfo('SMS gateway routing pending.')}
                className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                title="Send SMS"
              >
                <SafeIcon icon={FiIcons.FiMessageSquare} />
              </button>
            </div>`;

code = code.replace(target, replacement);

// Wait, the prompt says "Next to the "Send Email" button". But there is NO "Send Email" button. Only a "Send Message" button and a "Send Email" header.
// If they meant the "Send Message" button:
const target2 = `                  <SafeIcon icon={FiIcons.FiSend} /><span>Send Message</span>
                </button>
              </div>`;

const replacement2 = `                  <SafeIcon icon={FiIcons.FiSend} /><span>Send Message</span>
                </button>
                <button
                  onClick={() => notificationService.notifyInfo('SMS gateway routing pending.')}
                  className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors shadow-sm ml-3 flex items-center justify-center"
                  title="Send SMS"
                >
                  <SafeIcon icon={FiIcons.FiMessageSquare} />
                </button>
              </div>`;

code = code.replace(target2, replacement2);
fs.writeFileSync('src/pages/Customer360.jsx', code);
