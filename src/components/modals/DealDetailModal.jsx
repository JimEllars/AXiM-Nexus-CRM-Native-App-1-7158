import React, { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCrm } from '../../context/CrmContext';

const DealDetailModal = ({ deal, isOpen, onClose }) => {
  const { contacts, accounts, updateDeal } = useCrm();
  const [formData, setFormData] = useState({ ...deal });

  if (!isOpen || !deal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateDeal(deal.id, formData);
    onClose();
  };

  const contact = contacts.find(c => c.id === deal.primary_contact_id);
  const account = accounts.find(a => a.id === deal.account_id);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Deal Inspection</h2>
            <p className="text-xs text-slate-500 font-mono mt-1">ID: {deal.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><SafeIcon icon={FiIcons.FiX} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Deal Title</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Amount ($)</label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-bold"
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Current Stage</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                  value={formData.stage} 
                  onChange={e => setFormData({...formData, stage: e.target.value})}
                >
                  <option value="PROSPECT">Prospect</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL">Proposal</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="CLOSED_WON">Closed Won</option>
                  <option value="CLOSED_LOST">Closed Lost</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <h4 className="text-xs font-black text-indigo-900 uppercase mb-3 flex items-center space-x-2">
                <SafeIcon icon={FiIcons.FiCpu} />
                <span>Onyx Prediction Engine</span>
              </h4>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-black text-indigo-600">{deal.probability_score}%</div>
                  <div className="text-[10px] text-indigo-400 font-bold uppercase">Confidence Score</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-600">Close Prediction:</div>
                  <div className="text-xs font-mono text-slate-500">{deal.expected_close_date}</div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => console.log('Onyx payload triggered')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200 flex justify-center items-center space-x-2"
              >
                <SafeIcon icon={FiIcons.FiZap} />
                <span>Request Onyx Risk Summary</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Linked Entity</h4>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                  <SafeIcon icon={account ? FiIcons.FiBriefcase : FiIcons.FiUser} className="text-xl" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">{account ? account.company_name : `${contact?.first_name} ${contact?.last_name}`}</div>
                  <div className="text-xs text-slate-500">{contact?.email}</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Deal Notes</label>
              <textarea 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[120px]"
                placeholder="Internal deal strategy..."
              ></textarea>
            </div>

            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
              <button type="submit" className="flex-1 px-4 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg">Save Updates</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealDetailModal;