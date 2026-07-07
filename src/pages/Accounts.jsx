import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDebounce } from '../hooks/useDebounce';
import { accountService } from '../services/accountService';

const Accounts = () => {
  const { deals, contacts } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [localAccounts, setLocalAccounts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortConfig, setSortConfig] = useState({ field: 'created_at', ascending: false });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAll(0, debouncedSearchTerm, sortConfig);
        setLocalAccounts(data);
        setOffset(0);
        setHasMore(data.length === 50);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };
    fetchAccounts();
  }, [debouncedSearchTerm, sortConfig]);

  const loadMore = async () => {
    try {
      const nextOffset = offset + 50;
      const data = await accountService.getAll(nextOffset, debouncedSearchTerm, sortConfig);
      setLocalAccounts(prev => [...prev, ...data]);
      setOffset(nextOffset);
      setHasMore(data.length === 50);
    } catch (error) {
      console.error("Error fetching more accounts:", error);
    }
  };

  const getAccountMetrics = (accountId) => {
    const accDeals = deals.filter(d => d.account_id === accountId);
    const accContacts = contacts.filter(c => c.account_id === accountId);
    return {
      dealCount: accDeals.length,
      totalValue: accDeals.reduce((sum, d) => sum + d.amount, 0),
      contactCount: accContacts.length
    };
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Matrix</h1>
          <p className="text-slate-500 text-sm mt-1">Enterprise organizational structures and firmographic intelligence.</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <SafeIcon icon={FiIcons.FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter organizations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
            />
          </div>

          <select
            value={sortConfig.field + '-' + sortConfig.ascending}
            onChange={(e) => {
              const [field, ascendingStr] = e.target.value.split('-');
              setSortConfig({ field, ascending: ascendingStr === 'true' });
            }}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-bold"
          >
            <option value="created_at-false">Sort by: Newest</option>
            <option value="created_at-true">Sort by: Oldest</option>
            <option value="annual_revenue-false">Sort by: Revenue</option>
            <option value="company_name-true">Sort by: Name</option>
          </select>
          <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center space-x-2 shadow-lg shadow-indigo-100 shrink-0">
            <SafeIcon icon={FiIcons.FiPlus} />
            <span>New Account</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto w-full pb-4">
        <div className="flex flex-row md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-max md:min-w-0">
          {localAccounts.map(acc => {
          const metrics = getAccountMetrics(acc.id);
          return (
            <div key={acc.id} className="w-[85vw] sm:w-[320px] md:w-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-300 transition-all group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                    <SafeIcon icon={FiIcons.FiBriefcase} className="text-xl" />
                  </div>
                  <div className="flex flex-col items-end gap-2"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">B2B ENTITY</span><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{acc.industry}</div></div>
                </div>
                
                <h3 className="text-lg font-black text-slate-900 mb-1">{acc.company_name}</h3>
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mb-6">
                  <SafeIcon icon={FiIcons.FiGlobe} />
                  <a href={`https://${acc.website}`} className="hover:text-indigo-600">{acc.website}</a>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-6">
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Contacts</div>
                    <div className="text-sm font-black text-slate-800">{metrics.contactCount}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Deals</div>
                    <div className="text-sm font-black text-slate-800">{metrics.dealCount}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Value</div>
                    <div className="text-sm font-black text-indigo-600">${(metrics.totalValue / 1000).toFixed(0)}k</div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {acc.employee_count.toLocaleString()} Employees
                </div>
                <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                  <SafeIcon icon={FiIcons.FiArrowRight} />
                </button>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-300 transition-all shadow-sm flex items-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiRefreshCw} />
            <span>Load More</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Accounts;