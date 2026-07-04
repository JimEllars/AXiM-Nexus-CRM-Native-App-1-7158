import React, { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCrm } from '../../context/CrmContext';

const BulkAddContactsModal = ({ isOpen, onClose }) => {
  const { bulkAddContacts } = useCrm();
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleBulkAdd = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const enrichmentBridgeUrl = import.meta.env.VITE_ENRICHMENT_BRIDGE_URL;

      if (!enrichmentBridgeUrl) {
        throw new Error("Enrichment Bridge URL is not configured.");
      }

      const lines = csvText.trim().split("\n");
      if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === "")) {
        throw new Error("No data provided");
      }

      const contacts = lines.map(line => {
        const [firstName, lastName, email, phone, type] = line.split(",").map(s => s.trim());
        if (!firstName || !lastName || !email) {
          throw new Error(`Invalid line: ${line}. Required format: First Name, Last Name, Email, Phone, Type`);
        }
        return {
          first_name: firstName,
          last_name: lastName,
          email,
          phone: phone || "",
          type: type || "B2B_LEAD"
        };
      });

      const response = await fetch(enrichmentBridgeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ contacts })
      });

      if (!response.ok) {
        throw new Error(`Failed to ingest contacts: ${response.statusText}`);
      }

      onClose();
      setCsvText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Bulk Entity Ingestion</h2>
            <p className="text-xs text-slate-500 font-medium">Import multiple stakeholders via CSV format</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <SafeIcon icon={FiIcons.FiX} />
          </button>
        </div>
        
        <form onSubmit={handleBulkAdd} className="p-8 space-y-6">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-2 flex items-center space-x-2">
              <SafeIcon icon={FiIcons.FiInfo} />
              <span>Required Format (One per line)</span>
            </h4>
            <code className="text-[11px] text-indigo-600 font-mono block bg-white/50 p-2 rounded border border-indigo-200/50">
              First Name, Last Name, Email, Phone (optional), Type (optional)
            </code>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Raw CSV Data</label>
            <textarea
              className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs leading-relaxed"
              placeholder="John, Smith, john@example.com, +123456789, B2B_LEAD&#10;Jane, Doe, jane@example.com, +198765432, B2C_CONSUMER"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-lg flex items-center space-x-2">
              <SafeIcon icon={FiIcons.FiAlertCircle} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isProcessing || !csvText.trim()}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <SafeIcon icon={FiIcons.FiRefreshCw} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiIcons.FiUploadCloud} />
                  <span>Start Bulk Ingest</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkAddContactsModal;
