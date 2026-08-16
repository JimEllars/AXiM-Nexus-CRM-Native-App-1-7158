import React, { useState } from 'react';
import { notificationService } from '../../services/notificationService';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const SmsComposerModal = ({ isOpen, onClose, contact, onSend }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!message.trim()) {
      notificationService.notifyError('Message body cannot be empty.');
      return;
    }

    if (!contact.phone) {
      notificationService.notifyError('Contact does not have a valid phone number.');
      return;
    }

    setIsSending(true);
    try {
      await onSend(contact.phone, message);
      setMessage('');
      onClose();
    } catch (err) {
      console.error('Failed to send SMS:', err);
      // Let onSend handle error notification or handle here
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <SafeIcon icon={FiIcons.FiMessageSquare} className="text-indigo-600" />
            <span>Compose SMS</span>
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-200">
            <SafeIcon icon={FiIcons.FiX} className="text-xl" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">To</label>
            <input
              type="text"
              value={contact.phone || 'No Phone Number'}
              disabled
              className="w-full text-sm border border-slate-200 bg-slate-100 text-slate-500 rounded-lg p-2.5 outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Message</label>
              <span className={`text-xs font-bold ${message.length > 160 ? 'text-rose-500' : 'text-slate-400'}`}>
                {message.length} / 160
              </span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-32 resize-none"
              placeholder="Type your SMS message here..."
            />
            {message.length > 160 && (
              <p className="text-xs text-rose-500 mt-1 font-semibold">Message exceeds 160 characters and may be split into multiple parts.</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            disabled={isSending}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center space-x-2 ${isSending ? 'bg-indigo-400 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            <SafeIcon icon={FiIcons.FiSend} /><span>{isSending ? 'Sending...' : 'Send SMS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmsComposerModal;
