import React, { useRef, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import { notificationService } from '../../services/notificationService';
import { contactService } from '../../services/contactService';
import { accountService } from '../../services/accountService';
import { activityService } from '../../services/activityService';
import { normalizeContactType, parseCsv } from '../../utils/csv';

const entityConfigurations = {
  contacts: {
    title: 'Import Contacts',
    description: 'Upload B2B business contacts or B2C consumer contacts.',
    fields: [
      ['first_name', 'First Name'],
      ['last_name', 'Last Name'],
      ['email', 'Email'],
      ['phone', 'Phone'],
      ['type', 'Contact Type (B2B or B2C)']
    ],
    required: ['first_name', 'last_name', 'email'],
    importRows: contactService.bulkImportContacts
  },
  accounts: {
    title: 'Import Business Accounts',
    description: 'Upload B2B company records.',
    fields: [
      ['company_name', 'Company Name'],
      ['website', 'Website'],
      ['industry', 'Industry'],
      ['employee_count', 'Employee Count'],
      ['annual_revenue', 'Annual Revenue']
    ],
    required: ['company_name'],
    importRows: async rows => {
      const imported = [];
      for (const row of rows) imported.push(await accountService.create(row));
      return imported;
    }
  }
};

const SafeIcon = ({ icon: Icon, className }) => (Icon ? <Icon className={className} /> : null);

const CsvImportModal = ({ isOpen, onClose, entityType = 'contacts', onImportComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState('dropzone');
  const [csvData, setCsvData] = useState({ headers: [], preview: [], allData: [] });
  const [fieldMapping, setFieldMapping] = useState({});
  const [defaultContactType, setDefaultContactType] = useState('B2B_LEAD');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  const config = entityConfigurations[entityType];

  const resetState = () => {
    setIsDragging(false);
    setStep('dropzone');
    setCsvData({ headers: [], preview: [], allData: [] });
    setFieldMapping({});
    setDefaultContactType('B2B_LEAD');
  };

  const handleClose = () => {
    if (isImporting) return;
    resetState();
    onClose();
  };

  const handleFile = file => {
    if (!file || !file.name.toLowerCase().endsWith('.csv')) {
      notificationService.notifyError('Select a .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const rows = parseCsv(event.target.result);
        if (rows.length < 2) throw new Error('CSV must contain headers and at least one data row.');
        setCsvData({ headers: rows[0], preview: rows[1], allData: rows.slice(1) });
        setStep('mapping');
      } catch (error) {
        notificationService.notifyError(error.message || 'Unable to parse the CSV file.');
      }
    };
    reader.onerror = () => notificationService.notifyError('Failed to read the CSV file.');
    reader.readAsText(file);
  };

  const buildRows = () => csvData.allData.map((row, rowIndex) => {
    const record = {};
    csvData.headers.forEach((header, index) => {
      const field = fieldMapping[header];
      if (field && row[index]) record[field] = row[index];
    });

    if (entityType === 'contacts') {
      record.type = normalizeContactType(record.type, defaultContactType);
      if (record.type === 'B2C_LEAD') record.account_id = null;
    } else {
      if (record.employee_count) record.employee_count = Number(record.employee_count);
      if (record.annual_revenue) record.annual_revenue = Number(record.annual_revenue);
      if (record.website) record.website = record.website.replace(/^https?:\/\//, '');
    }

    const missing = config.required.filter(field => !record[field]);
    if (missing.length) throw new Error(`Row ${rowIndex + 2} is missing ${missing.join(', ')}.`);
    return record;
  });

  const handleConfirmImport = async () => {
    setIsImporting(true);
    try {
      const rows = buildRows();
      const chunkSize = 50;
      let importedCount = 0;

      for (let index = 0; index < rows.length; index += chunkSize) {
        const chunk = rows.slice(index, index + chunkSize);
        await config.importRows(chunk);
        importedCount += chunk.length;
        notificationService.notifyInfo(`Imported ${importedCount} of ${rows.length} records.`);
      }

      await activityService.logSystemActivity(`Imported ${importedCount} ${entityType} records via CSV.`);
      notificationService.notifySuccess(`${importedCount} ${entityType} imported successfully.`);
      await onImportComplete?.();
      resetState();
      onClose();
    } catch (error) {
      console.error('CSV import failed:', error);
      notificationService.notifyError(error.message || 'CSV import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white"><SafeIcon icon={FiIcons.FiUploadCloud} className="text-indigo-600" />{config.title}</h2>
            <p className="mt-1 text-xs text-slate-500">{config.description}</p>
          </div>
          <button onClick={handleClose} disabled={isImporting} className="text-slate-400 hover:text-slate-600"><SafeIcon icon={FiIcons.FiX} className="text-xl" /></button>
        </div>
        <div className="p-6">
          {step === 'dropzone' ? (
            <div className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`} onDragOver={event => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={event => { event.preventDefault(); setIsDragging(false); handleFile(event.dataTransfer.files[0]); }} onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} onChange={event => handleFile(event.target.files?.[0])} accept=".csv" className="hidden" />
              <SafeIcon icon={FiIcons.FiFileText} className="mx-auto mb-4 text-4xl text-slate-400" />
              <p className="font-semibold text-slate-700">Click to upload or drag and drop</p>
              <p className="mt-1 text-sm text-slate-500">Quoted commas are supported.</p>
            </div>
          ) : (
            <div className="max-h-[60vh] space-y-4 overflow-y-auto">
              {entityType === 'contacts' && <label className="block text-sm font-semibold text-slate-700">Default classification<select value={defaultContactType} onChange={event => setDefaultContactType(event.target.value)} className="mt-1 w-full rounded-md border-slate-300 text-sm"><option value="B2B_LEAD">B2B business contact</option><option value="B2C_LEAD">B2C consumer contact</option></select></label>}
              <p className="text-sm text-slate-600">Map each CSV column. Required fields must be mapped.</p>
              {csvData.headers.map((header, index) => (
                <div key={`${header}-${index}`} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex-1 overflow-hidden"><p className="truncate text-sm font-bold text-slate-700">{header}</p><p className="truncate text-xs text-slate-500">Example: {csvData.preview[index]}</p></div>
                  <select value={fieldMapping[header] || ''} onChange={event => setFieldMapping({ ...fieldMapping, [header]: event.target.value })} disabled={isImporting} className="flex-1 rounded-md border-slate-300 text-sm">
                    <option value="">-- Ignore --</option>
                    {config.fields.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button onClick={handleClose} disabled={isImporting} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
          {step === 'mapping' && <button onClick={handleConfirmImport} disabled={isImporting} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{isImporting && <SafeIcon icon={FiIcons.FiLoader} className="animate-spin" />}{isImporting ? 'Importing...' : 'Confirm Import'}</button>}
        </div>
      </div>
    </div>
  );
};

export default CsvImportModal;
