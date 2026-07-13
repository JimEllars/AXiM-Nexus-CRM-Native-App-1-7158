import { toast } from 'react-toastify';
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { accountService } from '../services/accountService';
import { contactService } from '../services/contactService';
import { dealService } from '../services/dealService';
import { activityService } from '../services/activityService';
import { campaignService } from '../services/campaignService';
import { taskService } from '../services/taskService';
import { enrichmentService } from '../services/enrichmentService';
import { workflowService } from '../services/workflowService';
import { supabase } from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const CrmContext = createContext();

export const useCrm = () => useContext(CrmContext);

export const CrmProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isSweeping, setIsSweeping] = useState(false);
  
  const [workflows, setWorkflows] = useState([]);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState('connected');
  const [enrichmentQueue, setEnrichmentQueue] = useState(enrichmentService.getQueue());

  useEffect(() => {
    const handleQueueUpdate = () => {
      setEnrichmentQueue(enrichmentService.getQueue());
    };
    window.addEventListener('enrichment_queue_updated', handleQueueUpdate);
    return () => window.removeEventListener('enrichment_queue_updated', handleQueueUpdate);
  }, []);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        window.location.href = '/login';
      }
    });

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401 || response.status === 403) {
         const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
         if (url.includes('supabase.co')) {
             toast.error('Session expired. Please log in again.');
             supabase.auth.signOut();
             window.location.href = '/login';
         }
      }
      return response;
    };

    return () => {
      subscription.unsubscribe();
      window.fetch = originalFetch;
    };
  }, []);



  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [accs, cons, dls, acts, camps, tsks, wfs] = await Promise.all([
        accountService.getAll(),
        contactService.getAll(),
        dealService.getAll(),
        activityService.getAll(),
        campaignService.getAll(),
        taskService.getAll(),
        workflowService.getAll()
      ]);
      setAccounts(accs || []);
      setContacts(cons || []);
      setDeals(dls || []);
      setActivities(acts || []);
      setCampaigns(camps || []);
      setTasks(tsks || []);
      setWorkflows(wfs || []);
    } catch (err) {
      console.error('Failed to load CRM data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    loadAllData();

    // Supabase Realtime Prep: Subscription for crm.deals table
    const broadcastChannel = supabase.channel('enrichment-events')
      .on('broadcast', { event: 'enrichment_completed' }, (payload) => {
        toast.success("Ecosystem Scraper completed a record sync");
        const logData = payload.payload?.data || payload;
        enrichmentService.addToQueue({
          entityId: logData.entityId || 'SYS-SYNC',
          entityType: logData.entityType || 'Webhook',
          status: 'Enriched'
        });
      })
      .subscribe();

    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deals'
        },
        (payload) => {
          console.log('Realtime Deals update received:', payload);
          if (payload.eventType === 'UPDATE') {
            setDeals(prevDeals => prevDeals.map(deal => {
              if (deal.id === payload.new.id) {
                return { ...deal, ...payload.new };
              }
              return deal;
            }));
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Realtime subscription error:', err);
          setRealtimeStatus('error');
        } else if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (status === 'CLOSED') {
          setRealtimeStatus('disconnected');
        } else if (status === 'CHANNEL_ERROR') {
          setRealtimeStatus('error');
        } else if (status === 'TIMED_OUT') {
          setRealtimeStatus('error');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(broadcastChannel);
    };
  }, [session]);

  const addDeal = async (dealData) => {
    try {
      const newDeal = await dealService.create({
        ...dealData,
        probability_score: Math.floor(Math.random() * 30) + 10
      });
      setDeals(prev => [...prev, newDeal]);
    } catch (e) { console.error(e); }
  };

  const updateDeal = async (dealId, updates) => {
    try {
      const deal = deals.find(d => d.id === dealId);
      if (!deal) return;
      const updatedDeal = await dealService.update(dealId, { ...deal, ...updates });
      setDeals(prev => prev.map(d => d.id === dealId ? updatedDeal : d));
    } catch (e) { console.error(e); }
  };

  const addActivity = async (activityData) => {
    try {
      const newActivity = await activityService.create(activityData);
      setActivities(prev => [newActivity, ...prev]);
    } catch (e) { console.error(e); }
  };

  const addContact = async (contactData) => {
    try {
      const newContact = await contactService.create(contactData);
      setContacts(prev => [...prev, newContact]);
    } catch (e) { console.error(e); }
  };

  const bulkAddContacts = async (contactsArray) => {
    try {
      const newContacts = await contactService.bulkCreate(contactsArray);
      setContacts(prev => [...prev, ...newContacts]);
      
      await addActivity({
        type: 'SYSTEM_EVENT',
        description: `Bulk ingestion of ${newContacts.length} entities completed successfully.`,
        logged_by_agent_id: 'onyx-importer'
      });
    } catch (e) {
      console.error('Bulk add failed:', e);
      throw e;
    }
  };

  const addCampaign = async (campData) => {
    try {
      const newCamp = await campaignService.create(campData);
      setCampaigns(prev => [...prev, newCamp]);
    } catch (e) { console.error(e); }
  };

  const addTask = async (taskData) => {
    try {
      const newTask = await taskService.create(taskData);
      setTasks(prev => [newTask, ...prev]);
    } catch (e) { console.error(e); }
  };

  const toggleTaskStatus = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if(!task) return;
      const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
      const updatedTask = await taskService.update(taskId, { ...task, status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch (e) { console.error(e); }
  };


  const toggleWorkflow = async (workflowId) => {
    try {
      const wf = workflows.find(w => w.id === workflowId);
      if(!wf) return;
      const updatedWf = await workflowService.toggle(workflowId, !wf.is_active);
      setWorkflows(prev => prev.map(w => w.id === workflowId ? updatedWf : w));
    } catch (e) { console.error(e); }
  };

  const addWorkflow = async (workflowData) => {
    try {
      const newWf = await workflowService.create(workflowData);
      setWorkflows(prev => [...prev, newWf]);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const moveDealStage = async (dealId, newStage) => {
    await updateDeal(dealId, { stage: newStage });
  };

  const runOnyxSweep = useCallback(async () => {
    setIsSweeping(true);
    try {
      const updates = deals.map(deal => ({
        ...deal,
        probability_score: Math.min(100, Math.max(0, deal.probability_score + (Math.random() > 0.5 ? 5 : -3)))
      }));
      for (const d of updates) { await dealService.update(d.id, d); }
      setDeals(updates);
    } catch (e) { console.error(e); } finally { setIsSweeping(false); }
  }, [deals]);

  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 flex-col space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center relative border border-slate-700 shadow-2xl">
            <SafeIcon icon={FiIcons.FiCpu} className="text-3xl text-indigo-400 animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col items-center space-y-3">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">AXiM Nexus</h2>
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-indigo-400/80 font-mono text-xs uppercase tracking-widest">Hydrating Core Session</p>
          </div>
        </div>

        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mt-8">
          <div className="h-full bg-indigo-500 w-full animate-[progress_1.5s_ease-in-out_infinite] origin-left"></div>
        </div>
      </div>
    );
  }



  return (
    <CrmContext.Provider value={{
      session, loading, error, campaigns, accounts, contacts, deals, activities, workflows, tasks, isSweeping,
      addDeal, updateDeal, addActivity, addTask, addContact, bulkAddContacts, addCampaign, toggleTaskStatus, moveDealStage, addWorkflow, toggleWorkflow, runOnyxSweep, refreshData: loadAllData, realtimeStatus, authLoading, enrichmentQueue
    }}>
      {children}
    </CrmContext.Provider>
  );
};
