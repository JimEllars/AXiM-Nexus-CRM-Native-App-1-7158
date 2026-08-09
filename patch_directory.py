import re

with open("src/pages/Directory.jsx", "r") as f:
    content = f.read()

search_str = """                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200">
                        {contact.first_name[0]}{contact.last_name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{contact.first_name} {contact.last_name}</div>
                        {account && <div className="text-[11px] text-slate-500 font-medium">{account.company_name}</div>}
                      </div>
                    </div>
                  </td>"""

replace_str = """                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200">
                        {contact.first_name[0]}{contact.last_name[0]}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="font-bold text-slate-800">{contact.first_name} {contact.last_name}</div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${account && account.company_name ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                            {account && account.company_name ? 'B2B' : 'B2C'}
                          </span>
                        </div>
                        {account && <div className="text-[11px] text-slate-500 font-medium">{account.company_name}</div>}
                      </div>
                    </div>
                  </td>"""

content = content.replace(search_str, replace_str)

with open("src/pages/Directory.jsx", "w") as f:
    f.write(content)
