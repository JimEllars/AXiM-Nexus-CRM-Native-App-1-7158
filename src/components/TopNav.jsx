import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrm } from '../context/CrmContext';
import { useDebounce } from '../hooks/useDebounce';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const TopNav = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { contacts, accounts, deals } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchRef = useRef(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

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
    const handleClickOutside = (event) => {
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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10 w-full flex-shrink-0">
      <div className="flex items-center space-x-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-indigo-600 focus:outline-none transition-colors"
        >
          <SafeIcon icon={FiIcons.FiMenu} className="text-2xl" />
        </button>
                <div className="relative w-full max-w-md hidden sm:block" ref={searchRef}>
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
          {isSearchOpen && searchTerm !== '' && (
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
