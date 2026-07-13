import React from 'react';
import { useCrm } from '../context/CrmContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useState } from 'react';
import { toast } from 'react-toastify';

const Workflows = () => {
  const { workflows, toggleWorkflow, addWorkflow } = useCrm();
  const [isDeploying, setIsDeploying] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', target_entity_type: 'DEAL', trigger_conditions: '{"stage": "CLOSED_WON"}', action_payload: '{"template": "webhook_notify"}' });

  const handleDeploy = async (e) => {
    e.preventDefault();
    setIsDeploying(true);
    try {
      const payload = {
        name: newAgent.name,
        target_entity_type: newAgent.target_entity_type,
        trigger_conditions: JSON.parse(newAgent.trigger_conditions),
        action_payload: JSON.parse(newAgent.action_payload),
        is_active: true
      };
      await addWorkflow(payload);
      toast.success('Agent deployed to automation swarm.');
      setShowDeployModal(false);
      setNewAgent({ name: '', target_entity_type: 'DEAL', trigger_conditions: '{"stage": "CLOSED_WON"}', action_payload: '{"template": "webhook_notify"}' });
    } catch (err) {
      toast.error('Failed to deploy agent. Check JSON formats.');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Onyx Core Intelligence</h1>
          <p className="text-slate-500 text-sm mt-1">Configure the native automation swarm and LLM-driven outreach logic.</p>
        </div>
        <button onClick={() => setShowDeployModal(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100">
          Deploy New Agent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Active Automation Swarm</h3>
          {workflows.map(wf => (
            <div key={wf.id} className={`bg-white p-6 rounded-2xl border transition-all ${wf.is_active ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-60'}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${wf.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                    <SafeIcon icon={FiIcons.FiZap} className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{wf.name}</h3>
                    <div className="flex items-center space-x-3 mt-1 text-[10px] text-slate-500 uppercase font-black tracking-tighter">
                      <span>Target: {wf.target_entity_type}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>Execution: Edge Runtime</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => toggleWorkflow(wf.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${wf.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {wf.is_active ? 'Swarm Running' : 'Swarm Paused'}
                  </button>
                  <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                    <SafeIcon icon={FiIcons.FiTrash2} />
                  </button>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Trigger Logic</span>
                  <p className="text-xs font-mono text-slate-600 mt-1">on_event({JSON.stringify(wf.trigger_conditions)})</p>
                </div>
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                  <span className="text-[9px] font-black text-indigo-400 uppercase">Action Payload</span>
                  <p className="text-xs font-mono text-indigo-600 mt-1">execute_bridge({wf.action_payload.template})</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
            <h4 className="text-lg font-bold mb-2">Model Calibration</h4>
            <div className="space-y-4 mt-6">
              {[
                { label: 'Outreach Aggression', val: 78 },
                { label: 'Confidence Threshold', val: 65 },
                { label: 'Sweep Frequency', val: 92 }
              ].map((cal, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                    <span>{cal.label}</span>
                    <span>{cal.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${cal.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 bg-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-500 transition-all">Apply Global Tuning</button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h4 className="text-sm font-bold text-slate-900 mb-4">API Telemetry</h4>
            <div className="space-y-3">
              {[
                { label: 'Bridge Latency', val: '14ms', status: 'optimal' },
                { label: 'LLM Token Usage', val: '1.2M', status: 'warning' },
                { label: 'Scrape Accuracy', val: '98.2%', status: 'optimal' }
              ].map((tel, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-bold text-slate-500">{tel.label}</span>
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-800 font-mono">{tel.val}</div>
                    <div className={`text-[9px] font-bold uppercase ${tel.status === 'optimal' ? 'text-emerald-500' : 'text-amber-500'}`}>{tel.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showDeployModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Deploy New Agent</h2>
              <button onClick={() => setShowDeployModal(false)} className="text-slate-400 hover:text-slate-600"><SafeIcon icon={FiIcons.FiX} /></button>
            </div>
            <form onSubmit={handleDeploy} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Agent Name</label>
                <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Entity Type</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newAgent.target_entity_type} onChange={e => setNewAgent({...newAgent, target_entity_type: e.target.value})}>
                  <option value="DEAL">Deal</option>
                  <option value="CONTACT">Contact</option>
                  <option value="ACCOUNT">Account</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Trigger Conditions (JSON)</label>
                <textarea required rows="2" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs"
                  value={newAgent.trigger_conditions} onChange={e => setNewAgent({...newAgent, trigger_conditions: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Action Payload (JSON)</label>
                <textarea required rows="2" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs"
                  value={newAgent.action_payload} onChange={e => setNewAgent({...newAgent, action_payload: e.target.value})} />
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowDeployModal(false)} className="flex-1 px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={isDeploying} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-75 disabled:cursor-not-allowed">
                  {isDeploying ? 'Deploying...' : 'Deploy Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflows;