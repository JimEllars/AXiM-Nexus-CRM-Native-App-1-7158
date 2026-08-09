import React, { useState, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import { emailService } from '../../services/emailService';
import { notificationService } from '../../services/notificationService';
import { activityService } from '../../services/activityService';
import SafeIcon from '../../common/SafeIcon';

const templates = {
  "Standard Introduction": {
    subject: "Introduction: AXiM Services",
    body: "Hi there,\n\nI'd like to introduce myself and AXiM Services. We specialize in providing comprehensive solutions tailored to your business needs.\n\nCould we schedule a brief call next week to discuss how we might assist you?\n\nBest regards,\n[Your Name]"
  },
  "Follow-up Check-in": {
    subject: "Following up on our last conversation",
    body: "Hello,\n\nI hope you're doing well.\n\nI'm following up on our previous conversation to see if you had any further questions or if there's anything else I can help with.\n\nLooking forward to hearing from you.\n\nBest,\n[Your Name]"
  }
};

const EmailComposerModal = ({ isOpen, onClose, contact, logSystemActivity }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Reset form when modal opens with new contact
  useEffect(() => {
    if (isOpen) {
      setSubject('');
      setBody('');
      setSelectedTemplate('');
      setIsSending(false);
    }
  }, [isOpen]);

  if (!isOpen || !contact) return null;

  const handleTemplateChange = (e) => {
    const templateName = e.target.value;
    setSelectedTemplate(templateName);
    if (templates[templateName]) {
      setSubject(templates[templateName].subject);
      setBody(templates[templateName].body);
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">To</label>
            <input
              type="text"
              readOnly
              value={contact.email || 'No email available'}
              className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-500 cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* Quick Templates */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Quick Templates</label>
            <select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              disabled={isSending}
              className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
            >
              <option value="">Select a template...</option>
              {Object.keys(templates).map(name => (
                <option key={name} value={name}>{name}</option>
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
