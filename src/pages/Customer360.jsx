import React, { useState, useEffect } from 'react';
import { parseMarkdown } from '../utils/formatters.jsx';

import { useParams, useNavigate } from 'react-router-dom';
import { emailService } from '../services/emailService';
import { useCrm } from '../context/CrmContext';
import { notificationService } from '../services/notificationService';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import LogActivityModal from '../components/modals/LogActivityModal';
import EnrichmentStatusPanel from '../components/EnrichmentStatusPanel';

const ActivityIcon = ({ type }) => {
  switch(type) {
    case 'EMAIL': return <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><SafeIcon icon={FiIcons.FiMail} /></div>;
    case 'CALL': return <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><SafeIcon icon={FiIcons.FiPhone} /></div>;
    case 'MEETING': return <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><SafeIcon icon={FiIcons.FiUsers} /></div>;
    case 'SCRAPE_EVENT': return <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center"><SafeIcon icon={FiIcons.FiDatabase} /></div>;
    case 'ONYX_INTERVENTION': return <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200"><SafeIcon icon={FiIcons.FiCpu} /></div>;
    default: return <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"><SafeIcon icon={FiIcons.FiActivity} /></div>;
  }
};

const Customer360 = () => {
  const { id } = useParams();

  const handleFormat = (formatType) => {
    const textarea = document.getElementById('email-body');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    let inserted = '';
    if (formatType === 'bold') inserted = '**bold**';
    if (formatType === 'italic') inserted = '*italic*';
    if (formatType === 'list') inserted = '\n- list item';
    if (formatType === 'link') inserted = '[link](url)';

    const newText = text.substring(0, start) + inserted + text.substring(end);
    textarea.value = newText;
    // restore focus and cursor
    textarea.focus();
    textarea.setSelectionRange(start, start + inserted.length);
  };
  const navigate = useNavigate();
  const { contacts, accounts, activities, deals, logSystemActivity } = useCrm();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [isSending, setIsSending] = useState(false);

const { loading, error } = useCrm();

  if (loading) {
    return (
      <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-pulse">
        <div className="flex justify-between items-center mb-8">
          <div className="h-6 bg-slate-200 rounded w-24"></div>
          <div className="flex space-x-3">
            <div className="h-10 bg-slate-200 rounded w-32"></div>
            <div className="h-10 bg-slate-200 rounded w-32"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
             <div className="h-80 bg-white border border-slate-200 rounded-2xl p-6">
                <div className="w-20 h-20 bg-slate-200 rounded-2xl mb-6"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-slate-200 rounded w-full"></div>
                  <div className="h-10 bg-slate-200 rounded w-full"></div>
                </div>
             </div>
             <div className="h-48 bg-white border border-slate-200 rounded-2xl"></div>
          </div>
          <div className="lg:col-span-2">
             <div className="h-[500px] bg-white border border-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const contact = contacts.find(c => c.id === id);

  if (error || !contact) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <SafeIcon icon={FiIcons.FiUserX} className="text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Entity Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            {error ? "There was an error communicating with the database." : "The requested stakeholder could not be found or has been removed."}
          </p>
          <button
            onClick={() => navigate('/directory')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiArrowLeft} />
            <span>Return to Directory</span>
          </button>
        </div>
      </div>
    );
  }

  const account = accounts.find(a => a.id === contact.account_id);
  const contactActivities = activities.filter(a => a.contact_id === id).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  const activeDeals = deals.filter(d => d.primary_contact_id === id);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button onClick={() => navigate('/directory')} className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold uppercase tracking-tighter">
          <SafeIcon icon={FiIcons.FiArrowLeft} /> <span>Directory</span>
        </button>
        <div className="flex w-full sm:w-auto space-x-3">
          <button 
            onClick={() => setIsLogModalOpen(true)}
            className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiPlus} />
            <span>Log Activity</span>
          </button>
          <button className="flex-1 sm:flex-none bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-center">Edit Contact</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-3xl font-black mb-6">
              {contact.first_name[0]}{contact.last_name[0]}
            </div>
            <h2 className="text-2xl font-black text-slate-900">{contact.first_name} {contact.last_name}</h2>
            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-1 mb-8">{contact.type.replace('_', ' ')}</p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <SafeIcon icon={FiIcons.FiMail} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-slate-400 uppercase">Email Address</div>
                  <div className="text-sm font-bold text-slate-700 font-mono truncate">{contact.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <SafeIcon icon={FiIcons.FiPhone} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-slate-400 uppercase">Phone Number</div>
                  <div className="text-sm font-bold text-slate-700 font-mono truncate">{contact.phone}</div>
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
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-200 shrink-0">
                    <SafeIcon icon={FiIcons.FiBriefcase} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">{account.company_name}</div>
                    <div className="text-xs text-slate-500 truncate">{account.industry}</div>
                  </div>
                </div>
              </div>
            )}
          </div>


          <EnrichmentStatusPanel entityId={id} entityType="contact" />

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-6">
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center space-x-2">
              <SafeIcon icon={FiIcons.FiActivity} className="text-indigo-500" />
              <span>Recent Interactions</span>
            </h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-slate-100 pl-8">
              {contactActivities.slice(0, 5).map((activity) => {
                const type = activity.activity_type || activity.type || 'SYSTEM_EVENT';
                const notes = typeof activity.notes === 'string' ? JSON.parse(activity.notes) : (activity.notes || {});
                const description = notes.description || activity.description || '';

                return (
                <div key={activity.id} className="relative group">
                  <div className="absolute -left-8 top-1">
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mb-1">{type.replace('_', ' ')}</div>
                  <div className="text-[10px] text-slate-400 mb-2 font-mono">{new Date(activity.created_at).toLocaleString()}</div>
                  <p className="text-xs text-slate-600 leading-relaxed truncate">{type === 'EMAIL_SENT' ? parseMarkdown(description) : description}</p>
                </div>
              )})}
              {contactActivities.length === 0 && <p className="text-xs text-slate-500 italic py-2">No recent interactions.</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-6">
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center space-x-2">
              <SafeIcon icon={FiIcons.FiMail} className="text-indigo-500" />
              <span>Send Email</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  id="email-subject"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Enter email subject"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>

                <div className="flex items-center space-x-1 mb-2 bg-slate-50 border border-slate-200 rounded-lg p-1 w-fit sticky top-0 z-10">
                  <select
                    className="mr-2 p-1 text-xs text-slate-600 bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-500"
                    onChange={(e) => {
                      const val = e.target.value;
                      const textarea = document.getElementById('email-body');
                      if (!textarea) return;
                      let template = '';
                      if (val === 'intro') {
                        template = 'Hi there,\n\nI wanted to reach out regarding **[Topic]**.\n\nPlease let me know when you have time to chat.\n\nThanks!';
                      } else if (val === 'followup') {
                        template = 'Hello again,\n\nJust following up on my previous message.\n\n*Best regards,*';
                      }
                      if (template) {
                        textarea.value = (textarea.value ? textarea.value + '\n\n' : '') + template;
                      }
                      e.target.value = ''; // reset
                    }}
                  >
                    <option value="">Templates</option>
                    <option value="intro">Intro Outreach</option>
                    <option value="followup">Follow Up</option>
                  </select>
                  <div className="w-px h-4 bg-slate-300 mx-1"></div>
                  <button onClick={() => handleFormat('bold')} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors" title="Bold">
                     <span className="font-bold font-serif px-1">B</span>
                  </button>
                  <button onClick={() => handleFormat('italic')} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors" title="Italic">
                     <span className="italic font-serif px-1">I</span>
                  </button>
                  <button onClick={() => handleFormat('list')} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors" title="Bullet List">
                     <SafeIcon icon={FiIcons.FiList} />
                  </button>
                  <button onClick={() => handleFormat('link')} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors" title="Link">
                     <SafeIcon icon={FiIcons.FiLink} />
                  </button>
                </div>
                <textarea
                  id="email-body"
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-32 resize-none"
                  placeholder="Type your message here..."
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    const subjectInput = document.getElementById('email-subject');
                    const bodyInput = document.getElementById('email-body');
                    const subject = subjectInput.value;
                    const body = bodyInput.value;

                    if (!subject || !body) {
                      notificationService.notifyError('Subject and message are required.');
                      return;
                    }

                    setIsSending(true);
                    try {
                      await emailService.sendTransactionalEmail(id, subject, body);
                      await logSystemActivity(
                        `Operator sent email to ${contact.first_name} ${contact.last_name}. Subject: ${subject}`,
                        'EMAIL_SENT',
                        { contact_id: id, entity_id: id }
                      );
                      subjectInput.value = '';
                      bodyInput.value = '';
                      notificationService.notifySuccess('Email dispatched to Edge Network successfully.');
                    } catch (err) {
                      console.error(err);
                      notificationService.notifyError('Failed to send email. Check connection.');
                    } finally {
                      setIsSending(false);
                    }
                  }}
                  disabled={isSending}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center space-x-2 ${isSending ? 'bg-indigo-400 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                  <SafeIcon icon={FiIcons.FiSend} /><span>Send Message</span>
                </button>
              </div>
            </div>
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col min-h-[500px]">
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
                {/* Filter Pills */}
                <div className="flex space-x-2 mb-6">
                  {['All', 'Communications', 'System'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFilterType(filter)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                        filterType === filter
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                {contactActivities.filter((activity) => {
                  const type = (activity.activity_type || activity.type || 'SYSTEM_EVENT').toLowerCase();
                  if (filterType === 'Communications') {
                    return type.includes('call') || type.includes('email') || type.includes('message');
                  }
                  if (filterType === 'System') {
                    return type.includes('onyx') || type.includes('system') || type.includes('stage_change') || type.includes('alert') || type.includes('ticket') || type.includes('webhook') || type.includes('automation');
                  }
                  return true;
                }).map((activity) => {
                  const type = activity.activity_type || activity.type || 'SYSTEM_EVENT';
                  const notes = typeof activity.notes === 'string' ? JSON.parse(activity.notes) : (activity.notes || {});
                  const description = notes.description || activity.description || '';

                  let typeColor = 'text-slate-500';
                  if (type.toLowerCase().includes('email')) typeColor = 'text-blue-600';
                  else if (type.toLowerCase().includes('stage_change')) typeColor = 'text-green-600';
                  else if (type.toLowerCase().includes('onyx')) typeColor = 'text-purple-600';
                  else if (type === 'ONYX_INTERVENTION') typeColor = 'text-indigo-600';

                  return (
                  <div key={activity.id} className="relative flex items-start space-x-6 group">
                    <div className="z-10 shrink-0">
                      <ActivityIcon type={type} />
                    </div>
                    <div className="flex-1 pb-8 border-b border-slate-50 last:border-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-3">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${typeColor}`}>
                            {type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(activity.created_at).toLocaleString()}
                          </span>
                        </div>
                        {activity.logged_by_agent_id === 'current-user' && (
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded self-start sm:self-auto">Verified Admin</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{type === 'EMAIL_SENT' ? parseMarkdown(description) : description}</p>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                )})}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <LogActivityModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        entityId={contact.id}
        entityType="contact"
      />
    </div>
  );
};

export default Customer360;
