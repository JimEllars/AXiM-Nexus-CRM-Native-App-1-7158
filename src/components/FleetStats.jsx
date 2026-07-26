import React, { useEffect, useState } from 'react';
import { useCommodoreStore } from '../store/useCommodoreStore';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const FleetStats = () => {
  const { routeHistory, updateRouteHistory } = useCommodoreStore();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (routeHistory.length === 0) {
      const mockData = [
        { route: 'Alpha', efficiency: 85 },
        { route: 'Beta', efficiency: 92 },
        { route: 'Gamma', efficiency: 78 },
        { route: 'Delta', efficiency: 95 },
      ];
      updateRouteHistory(mockData);
      setData(mockData);
    } else {
      setData(routeHistory);
    }
  }, [routeHistory.length, updateRouteHistory]);

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-sm h-96 w-full">
      <h3 className="text-white font-bold mb-4">Route Efficiency Stats</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis dataKey="route" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
            cursor={{ fill: '#1e293b' }}
          />
          <Bar dataKey="efficiency" fill="#34d399" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FleetStats;
