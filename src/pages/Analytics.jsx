import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCrm } from '../context/CrmContext';

const Analytics = () => {
  const { loading } = useCrm();
  const [localLoading, setLocalLoading] = useState(true);

  // Simulate local loading of chart data to harden the shell
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 1500); // 1.5s simulated loading for charts/stats
      return () => clearTimeout(timer);
    } else {
      setLocalLoading(true);
    }
  }, [loading]);

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
        {[1, 2, 3].map((i) => (
          localLoading ? (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          ) : (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              {i === 1 && (
                <>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Pipeline Value</div>
                  <div className="text-3xl font-black text-slate-900">$2,450,000</div>
                  <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold">
                    <SafeIcon icon={FiIcons.FiTrendingUp} className="mr-1" />
                    <span>+12.4% from last sweep</span>
                  </div>
                </>
              )}
              {i === 2 && (
                <>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Win Rate</div>
                  <div className="text-3xl font-black text-slate-900">34.2%</div>
                  <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold">
                    <SafeIcon icon={FiIcons.FiTrendingUp} className="mr-1" />
                    <span>+2.1% this quarter</span>
                  </div>
                </>
              )}
              {i === 3 && (
                <>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Swarm Tasks</div>
                  <div className="text-3xl font-black text-slate-900">1,204</div>
                  <div className="mt-4 flex items-center text-indigo-600 text-xs font-bold">
                    <SafeIcon icon={FiIcons.FiCpu} className="mr-1" />
                    <span>System Stable</span>
                  </div>
                </>
              )}
            </div>
          )
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96 flex items-center justify-center">
        {localLoading ? (
          <div className="w-full h-full flex items-end justify-between space-x-2 animate-pulse pb-4">
             {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-slate-200 rounded-t-md w-full" style={{ height: `${Math.random() * 80 + 10}%` }}></div>
             ))}
          </div>
        ) : (
          <div className="text-slate-400 text-sm font-bold flex flex-col items-center max-w-sm text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <SafeIcon icon={FiIcons.FiAlertCircle} className="text-2xl text-slate-300" />
            </div>
            <span className="text-slate-700 text-base mb-1">Insufficient data to render pipeline velocity</span>
            <span className="text-slate-400 text-xs font-normal">Onyx requires at least 30 days of historical deal stage progression to generate statistically significant velocity models. Check back later.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
