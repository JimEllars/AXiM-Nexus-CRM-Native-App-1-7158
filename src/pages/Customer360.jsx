import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCrm } from '../context/CrmContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import LogActivityModal from '../components/modals/LogActivityModal';

const ActivityIcon = ({ type }) => {
  switch(type) {
    case 'EMAIL': return <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><SafeIcon icon={FiIcons.FiMail} /></div>;
    case 'CALL': return <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><SafeIcon icon={FiIcons.FiPhoneCall} /></div>;
    case 'MEETING': return <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><SafeIcon icon={FiIcons.FiCalendar} /></div>;
    case 'SCRAPE_EVENT': return <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center"><SafeIcon icon={FiIcons.FiDatabase} /></div>;
    case 'ONYX_INTERVENTION': return <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200"><SafeIcon icon={FiIcons.FiCpu} /></div>;
    default: return <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"><SafeIcon icon={FiIcons.FiActivity} /></div>;
  }
};

const Customer360 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contacts, accounts, activities, deals } = useCrm();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const contact = contacts.find(c => c.id === id);
  if (!contact) return <div className="p-8 text-center text-slate-500">Entity not found.</div>;

  const account = accounts.find(a => a.id === contact.account_id);
  const contactActivities = activities.filter(a => a.contact_id === id).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  const activeDeals = deals.filter(d => d.primary_contact_id === id);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-start mb-8">
        <button onClick={() => navigate('/directory')} className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold uppercase tracking-tighter">
          <SafeIcon icon={FiIcons.FiArrowLeft} /> <span>Directory</span>
        </button>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsLogModalOpen(true)}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiPlus} />
            <span>Log Activity</span>
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg">Edit Contact</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-3xl font-black mb-6">
              {contact.first_name[0]}{contact.last_name[0]}
            </div>
            <h2 className="text-2xl font-black text-slate-900">{contact.first_name} {contact.last_name}</h2>
            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-1 mb-8">{contact.type.replace('_', ' ')}</p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                  <SafeIcon icon={FiIcons.FiMail} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Email Address</div>
                  <div className="text-sm font-bold text-slate-700 font-mono">{contact.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                  <SafeIcon icon={FiIcons.FiPhone} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Phone Number</div>
                  <div className="text-sm font-bold text-slate-700 font-mono">{contact.phone}</div>
                </div>
              </div>
            </div>

            {account && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employer</div>
                  <button onClick={() => navigate(`/account/${account.id}`)} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">View Account</button>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-200">
                    <SafeIcon icon={FiIcons.FiBriefcase} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{account.company_name}</div>
                    <div className="text-xs text-slate-500">{account.industry}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center space-x-2">
              <SafeIcon icon={FiIcons.FiTarget} className="text-indigo-500" />
              <span>Active Participation</span>
            </h3>
            <div className="space-y-3">
              {activeDeals.map(deal => (
                <div key={deal.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer">
                  <div className="font-bold text-slate-800 text-sm mb-1">{deal.title}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-black text-slate-900">${deal.amount.toLocaleString()}</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded uppercase">{deal.stage}</span>
                  </div>
                </div>
              ))}
              {activeDeals.length === 0 && <p className="text-xs text-slate-500 text-center py-4 italic">No active deals found.</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 tracking-tight">360° Interaction Matrix</h3>
              <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase">
                <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-indigo-600"></div> <span>AI Swarm</span></div>
                <div className="w-px h-3 bg-slate-200 mx-2"></div>
                <div className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-slate-300"></div> <span>Manual</span></div>
              </div>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-4 before:h-full before:w-0.5 before:bg-slate-100">
                {contactActivities.map((activity) => (
                  <div key={activity.id} className="relative flex items-start space-x-6 group">
                    <div className="z-10 shrink-0">
                      <ActivityIcon type={activity.type} />
                    </div>
                    <div className="flex-1 pb-8 border-b border-slate-50 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${activity.type === 'ONYX_INTERVENTION' ? 'text-indigo-600' : 'text-slate-500'}`}>
                            {activity.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(activity.created_at).toLocaleString()}
                          </span>
                        </div>
                        {activity.logged_by_agent_id === 'current-user' && (
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Verified Admin</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{activity.description}</p>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                          {Object.entries(activity.metadata).map(([key, val]) => (
                            <div key={key}>
                              <div className="text-[9px] font-black text-slate-400 uppercase">{key.replace('_', ' ')}</div>
                              <div className="text-xs font-mono text-slate-600 truncate">{val}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <LogActivityModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        contactId={contact.id}
        dealId={activeDeals[0]?.id}
      />
    </div>
  );
};

export default Customer360;