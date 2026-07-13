import React from 'react';
import { useCrm } from '../context/CrmContext';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';


const DashboardMetrics = React.memo(({ loading, totalValue, pendingTasksCount, contactsCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {loading ? (
        [1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-slate-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
        ))
      ) : (
      [
        { label: 'Pipeline Velocity', val: `${(totalValue/1000).toFixed(1)}k`, icon: FiIcons.FiTrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pending Actions', val: pendingTasksCount, icon: FiIcons.FiCheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Onyx Leads', val: contactsCount, icon: FiIcons.FiZap, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'System Health', val: '99.8%', icon: FiIcons.FiActivity, color: 'text-blue-600', bg: 'bg-blue-50' }
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
            <SafeIcon icon={stat.icon} className="text-xl" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
            <div className="text-xl font-black text-slate-900">{stat.val}</div>
          </div>
        </div>
      ))
      )}
    </div>
  );
});

const Dashboard = () => {
  const { deals, contacts, activities, runOnyxSweep, isSweeping, tasks, loading, session, enrichmentQueue } = useCrm();
  const navigate = useNavigate();




  const myDeals = deals.filter(d => d.assigned_to === session?.user?.id);
  const activeDeals = myDeals.filter(d => ['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(d.stage));
  const totalValue = activeDeals.reduce((sum, d) => sum + d.amount, 0);
  const myTasks = tasks.filter(t => t.assigned_to === session?.user?.id);
  const pendingTasks = myTasks.filter(t => t.status === 'TODO');

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Nexus Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nexus Command Center</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Operational status: <span className="text-emerald-600 font-bold uppercase tracking-widest text-xs not-italic ml-1">Optimal</span></p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={runOnyxSweep}
            disabled={isSweeping}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${isSweeping ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-100'}`}
          >
            <SafeIcon icon={FiIcons.FiCpu} className={isSweeping ? 'animate-spin' : ''} />
            <span>{isSweeping ? 'Sweeping Signals...' : 'Run Onyx Sweep'}</span>
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <DashboardMetrics
        loading={loading}
        totalValue={totalValue}
        pendingTasksCount={pendingTasks.length}
        contactsCount={contacts.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Signal Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-slate-900 flex items-center space-x-2">
                <SafeIcon icon={FiIcons.FiActivity} className="text-indigo-500" />
                <span>Onyx Intelligence Pulse</span>
              </h3>
              <button onClick={() => navigate('/analytics')} className="text-xs font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">Full Log</button>
            </div>
            <div className="divide-y divide-slate-50">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="p-5 flex items-start space-x-4 animate-pulse">
                    <div className="mt-1 w-2.5 h-2.5 rounded-full shrink-0 bg-slate-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))
              ) : (
              activities.filter(a => a.logged_by_agent_id === session?.user?.id || a.agent_id === session?.user?.id).length > 0 ? activities.filter(a => a.logged_by_agent_id === session?.user?.id || a.agent_id === session?.user?.id).slice(0, 5).map((act, i) => (
                <div key={i} className="p-5 flex items-start space-x-4 hover:bg-slate-50 transition-colors group">
                  <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${act.type === 'ONYX_INTERVENTION' ? 'bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-300'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 font-bold leading-snug">{act.description}</p>
                    <div className="flex items-center space-x-3 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span className={act.type === 'ONYX_INTERVENTION' ? 'text-indigo-500' : ''}>{act.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600">
                    <SafeIcon icon={FiIcons.FiArrowRight} />
                  </button>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-400 text-xs italic">Waiting for incoming signals...</div>
              )
            )}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative group cursor-pointer" onClick={() => navigate('/campaigns')}>
              <div className="relative z-10">
                <h4 className="text-lg font-black mb-1">Campaign Architect</h4>
                <p className="text-slate-400 text-xs font-medium mb-8 leading-relaxed">Launch multi-channel B2B/B2C sequences with one click.</p>
                <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  <span>Enter Orchestrator</span>
                  <SafeIcon icon={FiIcons.FiArrowRight} />
                </div>
              </div>
              <SafeIcon icon={FiIcons.FiTarget} className="absolute -bottom-6 -right-6 text-9xl text-indigo-500/10 group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 overflow-hidden relative group cursor-pointer" onClick={() => navigate('/swarm')}>
              <div className="relative z-10">
                <h4 className="text-lg font-black text-slate-900 mb-1">Operational Swarm</h4>
                <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">{pendingTasks.length} urgent follow-ups identified by Onyx Mk3.</p>
                <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  <span>View Actions</span>
                  <SafeIcon icon={FiIcons.FiArrowRight} />
                </div>
              </div>
              <SafeIcon icon={FiIcons.FiZap} className="absolute -bottom-6 -right-6 text-9xl text-slate-100 group-hover:scale-110 transition-transform duration-700" />
            </div>
          </div>
        </div>

        {/* High Confidence List */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs flex items-center justify-between">
              <span>High Probability</span>
              <SafeIcon icon={FiIcons.FiCpu} className="text-indigo-600" />
            </h3>
            <div className="space-y-4">
              {loading ? (
                [1, 2].map((i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
                    <div className="flex justify-between items-start mb-2">
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))
              ) : (
              <>
              {myDeals.filter(d => d.probability_score > 70).slice(0, 4).map((deal, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group" onClick={() => navigate('/pipeline')}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{deal.title}</span>
                    <span className="text-xs font-black text-emerald-600">{deal.probability_score}%</span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-[10px] font-black text-slate-900 font-mono tracking-tighter">${deal.amount.toLocaleString()}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase">{deal.stage}</span>
                  </div>
                </div>
              ))}
              {myDeals.filter(d => d.probability_score > 70).length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs italic">No high-probability deals detected.</div>
              )}
              </>
            )}</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs flex items-center justify-between">
              <span>Data Enrichment Queue</span>
              <SafeIcon icon={FiIcons.FiDatabase} className="text-indigo-600" />
            </h3>
            <div className="space-y-4">
              {enrichmentQueue.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs italic">No enrichment tasks in queue.</div>
              ) : (
                enrichmentQueue.map((task, i) => {
                  let badgeClasses = 'bg-slate-100 text-slate-500';
                  if (task.status === 'Enriched') badgeClasses = 'bg-emerald-100 text-emerald-700';
                  if (task.status === 'Failed') badgeClasses = 'bg-red-100 text-red-700';
                  if (task.status === 'Scraping...') badgeClasses = 'bg-amber-100 text-amber-700';
                  if (task.status === 'Queued') badgeClasses = 'bg-slate-100 text-slate-600';

                  return (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group">
                      <div>
                        <div className="text-xs font-black text-slate-800 line-clamp-1">{task.entityType} - {task.entityId.substring(0, 8)}...</div>
                        <div className="text-[9px] font-black text-slate-400 mt-1">{new Date(task.timestamp).toLocaleTimeString()}</div>
                      </div>
                      <div className={`text-[10px] uppercase font-black px-2 py-1 rounded flex items-center space-x-1 ${badgeClasses}`}>
                        {task.status === 'Scraping...' && (
                           <svg className="animate-spin h-3 w-3 text-amber-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                        )}
                        <span>{task.status}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-indigo-900 rounded-2xl p-6 text-white overflow-hidden relative">
            <h3 className="font-black text-sm uppercase tracking-widest mb-4">Quick Ingest</h3>
            <div className="grid gap-2 relative z-10">
              <button 
                onClick={() => navigate('/directory')}
                className="w-full text-left bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-between"
              >
                <span>Entity (B2B/B2C)</span>
                <SafeIcon icon={FiIcons.FiPlus} />
              </button>
              <button 
                onClick={() => navigate('/pipeline')}
                className="w-full text-left bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-between"
              >
                <span>Deal Initialization</span>
                <SafeIcon icon={FiIcons.FiPlus} />
              </button>
            </div>
            <SafeIcon icon={FiIcons.FiLayers} className="absolute -bottom-4 -right-4 text-7xl text-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;