import React, { useState, useMemo, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

import { useCrm } from '../context/CrmContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import CreateDealModal from '../components/modals/CreateDealModal';
import DealDetailModal from '../components/modals/DealDetailModal';
import PipelineSettingsModal from '../components/modals/PipelineSettingsModal';
import { dealService } from '../services/dealService';
import { activityService } from '../services/activityService';
import { supabase, logToAsguardDLQ } from '../lib/supabase';




const StageColumn = ({ stage, deals, onDrop, onDragOver, onDealClick, movingDealIds, onDragEnterDeal }) => {
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
          {deals.map((deal, index) => (
            <DealCard
               key={deal.id}
               deal={deal}
               index={index}
               onClick={() => onDealClick(deal)}
               isMoving={movingDealIds?.has(deal.id)}
               onDragEnter={() => onDragEnterDeal(deal.id)}
            />
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

const DealCard = ({ deal, index, onClick, isMoving, onDragEnter }) => {
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
      animate={{ opacity: isMoving ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={handleDragStart}
      onDragEnter={onDragEnter}
      onClick={onClick}
      className={`bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing border-l-4 border-l-indigo-500 group ${isMoving ? 'pointer-events-none' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-indigo-600 transition-colors">{deal.title}</h4>
        {isMoving && (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-600"></div>
        )}
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
  const { deals, moveDealStage, campaigns, loading, error, realtimeStatus, session, pipelineStages: PIPELINE_CONFIGS } = useCrm();
  const [localDeals, setLocalDeals] = useState(deals);
  const isAdmin = session?.user?.app_metadata?.role === 'admin' || session?.user?.role === 'admin' || session?.user?.email === 'admin@axim.us.com' || session?.user?.email === 'james.ellars@axim.us.com'; // rudimentary admin check

  const [pipelineType, setPipelineType] = useState('b2b');
  const [movingDealIds, setMovingDealIds] = useState(new Set());
  const [isSwitchingType, setIsSwitchingType] = useState(false);

  useEffect(() => {
    if (!isSwitchingType) {
      setLocalDeals(isAdmin ? deals : deals.filter(d => d.assigned_to === session?.user?.id));
    }
  }, [deals, isSwitchingType]);


  useEffect(() => {
    const channel = supabase.channel('pipeline-grid-sync')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deals'
        },
        (payload) => {
          console.log('Realtime Deals update received in Pipeline:', payload);
          setLocalDeals(prev => {
            const isAssigned = isAdmin || payload.new.assigned_to === session?.user?.id;
            const exists = prev.some(d => d.id === payload.new.id);
            if (isAssigned) {
              if (exists) {
                return prev.map(deal => deal.id === payload.new.id ? { ...deal, ...payload.new } : deal);
              } else {
                return [...prev, payload.new];
              }
            } else {
              return prev.filter(d => d.id !== payload.new.id);
            }
          });
        }
      )
      .on('system', { event: 'phx_reply' }, (payload) => {
        if (payload?.response?.status === 'error' || payload?.status === 'error') {
           logToAsguardDLQ({ type: 'REALTIME_ERROR', message: 'pipeline-grid-sync channel error', payload });
        }
      })
      .subscribe((status, err) => {
        if (err || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
           logToAsguardDLQ({ type: 'REALTIME_ERROR', message: 'pipeline-grid-sync channel connection failed', error: err, status });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleTypeChange = (newType) => {
    if (pipelineType === newType) return;
    setIsSwitchingType(true);
    setLocalDeals([]);
    setPipelineType(newType);
    setTimeout(() => {
      setLocalDeals(deals);
      setIsSwitchingType(false);
    }, 400); // Brief skeleton loader duration
  };

  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || 'all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dragOverDealId, setDragOverDealId] = useState(null);
  const [inspectedDeal, setInspectedDeal] = useState(null);

    const filteredDeals = useMemo(() => {
    let dealsToFilter = localDeals;
    if (pipelineType === 'b2b') {
      dealsToFilter = dealsToFilter.filter(d => !!d.account_id);
    } else if (pipelineType === 'b2c') {
      dealsToFilter = dealsToFilter.filter(d => !d.account_id);
    }

    if (selectedCampaignId === 'all') return dealsToFilter;
    return dealsToFilter.filter(d => d.campaign_id === selectedCampaignId);
  }, [localDeals, selectedCampaignId, pipelineType]);

  const campaignStats = useMemo(() => {
    return {
      totalValue: filteredDeals.reduce((sum, d) => sum + d.amount, 0),
      count: filteredDeals.length,
      avgScore: Math.round(filteredDeals.reduce((sum, d) => sum + d.probability_score, 0) / (filteredDeals.length || 1))
    };
  }, [filteredDeals]);

  const handleDragOver = (e) => { e.preventDefault(); };


  const handleDrop = async (e, stage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    if (!dealId) return;

    const deal = localDeals.find(d => d.id === dealId);
    if (!deal) return;

    const originalStage = deal.stage;
    const isSameStage = originalStage === stage;

    // Determine the new order array for the destination column
    const stageDeals = [...localDeals]
      .filter(d => d.stage === stage && d.id !== dealId)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    let newIndex = stageDeals.length;
    if (dragOverDealId) {
      const dropIndex = stageDeals.findIndex(d => d.id === dragOverDealId);
      if (dropIndex !== -1) {
        newIndex = dropIndex;
      }
    }

    stageDeals.splice(newIndex, 0, { ...deal, stage });

    // Update sort_order for all deals in the destination column
    const updatedStageDeals = stageDeals.map((d, index) => ({
      ...d,
      sort_order: index
    }));

    // Create new local deals array with optimistic updates
    const newLocalDeals = localDeals.map(d => {
      const updatedDeal = updatedStageDeals.find(ud => ud.id === d.id);
      return updatedDeal ? updatedDeal : d;
    });

    const originalDeals = [...localDeals];
    setLocalDeals(newLocalDeals);
    setMovingDealIds(prev => new Set(prev).add(dealId));
    setDragOverDealId(null);

    try {
      if (isSameStage) {
          // Bulk update just the sorting
          const updates = updatedStageDeals.map(({ id, sort_order }) => ({ id, sort_order }));
          await dealService.updateBulk(updates);
      } else {
          // It's a stage change, update stage and then sort_order of the new column
          await dealService.update(dealId, { stage });
          const updates = updatedStageDeals.map(({ id, sort_order }) => ({ id, sort_order }));
          await dealService.updateBulk(updates);
      }


      // Activity log for CLOSED_WON or CLOSED_LOST
      if (!isSameStage && (stage === 'CLOSED_WON' || stage === 'CLOSED_LOST')) {
         if (stage === 'CLOSED_WON') {
             await activityService.logSystemActivity(`Deal ${deal.title || 'Unknown'} marked as Closed Won`);
             notificationService.notifySuccess(`Deal ${deal.title || 'Unknown'} marked as Closed Won`);
         } else {
             await activityService.create({
                account_id: deal.account_id,
                type: 'DEAL_LOST',
                description: 'Deal moved to Closed Lost',
                logged_by_agent_id: session?.user?.id || 'system'
             });
         }
      }

    } catch (err) {
      console.error("Failed to update deal stage:", err);
      // Revert optimistic update
      setLocalDeals(originalDeals);
      notificationService.notifyError("Failed to move deal: Network Error");
    } finally {
      setMovingDealIds(prev => {
        const next = new Set(prev);
        next.delete(dealId);
        return next;
      });
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col h-full bg-slate-50 p-8 space-y-6">
        <div className="h-10 bg-slate-200 animate-pulse rounded-lg w-1/4"></div>
        <div className="flex space-x-6 h-full items-start">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col min-w-[320px] max-w-[320px] bg-slate-50 rounded-xl border border-slate-200 h-full overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-100/50">
                <div className="h-4 bg-slate-200 animate-pulse rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-200 animate-pulse rounded w-1/3"></div>
              </div>
              <div className="p-3 space-y-3">
                {[1, 2].map((j) => (
                  <div key={j} className="bg-white p-4 rounded-lg border border-slate-200 h-28 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
      <PipelineSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="px-8 py-6 border-b border-slate-200 bg-white grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div>
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Deal Progress</h1>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => {
                  handleTypeChange('b2b');

                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${pipelineType === 'b2b' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {PIPELINE_CONFIGS.b2b.label}
              </button>
              <button
                onClick={() => {
                  handleTypeChange('b2c');

                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${pipelineType === 'b2c' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {PIPELINE_CONFIGS.b2c.label}
              </button>
            </div>
          </div>

          {realtimeStatus === 'error' && (
            <div className="flex items-center space-x-2 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg border border-rose-100 text-[10px] font-bold uppercase tracking-wider mt-3 w-max">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
              <span>Offline Mode - Reconnecting...</span>
            </div>
          )}
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

          {isAdmin && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 px-3 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center"
              title="Pipeline Settings"
            >
              <SafeIcon icon={FiIcons.FiSettings} />
            </button>
          )}
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
        {isSwitchingType ? (
          <div className="flex space-x-6 h-full pb-4 items-start w-max animate-pulse">
            {PIPELINE_CONFIGS[pipelineType].stages.map(stage => (
              <div key={stage} className="flex flex-col min-w-[320px] max-w-[320px] bg-slate-50 rounded-xl border border-slate-200 h-[500px] overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-100/50">
                   <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="p-3 space-y-3">
                   <div className="h-24 bg-white rounded-lg border border-slate-200"></div>
                   <div className="h-24 bg-white rounded-lg border border-slate-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex space-x-6 h-full pb-4 items-start w-max">
            {PIPELINE_CONFIGS[pipelineType].stages.map(stage => (
              <StageColumn
                key={stage}
                stage={stage}
                deals={filteredDeals.filter(d => d.stage === stage)}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDealClick={setInspectedDeal}
                movingDealIds={movingDealIds}
                onDragEnterDeal={setDragOverDealId}
              />
            ))}
          </div>
        )}
      </div>

      <CreateDealModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <PipelineSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <DealDetailModal deal={inspectedDeal} isOpen={!!inspectedDeal} onClose={() => setInspectedDeal(null)} />
    </div>
  );
};

export default Pipeline;