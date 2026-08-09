import React, { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCrm } from '../../context/CrmContext';

const PipelineSettingsModal = ({ isOpen, onClose }) => {
  const { pipelineStages, setPipelineStages } = useCrm();
  const [activeTab, setActiveTab] = useState('b2b');

  // Local state to manage edits before saving
  const [localStages, setLocalStages] = useState({
    b2b: [...pipelineStages.b2b.stages],
    b2c: [...pipelineStages.b2c.stages]
  });

  const [newStageName, setNewStageName] = useState('');

  if (!isOpen) return null;

  const handleAddStage = () => {
    if (!newStageName.trim()) return;
    const stageKey = newStageName.trim().toUpperCase().replace(/\s+/g, '_');
    if (localStages[activeTab].includes(stageKey)) return;

    setLocalStages(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], stageKey]
    }));
    setNewStageName('');
  };

  const handleRemoveStage = (stageToRemove) => {
    setLocalStages(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(s => s !== stageToRemove)
    }));
  };

  const handleSave = () => {
    setPipelineStages({
      b2b: { ...pipelineStages.b2b, stages: localStages.b2b },
      b2c: { ...pipelineStages.b2c, stages: localStages.b2c }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-black text-slate-800 flex items-center">
            <SafeIcon icon={FiIcons.FiSettings} className="mr-3 text-indigo-600" />
            Pipeline Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <SafeIcon icon={FiIcons.FiX} className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('b2b')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'b2b' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              B2B Stages
            </button>
            <button
              onClick={() => setActiveTab('b2c')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'b2c' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              B2C Stages
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
            {localStages[activeTab].map((stage, i) => (
              <div key={stage} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{stage.replace(/_/g, ' ')}</span>
                <button
                  onClick={() => handleRemoveStage(stage)}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <SafeIcon icon={FiIcons.FiTrash2} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="New Stage Name"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            />
            <button
              onClick={handleAddStage}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end space-x-3 bg-slate-50">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
          <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-100 flex items-center space-x-2">
            <SafeIcon icon={FiIcons.FiSave} />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PipelineSettingsModal;
