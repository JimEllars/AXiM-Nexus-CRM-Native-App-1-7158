import React, { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { accountService } from '../../services/accountService';
import { notificationService } from '../../services/notificationService';

const emptyAccount = {
  company_name: '',
  website: '',
  industry: '',
  employee_count: '',
  annual_revenue: ''
};

const CreateAccountModal = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState(emptyAccount);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        company_name: formData.company_name.trim(),
        website: formData.website.trim().replace(/^https?:\/\//, ''),
        industry: formData.industry.trim() || null,
        employee_count: formData.employee_count ? Number(formData.employee_count) : null,
        annual_revenue: formData.annual_revenue ? Number(formData.annual_revenue) : null
      };
      const account = await accountService.create(payload);

      notificationService.notifySuccess('Business account created.');
      setFormData(emptyAccount);
      await onCreated?.(account);
      onClose();
    } catch (error) {
      console.error('Failed to create account:', error);
      notificationService.notifyError('Unable to create the business account.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Create Business Account</h2>
            <p className="mt-1 text-xs text-slate-500">B2B company record</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <SafeIcon icon={FiIcons.FiX} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Company Name</label>
            <input required value={formData.company_name} onChange={event => setFormData({ ...formData, company_name: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Website</label>
              <input value={formData.website} onChange={event => setFormData({ ...formData, website: event.target.value })} placeholder="example.com" className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Industry</label>
              <input value={formData.industry} onChange={event => setFormData({ ...formData, industry: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Employees</label>
              <input min="0" type="number" value={formData.employee_count} onChange={event => setFormData({ ...formData, employee_count: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Annual Revenue</label>
              <input min="0" type="number" value={formData.annual_revenue} onChange={event => setFormData({ ...formData, annual_revenue: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 rounded-lg px-4 py-2.5 font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex flex-1 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
              {isSaving ? <SafeIcon icon={FiIcons.FiRefreshCw} className="animate-spin" /> : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountModal;
