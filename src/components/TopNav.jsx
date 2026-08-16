import TaskDrawer from "./modals/TaskDrawer";
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrm } from '../context/CrmContext';
import { useDebounce } from '../hooks/useDebounce';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import { notificationService } from '../services/notificationService';

const TopNav = () => {
    const [isAgentDrawerOpen, setIsAgentDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { contacts, accounts, deals, activities, isDarkMode, toggleDarkMode, tasks, isUserOnline, isGlobalTaskDrawerOpen, setIsGlobalTaskDrawerOpen, isMobileMenuOpen, setIsMobileMenuOpen } = useCrm();
  const incompleteTasksCount = (tasks || []).filter(t => t.status !== 'DONE').length;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [searchError, setSearchError] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  const liveNotifications = (activities || [])
    .filter(a => a.type === 'SYSTEM_ALERT' || a.type === 'SWARM_COMPLETE')
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setSearchResults([]);
      setIsSearchOpen(false);
      setSearchError(false);
      return;
    }

    try {
      setSearchError(false);
      const lowerTerm = debouncedSearchTerm.toLowerCase();

      const matchedContacts = contacts
        .filter(c => (c.first_name + ' ' + c.last_name).toLowerCase().includes(lowerTerm) || c.email?.toLowerCase().includes(lowerTerm))
        .slice(0, 3)
        .map(c => ({ id: c.id, title: `${c.first_name} ${c.last_name}`, type: 'Contact', link: `/contact/${c.id}` }));

      const matchedAccounts = accounts
        .filter(a => a.company_name?.toLowerCase().includes(lowerTerm))
        .slice(0, 3)
        .map(a => ({ id: a.id, title: a.company_name, type: 'Account', link: `/account/${a.id}` }));

      const matchedDeals = deals
        .filter(d => d.title?.toLowerCase().includes(lowerTerm))
        .slice(0, 3)
        .map(d => ({ id: d.id, title: d.title, type: 'Deal', link: `/pipeline` }));

      const combined = [...matchedContacts, ...matchedAccounts, ...matchedDeals];
      setSearchResults(combined);
      setIsSearchOpen(combined.length > 0);
      setFocusedIndex(-1);
    } catch (error) {
      console.error('Global search error:', error);
      setSearchError(true);
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/cdn-cgi/telemetry', JSON.stringify({
          type: 'GLOBAL_SEARCH_ERROR',
          message: error.message,
          timestamp: new Date().toISOString()
        }));
      }
    }
  }, [debouncedSearchTerm, contacts, accounts, deals]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isSearchOpen || searchResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < searchResults.length) {
          const selected = searchResults[focusedIndex];
          navigate(selected.link);
          setSearchTerm('');
          setIsSearchOpen(false);
        }
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setFocusedIndex(-1);
        if (searchRef.current) {
          const input = searchRef.current.querySelector('input');
          if (input) input.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, searchResults, focusedIndex, navigate]);

  useEffect(() => {
    const channel = supabase
      .channel('topnav-activities-sync')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activities'
      }, (payload) => {
        if (payload.new && (payload.new.type === 'SYSTEM_ALERT' || payload.new.type === 'SWARM_COMPLETE')) {
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe((status, err) => {
        if (err) console.error('TopNav Realtime sync error:', err);
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
    <header className="h-auto min-h-[4rem] bg-white border-b border-slate-200 flex flex-wrap sm:flex-nowrap items-center justify-between px-4 lg:px-8 py-2 z-10 w-full flex-shrink-0 gap-2">
      <div className="flex items-center space-x-4 flex-1">
        <button
          onClick={() => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
          className="md:hidden p-2 text-slate-500 hover:text-indigo-600 focus:outline-none transition-colors"
        >
          <SafeIcon icon={FiIcons.FiMenu} className="text-2xl" />
        </button>
                <div className="relative w-full max-w-md w-full md:w-auto" ref={searchRef}>
          <SafeIcon icon={FiIcons.FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search accounts, contacts, or deals (Onyx Indexed)..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value === '') {
                setIsSearchOpen(false);
                setSearchResults([]);
              }
            }}
            onFocus={() => { if (searchResults.length > 0 && searchTerm !== '') setIsSearchOpen(true); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
          />
          {searchError && searchTerm !== '' && (
            <div className="absolute top-full mt-2 w-full bg-white border border-rose-200 rounded-lg shadow-lg overflow-hidden z-50 p-4 text-center">
              <span className="text-sm font-semibold text-rose-600">Search temporarily unavailable</span>
            </div>
          )}
          {!searchError && isSearchOpen && searchTerm !== '' && (
            <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
              <ul className="max-h-80 overflow-y-auto">
                {searchResults.map((item, index) => (
                  <li
                    key={item.id + item.type}
                    className={`px-4 py-3 cursor-pointer border-b border-slate-100 last:border-0 ${focusedIndex === index ? 'bg-gray-100' : 'hover:bg-slate-50'}`}
                    onClick={() => {
                      navigate(item.link);
                      setSearchTerm('');
                      setIsSearchOpen(false);
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-800">{item.title}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase">{item.type}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4 lg:space-x-6">
        <button
          onClick={toggleDarkMode}
          className="text-slate-400 hover:text-indigo-600 transition-colors"
          title="Toggle Dark Mode"
        >
          <SafeIcon icon={isDarkMode ? FiIcons.FiSun : FiIcons.FiMoon} className="text-xl" />
        </button>
        <button
          onClick={() => setIsGlobalTaskDrawerOpen(true)}
          className="text-slate-400 hover:text-indigo-600 transition-colors relative"
          title="Open Task Drawer"
        >
          <SafeIcon icon={FiIcons.FiCheckSquare} className="text-xl" />
          {incompleteTasksCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center shadow-sm">
              {incompleteTasksCount > 9 ? '9+' : incompleteTasksCount}
            </span>
          )}
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            className="text-slate-400 hover:text-slate-600 relative transition-colors"
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              if (!isDropdownOpen) setUnreadCount(0);
            }}
          >
            <SafeIcon icon={FiIcons.FiBell} className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white text-[8px] text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-800">System Notifications</h3>
                  <button onClick={() => setIsDropdownOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <SafeIcon icon={FiIcons.FiX} className="text-xl" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                    <SafeIcon icon={FiIcons.FiBellOff} className="text-2xl" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">No new system alerts.</p>
                  <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setUnreadCount(0);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center space-x-3 pl-4 lg:pl-6 border-l border-slate-200 cursor-pointer group" onClick={() => setIsAgentDrawerOpen(true)}>
          <div className="text-right w-full md:w-auto">
            <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Internal Admin</p>
            <p className="text-xs text-slate-500 font-mono">axim_internal_admin</p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 text-indigo-700 font-bold shadow-sm group-hover:bg-indigo-100 transition-colors">
              AD
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isUserOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
          </div>
        </div>
      </div>
    </header>
      <TaskDrawer isOpen={isGlobalTaskDrawerOpen} onClose={() => setIsGlobalTaskDrawerOpen(false)} />
      <AgentProfileDrawer isOpen={isAgentDrawerOpen} onClose={() => setIsAgentDrawerOpen(false)} />
    </>
  );
};

export default TopNav;
