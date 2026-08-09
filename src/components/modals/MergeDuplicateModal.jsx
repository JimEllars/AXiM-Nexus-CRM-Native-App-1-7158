import React, { useState, useEffect } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { contactService } from '../../services/contactService';
import { notificationService } from '../../services/notificationService';
import { useCrm } from '../../context/CrmContext';

const MergeDuplicateModal = ({ isOpen, onClose, duplicateGroups, onMergeComplete }) => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selections, setSelections] = useState({});

  useEffect(() => {
    if (isOpen && duplicateGroups.length > 0) {
      const currentGroup = duplicateGroups[currentGroupIndex];
      const master = currentGroup[0];
      const dup = currentGroup[1];

      setSelections({
        first_name: master.id,
        last_name: master.id,
        email: master.id,
        phone: master.id,
        company: master.id,
      });
    }
  }, [isOpen, duplicateGroups, currentGroupIndex]);

  if (!isOpen || !duplicateGroups || duplicateGroups.length === 0) return null;

  const currentGroup = duplicateGroups[currentGroupIndex];
  // Simplification: just merge the first two records in the group
  const master = currentGroup[0];
  const duplicate = currentGroup[1];

  const handleSelection = (field, id) => {
    setSelections(prev => ({ ...prev, [field]: id }));
  };

  const handleMerge = async () => {
    setIsSubmitting(true);
    try {
      const mergedData = {
        first_name: selections.first_name === master.id ? master.first_name : duplicate.first_name,
        last_name: selections.last_name === master.id ? master.last_name : duplicate.last_name,
        email: selections.email === master.id ? master.email : duplicate.email,
        phone: selections.phone === master.id ? master.phone : duplicate.phone,
        company: selections.company === master.id ? master.company : duplicate.company,
      };

      await contactService.mergeContacts(master.id, duplicate.id, mergedData);

      // Go to next group or close if done
      if (currentGroupIndex < duplicateGroups.length - 1) {
        setCurrentGroupIndex(prev => prev + 1);
      } else {
        onMergeComplete();
        onClose();
      }
    } catch (error) {
      console.error('Merge failed:', error);
      notificationService.notifyError('Failed to merge records.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = ['first_name', 'last_name', 'email', 'phone', 'company'];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <SafeIcon icon={FiIcons.FiGitMerge} className="mr-2 text-indigo-600" />
              Resolve Duplicates
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Group {currentGroupIndex + 1} of {duplicateGroups.length}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <SafeIcon icon={FiIcons.FiX} className="text-xl" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-3 gap-6 mb-4">
            <div className="font-semibold text-slate-700 pb-2 border-b">Field</div>
            <div className="font-semibold text-slate-700 pb-2 border-b">Record 1 (Master)</div>
            <div className="font-semibold text-slate-700 pb-2 border-b">Record 2</div>

            {fields.map(field => (
              <React.Fragment key={field}>
                <div className="flex items-center text-sm font-medium text-slate-600 capitalize">
                  {field.replace('_', ' ')}
                </div>

                <div
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${selections[field] === master.id ? 'bg-indigo-50 border-indigo-200' : 'border-slate-200 hover:border-indigo-100'}`}
                  onClick={() => handleSelection(field, master.id)}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={selections[field] === master.id}
                      onChange={() => handleSelection(field, master.id)}
                      className="mr-3 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-800 break-all">{master[field] || <span className="text-slate-400 italic">Empty</span>}</span>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${selections[field] === duplicate.id ? 'bg-indigo-50 border-indigo-200' : 'border-slate-200 hover:border-indigo-100'}`}
                  onClick={() => handleSelection(field, duplicate.id)}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      checked={selections[field] === duplicate.id}
                      onChange={() => handleSelection(field, duplicate.id)}
                      className="mr-3 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-800 break-all">{duplicate[field] || <span className="text-slate-400 italic">Empty</span>}</span>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
          {currentGroup.length > 2 && (
             <p className="text-xs text-amber-600 mt-4 bg-amber-50 p-2 rounded border border-amber-200">
               Note: More than 2 duplicates found in this group. You are resolving the first pair.
             </p>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end space-x-3">
          <button
            onClick={() => {
                if (currentGroupIndex < duplicateGroups.length - 1) {
                    setCurrentGroupIndex(prev => prev + 1);
                } else {
                    onClose();
                }
            }}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            disabled={isSubmitting}
          >
            Skip
          </button>
          <button
            onClick={handleMerge}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
          >
            {isSubmitting ? (
               <><SafeIcon icon={FiIcons.FiLoader} className="animate-spin mr-2" /> Merging...</>
            ) : (
                'Merge Selected Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MergeDuplicateModal;
