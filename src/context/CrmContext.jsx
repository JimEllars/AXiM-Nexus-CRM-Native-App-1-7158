import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { accountService } from '../services/accountService';
import { contactService } from '../services/contactService';
import { dealService } from '../services/dealService';
import { activityService } from '../services/activityService';
import { campaignService } from '../services/campaignService';
import { taskService } from '../services/taskService';

const CrmContext = createContext();

export const useCrm = () => useContext(CrmContext);

export const CrmProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isSweeping, setIsSweeping] = useState(false);
  
  const [workflows, setWorkflows] = useState([
    { id: 'wf-1', name: 'B2B Initial Outreach', target_entity_type: 'CONTACT', is_active: true, trigger_conditions: { type: 'SCRAPE_EVENT' }, action_payload: { template: 'b2b_intro_01', delay: '2h' } },
    { id: 'wf-2', name: 'High Value Deal Alert', target_entity_type: 'DEAL', is_active: true, trigger_conditions: { min_amount: 100000 }, action_payload: { notify: 'admin_slack' } }
  ]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [accs, cons, dls, acts, camps, tsks] = await Promise.all([
        accountService.getAll(),
        contactService.getAll(),
        dealService.getAll(),
        activityService.getAll(),
        campaignService.getAll(),
        taskService.getAll()
      ]);
      setAccounts(accs);
      setContacts(cons);
      setDeals(dls);
      setActivities(acts);
      setCampaigns(camps);
      setTasks(tsks);
    } catch (error) {
      console.error('Failed to load CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

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
      const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
      const updatedTask = await taskService.update(taskId, { ...task, status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch (e) { console.error(e); }
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

  return (
    <CrmContext.Provider value={{
      loading, campaigns, accounts, contacts, deals, activities, workflows, tasks, isSweeping,
      addDeal, updateDeal, addActivity, addTask, addContact, bulkAddContacts, addCampaign, toggleTaskStatus, moveDealStage, runOnyxSweep, refreshData: loadAllData
    }}>
      {children}
    </CrmContext.Provider>
  );
};