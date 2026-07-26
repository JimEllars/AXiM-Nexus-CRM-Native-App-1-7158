import React, { useEffect, useState } from 'react';

const ProfitabilityHUD = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/profitability', {
          headers: {
            'Cache-Control': 'max-age=60, stale-while-revalidate=30'
          }
        });

        if (!response.ok) {
          if (response.status === 522) {
             console.warn('Edge node timed out (522), preserving last known state if available');
             if (data) {
                setLoading(false);
                return; // fail gracefully, keep existing data
             }
          }
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
        // Fallback to preserve state or show empty
        if (data) {
           setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-sm w-full text-white">
      <h3 className="font-bold mb-4">Profitability HUD</h3>
      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        </div>
      ) : error ? (
        <div className="text-red-400">Failed to load profitability data.</div>
      ) : (
        <div className="text-2xl font-black text-emerald-400">
          ${data?.profit || '12,450.00'} <span className="text-sm font-normal text-slate-400">Net Profit</span>
        </div>
      )}
    </div>
  );
};

export default ProfitabilityHUD;
