import React, { useState, useEffect, useMemo } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCrm } from '../context/CrmContext';
import { supabase, logToAsguardDLQ } from '../lib/supabase';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';


const Analytics = () => {

  const { loading, deals, activities, session } = useCrm();
  const isAdmin = session?.user?.app_metadata?.role === 'admin' || session?.user?.role === 'admin' || session?.user?.email === 'admin@axim.us.com' || session?.user?.email === 'james.ellars@axim.us.com';


  const swarmTasksData = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    // Filter for SWARM_COMPLETE
    const swarmActivities = activities.filter(a => a.type === 'SWARM_COMPLETE' || a.activity_type === 'SWARM_COMPLETE');

    // Group by day using created_at
    const grouped = swarmActivities.reduce((acc, activity) => {
      const date = new Date(activity.created_at);
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      acc[dayStr] = (acc[dayStr] || 0) + 1;
      return acc;
    }, {});

    // We want the last 7 days in order ideally, but for now we'll just sort or return what we have.
    // Let's create a template for the last 7 days
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      result.push({ name: dayStr, tasks: grouped[dayStr] || 0 });
    }

    return result;
  }, [activities]);

  const [localLoading, setLocalLoading] = useState(true);
  const [pipelineVelocity, setPipelineVelocity] = useState(null);
  const [winRate, setWinRate] = useState(null);

  const agentPerformanceData = [
    { name: 'Sarah J.', won: 14, lost: 4 },
    { name: 'Michael T.', won: 9, lost: 2 },
    { name: 'David R.', won: 18, lost: 7 }
  ];

  const myPerformanceData = [
    { name: 'My Performance', won: 12, lost: 3 }
  ];

  const pieChartData = [
    { name: 'B2B Commercial', value: 65 },
    { name: 'B2C Consumer', value: 35 }
  ];
  const COLORS = ['#818cf8', '#34d399', '#f87171', '#fbbf24'];


  // Fetch RPC data for analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: velocityData, error: velocityError } = await supabase.rpc('calculate_pipeline_velocity');
        if (velocityError) throw velocityError;
        console.log('[Analytics] Mock pipeline velocity response:', velocityData);
        setPipelineVelocity(velocityData == null || isNaN(velocityData) ? 0 : velocityData);
      } catch (err) {
        console.error('[Analytics] Failed to fetch pipeline velocity:', err);
        setPipelineVelocity(0);
        logToAsguardDLQ({ type: 'ANALYTICS_ERROR', message: 'Failed to fetch pipeline velocity', error: err });
      }

      try {
        const { data: winRateData, error: winRateError } = await supabase.rpc('get_win_rate_percentage');
        if (winRateError) throw winRateError;
        console.log('[Analytics] Mock win rate response:', winRateData);
        setWinRate(winRateData == null || isNaN(winRateData) ? 0 : winRateData);
      } catch (err) {
        console.error('[Analytics] Failed to fetch win rate:', err);
        setWinRate(0);
        logToAsguardDLQ({ type: 'ANALYTICS_ERROR', message: 'Failed to fetch win rate', error: err });
      }
    };

    if (!loading) {
      fetchAnalytics();
    }
  }, [loading]);

  const pipelineVelocityData = useMemo(() => {
      if (!deals || deals.length === 0) return [];

      const stageCounts = deals.reduce((acc, deal) => {
          const stage = deal.stage || 'Unknown';
          acc[stage] = (acc[stage] || 0) + 1;
          return acc;
      }, {});

      return Object.entries(stageCounts).map(([name, value]) => ({
          name,
          value
      }));
  }, [deals]);

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


      {/* Sequence Engagement Metrics (Admin Only) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Active Sequences</div>
            <div className="text-3xl font-black text-white">12</div>
            <div className="mt-4 flex items-center text-emerald-400 text-xs font-bold">
              <SafeIcon icon={FiIcons.FiTrendingUp} className="mr-1" />
              <span>+2 this week</span>
            </div>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Emails Dispatched (7 Days)</div>
            <div className="text-3xl font-black text-white">4,892</div>
            <div className="mt-4 flex items-center text-emerald-400 text-xs font-bold">
              <SafeIcon icon={FiIcons.FiTrendingUp} className="mr-1" />
              <span>+14.2% volume</span>
            </div>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Average Open Rate</div>
            <div className="text-3xl font-black text-white">38.4%</div>
            <div className="mt-4 flex items-center text-emerald-400 text-xs font-bold">
              <SafeIcon icon={FiIcons.FiTrendingUp} className="mr-1" />
              <span>+1.5% from last week</span>
            </div>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Avg. Pipeline Velocity</div>
            <div className="text-3xl font-black text-white">14 Days</div>
            <div className="mt-4 flex items-center text-emerald-400 text-xs font-bold">
              <SafeIcon icon={FiIcons.FiTrendingDown} className="mr-1" />
              <span>-2 Days to Close</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
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
                  <div className="text-3xl font-black text-slate-900">${(pipelineVelocity ?? 0).toLocaleString()}</div>
                  <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold">
                    <SafeIcon icon={FiIcons.FiTrendingUp} className="mr-1" />
                    <span>+12.4% from last sweep</span>
                  </div>
                </>
              )}
              {i === 2 && (
                <>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Win Rate</div>
                  <div className="text-3xl font-black text-slate-900">{(winRate ?? 0).toFixed(1)}%</div>
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
              {i === 4 && (
                <>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Avg. Pipeline Velocity</div>
                  <div className="text-3xl font-black text-slate-900">14 Days</div>
                  <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold">
                    <SafeIcon icon={FiIcons.FiTrendingDown} className="mr-1" />
                    <span>-2 Days to Close</span>
                  </div>
                </>
              )}
            </div>
          )
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Existing Demographics Pie Chart */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col h-96">
        <h3 className="text-slate-200 font-bold mb-4">Contact Demographics</h3>
        <div className="flex-1 w-full h-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Deal Conversion Chart (RBAC) */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col h-96">
        <h3 className="text-slate-200 font-bold mb-4">Agent Deal Conversion (MTD)</h3>
        <div className="flex-1 w-full h-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={isAdmin ? agentPerformanceData : myPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#f8fafc' }}
                cursor={{fill: '#334155'}}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#94a3b8', fontSize: '12px', paddingBottom: '10px' }} />
              <Bar dataKey="won" name="Deals Won" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lost" name="Deals Lost" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col h-96">
          <h3 className="text-slate-200 font-bold mb-4">Pipeline Velocity</h3>
          <div className="flex-1 w-full h-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineVelocityData.length > 0 ? pipelineVelocityData : [{ name: 'No Data', value: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#818cf8' }}
                  cursor={{fill: '#334155'}}
                />
                <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col h-96">
          <h3 className="text-slate-200 font-bold mb-4">AI Swarm Tasks Completed</h3>
          <div className="flex-1 w-full h-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={swarmTasksData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#34d399' }}
                />
                <Line type="monotone" dataKey="tasks" stroke="#34d399" strokeWidth={3} dot={{ fill: '#34d399', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="hidden">
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
