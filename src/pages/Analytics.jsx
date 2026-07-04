import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useCrm } from '../context/CrmContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const Analytics = () => {
  const { deals, contacts } = useCrm();

  const stageData = deals.reduce((acc, deal) => {
    acc[deal.stage] = (acc[deal.stage] || 0) + deal.amount;
    return acc;
  }, {});

  const pipelineChart = {
    tooltip: { trigger: 'item' },
    series: [{
      name: 'Pipeline Value',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: Object.entries(stageData).map(([name, value]) => ({ name: name.replace('_', ' '), value }))
    }]
  };

  const onyxAccuracyChart = {
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value' },
    series: [{
      data: [82, 85, 84, 88, 92, 91, 94],
      type: 'line',
      smooth: true,
      color: '#6366f1',
      areaStyle: { color: 'rgba(99, 102, 241, 0.1)' }
    }]
  };

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
          <div className="text-3xl font-black text-slate-900">${deals.reduce((a, b) => a + b.amount, 0).toLocaleString()}</div>
          <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold">
            <SafeIcon icon={FiIcons.FiTrendingUp} className="mr-1" />
            <span>+12.4% from last sweep</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Leads</div>
          <div className="text-3xl font-black text-slate-900">{contacts.length}</div>
          <div className="mt-4 flex items-center text-indigo-600 text-xs font-bold">
            <SafeIcon icon={FiIcons.FiCpu} className="mr-1" />
            <span>88% Onyx Enriched</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Onyx Confidence</div>
          <div className="text-3xl font-black text-slate-900">94.2%</div>
          <div className="mt-4 flex items-center text-slate-400 text-xs font-bold">
            <SafeIcon icon={FiIcons.FiCheckCircle} className="mr-1" />
            <span>System Stable</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Revenue by Stage</h3>
          <ReactECharts option={pipelineChart} style={{ height: '300px' }} />
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Onyx Prediction Accuracy (7d)</h3>
          <ReactECharts option={onyxAccuracyChart} style={{ height: '300px' }} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;