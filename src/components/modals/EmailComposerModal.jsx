import React, { useState, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import { emailService } from '../../services/emailService';
import { notificationService } from '../../services/notificationService';
import { activityService } from '../../services/activityService';
import SafeIcon from '../../common/SafeIcon';

const EmailComposerModal = ({ isOpen, onClose, contact, logSystemActivity }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templates, setTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubject('');
      setBody('');
      setCc('');
      setBcc('');
      setShowAdvanced(false);
      setSelectedTemplate('');
      setIsSending(false);
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const data = await emailService.getTemplates();
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Suppress error in UI since templates are optional
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  if (!isOpen || !contact) return null;

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);

    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSubject(template.subject);
        setBody(template.body);
      }
    } else {
      setSubject('');
      setBody('');
    }
  };

  const handleSend = async () => {
    if (!subject || !body) {
      notificationService.notifyError('Subject and message are required.');
      return;
    }

    setIsSending(true);
    try {
      // Use the email field from the contact, defaulting to a mock if missing
      const toEmail = contact.email || 'mock@example.com';
      await emailService.sendTransactionalEmail(toEmail, subject, body);

      // Attempt to log via local passed function if provided, else use activityService directly
      if (logSystemActivity) {
        await logSystemActivity(
          `Operator sent email to ${contact.first_name || ''} ${contact.last_name || ''}. Subject: ${subject}`,
          'EMAIL_SENT',
          { contact_id: contact.id, entity_id: contact.id }
        );
      } else {
        await activityService.logActivity({
          type: 'EMAIL_SENT',
          description: `Operator sent email to ${contact.first_name || ''} ${contact.last_name || ''}. Subject: ${subject}`,
          entity_id: contact.id,
          contact_id: contact.id,
          metadata: { to: toEmail, subject }
        });
      }

      notificationService.notifySuccess('Email dispatched successfully.');
      onClose();
    } catch (err) {
      console.error(err);
      notificationService.notifyError('Failed to send email. Check connection.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <SafeIcon icon={FiIcons.FiMail} className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Compose Email</h2>
              <p className="text-xs font-medium text-slate-500">Send an email to {contact.first_name} {contact.last_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <SafeIcon icon={FiIcons.FiX} className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">

          {/* To Field (Read Only) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">To</label>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-indigo-600 font-medium hover:underline"
              >
                {showAdvanced ? 'Hide CC/BCC' : 'Cc / Bcc'}
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={contact.email || 'No email available'}
              className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* Advanced Fields (CC/BCC) */}
          {showAdvanced && (
            <div className="grid grid-cols-2 gap-4 pt-1 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Cc</label>
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  disabled={isSending}
                  placeholder="cc@example.com"
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bcc</label>
                <input
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  disabled={isSending}
                  placeholder="bcc@example.com"
                  className="w-full text-sm border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Quick Templates */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Quick Templates</label>
            <select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              disabled={isSending || isLoadingTemplates}
              className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
            >
              <option value="">{isLoadingTemplates ? 'Loading templates...' : 'Select a template...'}</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
              placeholder="Email subject line"
              className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isSending}
              placeholder="Type your message here..."
              className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-48 resize-none transition-all"
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSending}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center space-x-2 ${
              isSending
                ? 'bg-indigo-400 text-white cursor-wait'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg'
            }`}
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <SafeIcon icon={FiIcons.FiSend} />
                <span>Send Email</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmailComposerModal;
