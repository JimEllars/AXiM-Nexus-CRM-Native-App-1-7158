import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCrm } from '../context/CrmContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const Account360 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accounts, contacts, deals, activities } = useCrm();

  const { loading, error } = useCrm();

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <SafeIcon icon={FiIcons.FiRefreshCw} className="animate-spin text-4xl text-indigo-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Loading Account...</h2>
        <p className="text-sm text-slate-500 mt-2">Retrieving firmographics from the core.</p>
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
          <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg">New Interaction</button>
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
      </div>
    </div>
  );
};

export default Account360;