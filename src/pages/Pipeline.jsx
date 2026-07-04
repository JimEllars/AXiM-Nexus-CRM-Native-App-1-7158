import React, { useState, useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import CreateDealModal from '../components/modals/CreateDealModal';
import DealDetailModal from '../components/modals/DealDetailModal';

const STAGES = ['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];

const StageColumn = ({ stage, deals, onDrop, onDragOver, onDealClick }) => {
  const totalValue = deals.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div 
      className="flex flex-col min-w-[320px] max-w-[320px] bg-slate-50 rounded-xl border border-slate-200 h-full overflow-hidden"
      onDrop={(e) => onDrop(e, stage)}
      onDragOver={onDragOver}
    >
      <div className="p-4 border-b border-slate-200 bg-slate-100/50">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-widest">{stage.replace('_', ' ')}</h3>
          <span className="bg-slate-200 text-slate-600 text-[10px] py-1 px-2 rounded-full font-bold">
            {deals.length}
          </span>
        </div>
        <div className="text-sm font-semibold text-slate-500">
          ${totalValue.toLocaleString()}
        </div>
      </div>
      <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
        <AnimatePresence>
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} onClick={() => onDealClick(deal)} />
          ))}
        </AnimatePresence>
        {deals.length === 0 && (
          <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs text-center px-4">
            No active deals in this stage
          </div>
        )}
      </div>
    </div>
  );
};

const DealCard = ({ deal, onClick }) => {
  const { contacts, accounts } = useCrm();
  const contact = contacts.find(c => c.id === deal.primary_contact_id);
  const account = accounts.find(a => a.id === deal.account_id);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('dealId', deal.id);
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing border-l-4 border-l-indigo-500 group"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-indigo-600 transition-colors">{deal.title}</h4>
      </div>
      
      <div className="mb-3 text-[11px] text-slate-500 font-medium flex items-center space-x-1">
        <SafeIcon icon={FiIcons.FiBriefcase} className="text-slate-400" />
        <span className="truncate">{account ? account.company_name : `${contact?.first_name} ${contact?.last_name}`}</span>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
        <span className="text-sm font-bold text-slate-900 font-mono">
          ${deal.amount.toLocaleString()}
        </span>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-md border text-[10px] font-black ${getScoreColor(deal.probability_score)}`}>
          <SafeIcon icon={FiIcons.FiCpu} className="text-[10px]" />
          <span>{deal.probability_score}%</span>
        </div>
      </div>
    </motion.div>
  );
};

const Pipeline = () => {
  const { deals, moveDealStage, campaigns, loading, error } = useCrm();
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || 'all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inspectedDeal, setInspectedDeal] = useState(null);

  const filteredDeals = useMemo(() => {
    if (selectedCampaignId === 'all') return deals;
    return deals.filter(d => d.campaign_id === selectedCampaignId);
  }, [deals, selectedCampaignId]);

  const campaignStats = useMemo(() => {
    return {
      totalValue: filteredDeals.reduce((sum, d) => sum + d.amount, 0),
      count: filteredDeals.length,
      avgScore: Math.round(filteredDeals.reduce((sum, d) => sum + d.probability_score, 0) / (filteredDeals.length || 1))
    };
  }, [filteredDeals]);

  const handleDragOver = (e) => { e.preventDefault(); };

  const handleDrop = (e, stage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    if (dealId) moveDealStage(dealId, stage);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-slate-50">
        <SafeIcon icon={FiIcons.FiRefreshCw} className="animate-spin text-4xl text-indigo-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Loading Pipeline...</h2>
        <p className="text-sm text-slate-500 mt-2">Retrieving active deals from the core.</p>
      </div>
    );
  }

  if (error || !deals || deals.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <SafeIcon icon={FiIcons.FiDatabase} className="text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Data Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            {error ? "There was an error communicating with the database." : "Your pipeline is currently empty. Initialize a deal to get started."}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100"
          >
            <SafeIcon icon={FiIcons.FiPlus} />
            <span>Initialize Deal</span>
          </button>
        </div>
        <CreateDealModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="px-8 py-6 border-b border-slate-200 bg-white grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Deal Progress</h1>
          <div className="flex items-center space-x-4 mt-3">
            <div className="relative">
              <SafeIcon icon={FiIcons.FiFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <select 
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="pl-8 pr-10 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Campaigns</option>
                {campaigns.map(camp => (
                  <option key={camp.id} value={camp.id}>{camp.name}</option>
                ))}
              </select>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center space-x-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <div className="flex items-center space-x-1">
                <span className="text-slate-900">${campaignStats.totalValue.toLocaleString()}</span>
                <span>Value</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-slate-900">{campaignStats.count}</span>
                <span>Deals</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-indigo-600">{campaignStats.avgScore}%</span>
                <span>Onyx Score</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex lg:justify-end space-x-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 shadow-lg shadow-indigo-100"
          >
            <SafeIcon icon={FiIcons.FiPlus} />
            <span>Initialize Deal</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-8">
        <div className="flex space-x-6 h-full pb-4 items-start">
          {STAGES.map(stage => (
            <StageColumn 
              key={stage} 
              stage={stage} 
              deals={filteredDeals.filter(d => d.stage === stage)}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDealClick={setInspectedDeal}
            />
          ))}
        </div>
      </div>

      <CreateDealModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <DealDetailModal deal={inspectedDeal} isOpen={!!inspectedDeal} onClose={() => setInspectedDeal(null)} />
    </div>
  );
};

export default Pipeline;