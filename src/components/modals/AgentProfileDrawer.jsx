import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import * as FiIcons from 'react-icons/fi';

const SafeIcon = ({ icon: Icon, className }) => {
  if (!Icon) return null;
  return <Icon className={className} />;
};

const AgentProfileDrawer = ({ isOpen, onClose }) => {
  const { isUserOnline, setIsUserOnline, presenceChannel, session } = useCrm();


  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-slate-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Agent Profile
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <SafeIcon icon={FiIcons.FiX} className="text-xl" />
          </button>
        </div>
        <div className="flex-1 p-6 flex flex-col items-center">
          <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-700 text-indigo-700 dark:text-indigo-400 font-bold text-3xl shadow-sm mb-4">
            AD
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Internal Admin</h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-8">System Operator</p>

          <div className="w-full bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Presence Status</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{`${isUserOnline ? 'Online' : 'Offline'}`}</p>
              </div>
              <button
                onClick={async () => {
                  const newState = !isUserOnline;
                  setIsUserOnline(newState);
                  if (presenceChannel) {
                    await presenceChannel.track({
                      user_id: session?.user?.id || 'anonymous',
                      online_at: new Date().toISOString(),
                      status: newState ? 'online' : 'offline',
                    });
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isUserOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isUserOnline ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentProfileDrawer;