import React, { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCrm } from '../../context/CrmContext';

const LogActivityModal = ({ isOpen, onClose, contactId, dealId }) => {
  const { addActivity } = useCrm();
  const [formData, setFormData] = useState({
    type: 'CALL',
    description: '',
    metadata: {}
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addActivity({
      ...formData,
      contact_id: contactId,
      deal_id: dealId,
      logged_by_agent_id: 'current-user'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Log Interaction</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><SafeIcon icon={FiIcons.FiX} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Interaction Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['CALL', 'MEETING', 'EMAIL'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`py-2 px-3 rounded-xl border text-[10px] font-black transition-all ${
                    formData.type === type 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Internal Notes</label>
            <textarea
              required
              rows={4}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              placeholder="What was discussed? Any follow-ups?"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg">Log Activity</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogActivityModal;