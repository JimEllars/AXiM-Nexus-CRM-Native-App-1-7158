import React, { useEffect, useState } from 'react';
import { useCommodoreStore } from '../store/useCommodoreStore';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { supabase } from '../lib/supabase';

const FleetAnalytics = () => {
  const { telemetryLogs, updateTelemetryLogs } = useCommodoreStore();
  const [data, setData] = useState([]);

  useEffect(() => {
    // Generate some mock initial data if empty
    if (telemetryLogs.length === 0) {
      const mockData = [
        { time: '10:00', velocity: 400 },
        { time: '11:00', velocity: 300 },
        { time: '12:00', velocity: 500 },
        { time: '13:00', velocity: 200 },
        { time: '14:00', velocity: 600 },
      ];
      updateTelemetryLogs(mockData);
      setData(mockData);
    } else {
      setData(telemetryLogs);
    }

    // Subscribe to realtime telemetry
    const channel = supabase.channel('fleet-telemetry-sync')
      .on('broadcast', { event: 'telemetry_update' }, (payload) => {
        setData((prev) => [...prev, payload.payload].slice(-20)); // Keep last 20
        updateTelemetryLogs((prev) => [...prev, payload.payload].slice(-20));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [telemetryLogs.length, updateTelemetryLogs]);

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-sm h-96 w-full">
      <h3 className="text-white font-bold mb-4">Fleet Velocity Analytics</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#818cf8' }}
          />
          <Line type="monotone" dataKey="velocity" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 4 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FleetAnalytics;
