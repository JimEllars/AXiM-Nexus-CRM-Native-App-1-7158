import React from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const TopNav = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 z-10 w-full flex-shrink-0">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative w-full max-w-md">
          <SafeIcon icon={FiIcons.FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search accounts, contacts, or deals (Onyx Indexed)..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 lg:space-x-6">
        <button className="text-slate-400 hover:text-slate-600 relative transition-colors">
          <SafeIcon icon={FiIcons.FiBell} className="text-xl" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center space-x-3 pl-4 lg:pl-6 border-l border-slate-200 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Internal Admin</p>
            <p className="text-xs text-slate-500 font-mono">axim_internal_admin</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 text-indigo-700 font-bold shadow-sm group-hover:bg-indigo-100 transition-colors">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
