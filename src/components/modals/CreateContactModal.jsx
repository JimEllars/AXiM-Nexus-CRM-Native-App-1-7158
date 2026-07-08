import React, { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCrm } from '../../context/CrmContext';

const CreateContactModal = ({ isOpen, onClose }) => {
  const { accounts, addContact } = useCrm();
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', account_id: '', type: 'B2B_LEAD'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (payload.type === 'B2C_CONSUMER') {
      payload.account_id = null;
    }
    addContact(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Ingest New Entity</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><SafeIcon icon={FiIcons.FiX} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'B2B_LEAD'})}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === 'B2B_LEAD' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              B2B Personnel
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'B2C_CONSUMER'})}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.type === 'B2C_CONSUMER' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              B2C Consumer
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
              <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
              <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
            <input required type="email" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
              <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" 
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

          </div>
          {formData.type === 'B2B_LEAD' && (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Link Account (Optional)</label>
            <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={formData.account_id} onChange={e => setFormData({...formData, account_id: e.target.value})}>
              <option value="">No Account</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.company_name}</option>)}
            </select>
          </div>
          )}
          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Ingest Contact</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContactModal;