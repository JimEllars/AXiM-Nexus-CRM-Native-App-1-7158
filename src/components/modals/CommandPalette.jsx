import React, { useEffect, useState, useRef } from 'react';
import * as FiIcons from 'react-icons/fi';

const SafeIcon = ({ icon: Icon, className }) => {
  if (!Icon) return null;
  return <Icon className={className} />;
};

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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
        <div className="px-4 py-8 text-center bg-slate-50">
          <p className="text-sm text-slate-500">Command Palette coming soon.</p>
          <p className="text-xs text-slate-400 mt-2">Use <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 shadow-sm">Cmd</kbd> + <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 shadow-sm">K</kbd> to toggle</p>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
