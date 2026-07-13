import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCrm } from '../context/CrmContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import LogActivityModal from '../components/modals/LogActivityModal';
import EnrichmentStatusPanel from '../components/EnrichmentStatusPanel';
import { useState, useEffect } from 'react';
import { activityService } from '../services/activityService';

const Account360 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accounts, contacts, deals, activities } = useCrm();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [accountActivities, setAccountActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const liveData = await activityService.getForEntity(id, 0, 50);
        setAccountActivities(liveData);
      } catch (err) {
        console.error('Failed to fetch activity log', err);
      }
    };
    if (id) {
      fetchActivities();
    }
  }, [id]);

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
        <div className="h-40 bg-white border border-slate-200 rounded-2xl p-8 mb-8">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="flex space-x-4">
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            <div className="h-4 bg-slate-200 rounded w-24"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
             <div className="h-64 bg-white border border-slate-200 rounded-2xl"></div>
             <div className="h-64 bg-white border border-slate-200 rounded-2xl"></div>
          </div>
          <div className="lg:col-span-2">
             <div className="h-[500px] bg-white border border-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const account = accounts.find(a => a.id === id);

  if (error || !account) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <SafeIcon icon={FiIcons.FiBriefcase} className="text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Account Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            {error ? "There was an error communicating with the database." : "The requested account could not be found or has been removed."}
          </p>
          <button
            onClick={() => navigate('/accounts')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiArrowLeft} />
            <span>Return to Accounts</span>
          </button>
        </div>
      </div>
    );
  }

  const accountContacts = contacts.filter(c => c.account_id === id);
  const accountDeals = deals.filter(d => d.account_id === id);
  const totalValue = accountDeals.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
            <SafeIcon icon={FiIcons.FiBriefcase} className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{account.company_name}</h1>
            <div className="flex items-center space-x-3 mt-1 text-sm text-slate-500 font-medium">
              <span className="flex items-center space-x-1"><SafeIcon icon={FiIcons.FiGlobe} /> <span>{account.website}</span></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>{account.industry}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">Edit Firmographics</button>
          <button onClick={() => setIsLogModalOpen(true)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg">New Interaction</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Contract Value', val: `$${(totalValue/1000).toFixed(1)}k`, icon: FiIcons.FiDollarSign, color: 'text-indigo-600' },
          { label: 'Active Contacts', val: accountContacts.length, icon: FiIcons.FiUsers, color: 'text-blue-600' },
          { label: 'Open Pipeline', val: accountDeals.length, icon: FiIcons.FiTrello, color: 'text-emerald-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.val}</div>
            </div>
            <SafeIcon icon={stat.icon} className="text-2xl text-slate-200" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Contacts Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Key Stakeholders</h3>
              <button className="text-xs font-bold text-indigo-600">Add Internal Stakeholder</button>
            </div>
            <div className="divide-y divide-slate-50">
              {accountContacts.map(c => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {c.first_name[0]}{c.last_name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{c.first_name} {c.last_name}</div>
                      <div className="text-xs text-slate-500">{c.email}</div>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/contact/${c.id}`)} className="text-slate-400 hover:text-indigo-600">
                    <SafeIcon icon={FiIcons.FiArrowRight} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Deals Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Active Opportunities</h3>
              <button onClick={() => navigate('/pipeline')} className="text-xs font-bold text-indigo-600">Initialize Deal</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {accountDeals.map(d => (
                <div key={d.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 group hover:border-indigo-200 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-slate-800 line-clamp-1">{d.title}</span>
                    <span className="text-xs font-black text-indigo-600">{d.probability_score}%</span>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div className="text-xs font-black text-slate-900 font-mono">${d.amount.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{d.stage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">

          <EnrichmentStatusPanel entityId={id} entityType="account" />

          <div className="bg-slate-900 rounded-2xl p-6 text-white">
            <h4 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-400">Firmographic Intelligence</h4>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Company Size</div>
                <div className="text-sm font-bold">{account.employee_count.toLocaleString()} Employees</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">HQ Location</div>
                <div className="text-sm font-bold">Boston, MA (Signal Detected)</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Tech Stack</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                  {['Salesforce', 'Azure', 'SAP'].map(tech => (
                    <span key={tech} className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-bold">{tech}</span>
                  ))}
                </div>
              </div>
              {account.annual_revenue && (
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Annual Revenue</div>
                  <div className="text-sm font-bold">${parseFloat(account.annual_revenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-black text-slate-900 mb-4">Account Health</h4>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-r-slate-100 flex items-center justify-center text-xs font-black">
                85%
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Engagement Score</div>
                <div className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Trending up (+12% this week)</div>
              </div>
            </div>
            <button className="w-full py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase hover:bg-slate-100 transition-all">
              Download Matrix Report
            </button>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col min-h-[500px]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 tracking-tight">360° Interaction Matrix</h3>
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
                {accountActivities.filter((activity) => {
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

                  let notes = {};
                  try {
                    notes = typeof activity.notes === 'string' ? JSON.parse(activity.notes) : (activity.notes || {});
                  } catch (e) {
                    notes = { description: activity.notes };
                  }
                  const description = notes.description || activity.description || '';

                  let typeColor = 'text-slate-500';
                  if (type.toLowerCase().includes('email')) typeColor = 'text-blue-600';
                  else if (type.toLowerCase().includes('stage_change')) typeColor = 'text-green-600';
                  else if (type.toLowerCase().includes('onyx')) typeColor = 'text-purple-600';
                  else if (type === 'ONYX_INTERVENTION') typeColor = 'text-indigo-600';
                  else if (type === 'support_ticket' || type === 'hardware_alert') typeColor = 'text-amber-600';

                  return (
                  <div key={activity.id} className="relative flex items-start space-x-6 group">
                    <div className="z-10 shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                      {type === 'support_ticket' || type === 'hardware_alert' ? <SafeIcon icon={FiIcons.FiAlertTriangle} className="text-amber-600" /> : <SafeIcon icon={FiIcons.FiActivity} />}
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
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{description}</p>
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
        entityId={id}
        entityType="account"
      />
    </div>
  );
};

export default Account360;