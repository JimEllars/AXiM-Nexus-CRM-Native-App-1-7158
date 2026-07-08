import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useCrm } from '../context/CrmContext';
import { enrichmentService } from '../services/enrichmentService';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const EnrichmentStatusPanel = ({ entityId, entityType }) => {
  const [enrichmentStatus, setEnrichmentStatus] = useState('Unverified');
  const [isEnriching, setIsEnriching] = useState(false);
  const { refreshData } = useCrm();

  const handleEnrichment = async () => {
    if (isEnriching) return;
    setIsEnriching(true);
    setEnrichmentStatus('Syncing...');
    try {
      await enrichmentService.triggerDataEnrichment(entityId, entityType);
      // We don't set 'Enriched' here immediately since we want the Realtime listener to catch it
    } catch (e) {
      setEnrichmentStatus('Failed');
    } finally {
      setIsEnriching(false);
    }
  };

  useEffect(() => {
    if (!entityId || !entityType) return;

    const tableName = entityType === 'account' ? 'accounts' : 'contacts';

    const channel = supabase.channel(`${entityType}-enrichment-${entityId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: tableName,
          filter: `id=eq.${entityId}`
        },
        (payload) => {
          if (enrichmentStatus === 'Syncing...') {
            const newStatus = payload.new.enrichment_status || 'Enriched';
            setEnrichmentStatus(newStatus === 'FAILED' || newStatus === 'Failed' ? 'Failed' : 'Enriched');
            if (refreshData) refreshData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entityId, entityType, enrichmentStatus, refreshData]);

  // Determine styling based on status without nested ternaries
  let badgeClasses = 'bg-slate-100 text-slate-500';
  if (enrichmentStatus === 'Enriched') badgeClasses = 'bg-emerald-100 text-emerald-700';
  if (enrichmentStatus === 'Failed') badgeClasses = 'bg-red-100 text-red-700';
  if (enrichmentStatus === 'Syncing...') badgeClasses = 'bg-amber-100 text-amber-700';

  let buttonContent = null;
  if (enrichmentStatus === 'Failed') {
    buttonContent = (
      <button
        onClick={handleEnrichment}
        disabled={isEnriching}
        className="w-full bg-red-50 border border-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isEnriching ? (
          <>
            <svg className="animate-spin h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Retrying...</span>
          </>
        ) : (
          <>
            <SafeIcon icon={FiIcons.FiRefreshCw} />
            <span>Retry Enrichment</span>
          </>
        )}
      </button>
    );
  } else {
    buttonContent = (
      <button
        onClick={handleEnrichment}
        disabled={isEnriching}
        className="w-full bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isEnriching ? (
          <>
            <svg className="animate-spin h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Syncing...</span>
          </>
        ) : (
          <>
            <SafeIcon icon={FiIcons.FiDatabase} />
            <span>Run Enrichment Scraper</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
      <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center justify-between">
        <span>Data Integrity</span>
        <span className={`text-[10px] uppercase font-black px-2 py-1 rounded ${badgeClasses}`}>
          {enrichmentStatus}
        </span>
      </h4>
      {buttonContent}
    </div>
  );
};

export default EnrichmentStatusPanel;
