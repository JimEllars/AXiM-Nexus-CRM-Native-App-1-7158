import React, { useState, useRef } from 'react';
import * as FiIcons from 'react-icons/fi';
import { toast } from 'react-toastify';
import { contactService } from '../../services/contactService';
import { activityService } from '../../services/activityService';
import { useCrm } from '../../context/CrmContext';

const SafeIcon = ({ icon: Icon, className }) => {
  if (!Icon) return null;
  return <Icon className={className} />;
};

const CsvImportModal = ({ isOpen, onClose }) => {
  const { refreshData } = useCrm();
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState('dropzone'); // 'dropzone' or 'mapping'
  const [csvData, setCsvData] = useState({ headers: [], preview: [], allData: [] });
  const [fieldMapping, setFieldMapping] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setIsDragging(false);
    setStep('dropzone');
    setCsvData({ headers: [], preview: [], allData: [] });
    setFieldMapping({});
    setIsImporting(false);
  };

  const handleClose = () => {
    if (isImporting) return;
    resetState();
    onClose();
  };

  if (!isOpen) return null;
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };


  const handleFile = (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      toast.error('Invalid file format. Please upload a .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');

        if (lines.length < 2) {
            toast.error('CSV file must contain headers and at least one row of data.');
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const firstRow = lines[1].split(',').map(d => d.trim());

        // Store all data for the final import
        const allData = lines.slice(1).map(line => line.split(',').map(d => d.trim()));

        setCsvData({ headers, preview: firstRow, allData });
        setStep('mapping');

      } catch (err) {
        toast.error('Error parsing CSV file.');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file.');
    }
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    try {
      setIsImporting(true);

      const mappedContacts = csvData.allData.map(row => {
        const contact = {};
        csvData.headers.forEach((header, index) => {
          const dbField = fieldMapping[header];
          if (dbField && dbField !== '') {
            contact[dbField] = row[index];
          }
        });

        // Ensure required fields like type are set if not mapped
        if (!contact.type) {
            contact.type = 'B2B_LEAD';
        }

        return contact;
      }).filter(contact => Object.keys(contact).length > 1); // Filter out empty maps (only 'type')

      if (mappedContacts.length === 0) {
        toast.error('No valid mappings found. Please map at least one field.');
        setIsImporting(false);
        return;
      }

      await contactService.bulkImportContacts(mappedContacts);
      await activityService.logSystemActivity(`Operator bulk imported ${mappedContacts.length} contact records via CSV.`);

      toast.success('Import completed successfully.');

      if (refreshData) {
          refreshData();
      }

      handleClose();
    } catch (err) {
      console.error('Import failed:', err);
      toast.error('Failed to import contacts. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <SafeIcon icon={FiIcons.FiUploadCloud} className="text-indigo-600" />
            Import CSV
          </h2>
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <SafeIcon icon={FiIcons.FiX} className="text-xl" />
          </button>
        </div>

        <div className="p-6">
          {step === 'dropzone' ? (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              <SafeIcon icon={FiIcons.FiFileText} className="text-4xl text-slate-400 mx-auto mb-4" />
              <p className="text-slate-700 dark:text-slate-200 font-semibold mb-1">Click to upload or drag and drop</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">CSV files only</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Map your CSV columns to CRM fields.</p>
              {csvData.headers.map((header, index) => (
                <div key={index} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{header}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Ex: {csvData.preview[index]}</p>
                  </div>
                  <div className="flex-1">
                    <select
                      className="w-full text-sm border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
                      value={fieldMapping[header] || ''}
                      onChange={(e) => setFieldMapping({...fieldMapping, [header]: e.target.value})}
                      disabled={isImporting}
                    >
                      <option value="">-- Ignore --</option>
                      <option value="first_name">First Name</option>
                      <option value="last_name">Last Name</option>
                      <option value="email">Email</option>
                      <option value="company">Company</option>
                      <option value="phone">Phone</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 bg-slate-100 dark:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          {step === 'mapping' && (
            <button
              onClick={handleConfirmImport}
              disabled={isImporting}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isImporting && <SafeIcon icon={FiIcons.FiLoader} className="animate-spin" />}
              {isImporting ? 'Importing...' : 'Confirm & Queue Import'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CsvImportModal;
