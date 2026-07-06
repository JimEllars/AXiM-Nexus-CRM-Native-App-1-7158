import React from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const Analytics = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time telemetry from Onyx Mk3 Predictive Ops.</p>
        </div>
        <div className="flex space-x-2 text-xs font-mono bg-slate-100 p-2 rounded-lg border border-slate-200">
          <span className="text-slate-400 text-slate-500">Last Sync:</span>
          <span className="text-indigo-600 font-bold">14s ago</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Pipeline Value</div>
          <div className="text-3xl font-black text-slate-900">$2,450,000</div>
          <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold">
            <SafeIcon icon={FiIcons.FiTrendingUp} className="mr-1" />
            <span>+12.4% from last sweep</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Win Rate</div>
          <div className="text-3xl font-black text-slate-900">34.2%</div>
          <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold">
            <SafeIcon icon={FiIcons.FiTrendingUp} className="mr-1" />
            <span>+2.1% this quarter</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Swarm Tasks</div>
          <div className="text-3xl font-black text-slate-900">1,204</div>
          <div className="mt-4 flex items-center text-indigo-600 text-xs font-bold">
            <SafeIcon icon={FiIcons.FiCpu} className="mr-1" />
            <span>System Stable</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96 flex items-center justify-center">
        <div className="text-slate-400 text-sm font-bold flex flex-col items-center">
          <SafeIcon icon={FiIcons.FiBarChart2} className="text-4xl mb-2" />
          <span>Future Chart Container</span>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
