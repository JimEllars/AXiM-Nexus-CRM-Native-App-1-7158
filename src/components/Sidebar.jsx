import React from 'react';
import { NavLink } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: FiIcons.FiLayout },
    { name: 'Swarm (Tasks)', path: '/swarm', icon: FiIcons.FiZap },
    { name: 'Pipeline', path: '/pipeline', icon: FiIcons.FiTrello },
    { name: 'Directory', path: '/directory', icon: FiIcons.FiUsers },
    { name: 'Accounts', path: '/accounts', icon: FiIcons.FiBriefcase },
    { name: 'Campaigns', path: '/campaigns', icon: FiIcons.FiTarget },
    { name: 'Analytics', path: '/analytics', icon: FiIcons.FiPieChart },
    { name: 'Onyx Core', path: '/settings', icon: FiIcons.FiCpu },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 flex-shrink-0">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <SafeIcon icon={FiIcons.FiLayers} className="text-white text-xl" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-wider">AXiM</h1>
          <p className="text-xs text-slate-500 font-mono text-[10px]">CORE ENGINE v3.1</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                : 'hover:bg-slate-800 hover:text-white font-medium text-slate-400'
              }`
            }
          >
            <SafeIcon icon={item.icon} className="text-lg" />
            <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 m-4 bg-slate-850 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-xs text-emerald-400 mb-3 font-bold uppercase tracking-widest">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiIcons.FiActivity} className="animate-pulse" />
            <span>Onyx: Online</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
        </div>
        <div className="text-[9px] text-slate-500 space-y-1.5 font-mono uppercase">
          <div className="flex justify-between items-center"><span>Bridge:</span> <span className="text-slate-300">Active</span></div>
          <div className="flex justify-between items-center"><span>Enrichment:</span> <span className="text-slate-300">100%</span></div>
          <div className="flex justify-between items-center"><span>Uptime:</span> <span className="text-slate-300">99.9%</span></div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
