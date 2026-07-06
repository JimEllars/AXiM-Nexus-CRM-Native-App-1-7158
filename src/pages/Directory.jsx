import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrm } from '../context/CrmContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import CreateContactModal from '../components/modals/CreateContactModal';
import BulkAddContactsModal from '../components/modals/BulkAddContactsModal';
import { useDebounce } from '../hooks/useDebounce';
import { contactService } from '../services/contactService';

const Directory = () => {
  const { accounts } = useCrm();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [localContacts, setLocalContacts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await contactService.getAll(0, debouncedSearchTerm);
        setLocalContacts(data);
        setOffset(0);
        setHasMore(data.length === 50);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    fetchContacts();
  }, [debouncedSearchTerm]);

  const loadMore = async () => {
    try {
      const nextOffset = offset + 50;
      const data = await contactService.getAll(nextOffset, debouncedSearchTerm);
      setLocalContacts(prev => [...prev, ...data]);
      setOffset(nextOffset);
      setHasMore(data.length === 50);
    } catch (error) {
      console.error("Error fetching more contacts:", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Unified Directory</h1>
          <p className="text-slate-500 text-sm mt-1">B2B and B2C entities ingested via Enrichment Bridge.</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <SafeIcon icon={FiIcons.FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter entities..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
            />
          </div>
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center space-x-2 shrink-0"
          >
            <SafeIcon icon={FiIcons.FiUploadCloud} />
            <span className="hidden sm:inline">Bulk Add</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center space-x-2 shadow-lg shadow-indigo-100 shrink-0"
          >
            <SafeIcon icon={FiIcons.FiPlus} />
            <span className="hidden sm:inline">Add Contact</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black tracking-widest text-slate-400">
              <th className="p-4">Name / Entity</th>
              <th className="p-4">Type</th>
              <th className="p-4">Contact Info</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {localContacts.map(contact => {
              const account = accounts.find(a => a.id === contact.account_id);
              return (
                <tr key={contact.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200">
                        {contact.first_name[0]}{contact.last_name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{contact.first_name} {contact.last_name}</div>
                        {account && <div className="text-[11px] text-slate-500 font-medium">{account.company_name}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${contact.type === 'B2B_LEAD' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-purple-50 text-purple-700 border border-purple-100'}`}>
                      {contact.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-slate-600 flex flex-col space-y-1">
                      <span className="flex items-center space-x-2"><SafeIcon icon={FiIcons.FiMail} className="text-slate-400 text-[10px]"/> <span className="font-mono">{contact.email}</span></span>
                      <span className="flex items-center space-x-2"><SafeIcon icon={FiIcons.FiPhone} className="text-slate-400 text-[10px]"/> <span className="font-mono">{contact.phone}</span></span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => navigate(`/contact/${contact.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      View 360
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {localContacts.length === 0 && (
          <div className="p-12 text-center text-slate-400 italic text-sm">
            No entities found matching your criteria.
          </div>
        )}
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

      <CreateContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <BulkAddContactsModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} />
    </div>
  );
};

export default Directory;