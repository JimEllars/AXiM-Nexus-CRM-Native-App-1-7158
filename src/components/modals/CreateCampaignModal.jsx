import React, { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCrm } from '../../context/CrmContext';

const CreateCampaignModal = ({ isOpen, onClose }) => {
  const { addCampaign } = useCrm();
  const [formData, setFormData] = useState({
    name: '', type: 'B2B', budget: '', status: 'ACTIVE', target_audience_filter: 'All Users', trigger_time: 'Immediate'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Feature 5% Stub: Prepare payload for backend pg_cron daemon
    const payload = {
      campaign_name: formData.name,
      target_audience_filter: formData.target_audience_filter,
      trigger_time: formData.trigger_time
    };

    console.log("CRON DAEMON PAYLOAD:", JSON.stringify(payload, null, 2));

    addCampaign({ ...formData, budget: parseFloat(formData.budget) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Launch Campaign</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><SafeIcon icon={FiIcons.FiX} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Campaign Name</label>
            <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Q4 Logistics Expansion" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="B2B">B2B (Enterprise)</option>
                <option value="B2C">B2C (Direct)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Budget ($)</label>
              <input required type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono" 
                value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Audience Filter</label>
              <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.target_audience_filter} onChange={e => setFormData({...formData, target_audience_filter: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Trigger Time</label>
              <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.trigger_time} onChange={e => setFormData({...formData, trigger_time: e.target.value})} />
            </div>
          </div>
          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Launch</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignModal;
