import React, { useEffect, useState, useRef } from 'react';
import * as FiIcons from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useDebounce } from '../../hooks/useDebounce';

const SafeIcon = ({ icon: Icon, className }) => {
  if (!Icon) return null;
  return <Icon className={className} />;
};

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearch('');
        setResults([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setSearch('');
      setResults([]);
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedSearch) {
        setResults([]);
        setFocusedIndex(-1);
        return;
      }

      setIsSearching(true);
      const startTime = performance.now();

      try {
        const searchTerm = `%${debouncedSearch}%`;

        // Execute ILIKE queries
        const [contactsRes, accountsRes] = await Promise.all([
          supabase
            .from('contacts')
            .select('id, first_name, last_name, email')
            .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
            .limit(5),
          supabase
            .from('accounts')
            .select('id, company_name')
            .ilike('company_name', searchTerm)
            .limit(5)
        ]);

        let combined = [];

        if (contactsRes.data) {
          combined = [
            ...combined,
            ...contactsRes.data.map(c => ({
              id: c.id,
              title: `${c.first_name} ${c.last_name}`,
              subtitle: c.email,
              type: 'Contact',
              link: `/contact/${c.id}`
            }))
          ];
        }

        if (accountsRes.data) {
          combined = [
            ...combined,
            ...accountsRes.data.map(a => ({
              id: a.id,
              title: a.company_name,
              type: 'Account',
              link: `/account/${a.id}`
            }))
          ];
        }

        setResults(combined);
        setFocusedIndex(combined.length > 0 ? 0 : -1);

      } catch (error) {
        console.error('Command Palette search error:', error);
      } finally {
        setIsSearching(false);
        const duration = performance.now() - startTime;
        if (duration > 2500 && navigator.sendBeacon) {
          navigator.sendBeacon('/cdn-cgi/telemetry', JSON.stringify({
            type: 'COMMAND_PALETTE_LATENCY',
            duration: duration,
            timestamp: new Date().toISOString()
          }));
        }
      }
    };

    fetchResults();
  }, [debouncedSearch]);

  useEffect(() => {
    const handleNavigation = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < results.length) {
          const selected = results[focusedIndex];
          navigate(selected.link);
          setIsOpen(false);
          setSearch('');
          setResults([]);
        }
      }
    };

    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, results, focusedIndex, navigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <SafeIcon icon={FiIcons.FiSearch} className="text-xl text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 text-lg text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none focus:ring-0"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
            <span>ESC</span>
          </div>
        </div>

        {search && (
          <div className="max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="px-4 py-8 text-center bg-slate-50">
                <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                  <SafeIcon icon={FiIcons.FiLoader} className="animate-spin" />
                  Searching...
                </p>
              </div>
            ) : results.length > 0 ? (
              <ul className="py-2">
                {results.map((item, index) => (
                  <li
                    key={`${item.type}-${item.id}`}
                    className={`px-4 py-3 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center ${
                      focusedIndex === index ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                    }`}
                    onClick={() => {
                      navigate(item.link);
                      setIsOpen(false);
                      setSearch('');
                      setResults([]);
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block">{item.title}</span>
                      {item.subtitle && <span className="text-xs text-slate-500">{item.subtitle}</span>}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
                      {item.type}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center bg-slate-50">
                <p className="text-sm text-slate-500">No results found for "{search}"</p>
              </div>
            )}
          </div>
        )}

        {!search && (
          <div className="px-4 py-8 text-center bg-slate-50">
            <p className="text-sm text-slate-500">Start typing to search contacts and accounts...</p>
            <p className="text-xs text-slate-400 mt-2">
              Use <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 shadow-sm">↑</kbd> and <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 shadow-sm">↓</kbd> to navigate, <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 shadow-sm">Enter</kbd> to select
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandPalette;
