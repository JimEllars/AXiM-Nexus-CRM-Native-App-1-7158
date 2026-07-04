import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import CreateCampaignModal from '../components/modals/CreateCampaignModal';

const Campaigns = () => {
  const { campaigns, deals } = useCrm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getCampaignStats = (id) => {
    const campDeals = deals.filter(d => d.campaign_id === id);
    return {
      count: campDeals.length,
      total: campDeals.reduce((a, b) => a + b.amount, 0),
      avgScore: Math.round(campDeals.reduce((a, b) => a + b.probability_score, 0) / (campDeals.length || 1))
    };
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Campaign Orchestration</h1>
          <p className="text-slate-500 text-sm mt-1">Manage marketing initiatives and track multi-channel ROI.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
        >
          Launch Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(camp => {
          const stats = getCampaignStats(camp.id);
          return (
            <div key={camp.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-300 transition-all group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${camp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {camp.status}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{camp.type}</div>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{camp.name}</h3>
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium font-mono">
                  <SafeIcon icon={FiIcons.FiDollarSign} className="text-slate-400" />
                  <span>Budget: ${camp.budget.toLocaleString()}</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Generated Value</div>
                    <div className="text-sm font-black text-slate-800">${(stats.total / 1000).toFixed(1)}k</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Onyx Health</div>
                    <div className="text-sm font-black text-indigo-600">{stats.avgScore}%</div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">{stats.count} Active Deals</span>
                <button className="text-indigo-600 hover:text-indigo-800">
                  <SafeIcon icon={FiIcons.FiExternalLink} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <CreateCampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Campaigns;