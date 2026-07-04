import React, { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCrm } from '../../context/CrmContext';

const CreateDealModal = ({ isOpen, onClose }) => {
  const { accounts, contacts, campaigns, addDeal } = useCrm();
  const [formData, setFormData] = useState({
    title: '', amount: '', account_id: '', primary_contact_id: '', campaign_id: '', stage: 'PROSPECT'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addDeal({ ...formData, amount: parseFloat(formData.amount) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Initialize New Deal</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><SafeIcon icon={FiIcons.FiX} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deal Title</label>
            <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. UniFirst Expansion Phase 2" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Active Campaign</label>
            <select required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={formData.campaign_id} onChange={e => setFormData({...formData, campaign_id: e.target.value})}>
              <option value="">Select Campaign...</option>
              {campaigns.map(camp => <option key={camp.id} value={camp.id}>{camp.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount ($)</label>
              <input required type="number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Stage</label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
                <option value="PROSPECT">Prospect</option>
                <option value="QUALIFIED">Qualified</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Primary Contact</label>
            <select required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={formData.primary_contact_id} onChange={e => setFormData({...formData, primary_contact_id: e.target.value})}>
              <option value="">Select Contact...</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
            </select>
          </div>

          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Create Deal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDealModal;