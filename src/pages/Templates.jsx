import React, { useState, useEffect } from 'react';
import { emailService } from '../services/emailService';
import { notificationService } from '../services/notificationService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState({ name: '', subject: '', body: '' });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await emailService.getTemplates();
      setTemplates(data || []);
    } catch (err) {
      console.error(err);
      notificationService.notifyError('Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentTemplate.name || !currentTemplate.subject || !currentTemplate.body) {
      notificationService.notifyError('Name, Subject, and Body are required.');
      return;
    }

    try {
      if (currentTemplate.id) {
        await emailService.updateTemplate(currentTemplate.id, {
          name: currentTemplate.name,
          subject: currentTemplate.subject,
          body: currentTemplate.body
        });
        notificationService.notifySuccess('Template updated successfully');
      } else {
        await emailService.createTemplate({
          name: currentTemplate.name,
          subject: currentTemplate.subject,
          body: currentTemplate.body
        });
        notificationService.notifySuccess('Template created successfully');
      }
      setIsEditing(false);
      fetchTemplates();
    } catch (err) {
      console.error(err);
      notificationService.notifyError('Failed to save template');
    }
  };

  const handleEdit = (template) => {
    setCurrentTemplate(template);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentTemplate({ name: '', subject: '', body: '' });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await emailService.deleteTemplate(id);
        notificationService.notifySuccess('Template deleted');
        fetchTemplates();
      } catch (err) {
        console.error(err);
        notificationService.notifyError('Failed to delete template');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">Email Templates</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">Manage standardized outbound communications</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleCreateNew}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiPlus} />
            <span>New Template</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <h2 className="text-xl font-bold dark:text-white">{currentTemplate.id ? 'Edit Template' : 'Create Template'}</h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Template Name</label>
            <input
              type="text"
              value={currentTemplate.name}
              onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
              placeholder="e.g., Follow-up Check-in"
              className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Subject Line</label>
            <input
              type="text"
              value={currentTemplate.subject}
              onChange={(e) => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
              placeholder="Email Subject"
              className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Body</label>
            <textarea
              value={currentTemplate.body}
              onChange={(e) => setCurrentTemplate({ ...currentTemplate, body: e.target.value })}
              placeholder="Email Body..."
              className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white outline-none h-64 resize-y"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all"
            >
              Save Template
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
              <h3 className="font-bold text-lg dark:text-white mb-2">{template.name}</h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-4 truncate"><span className="text-xs text-slate-400">Subject:</span> {template.subject}</p>

              <div className="mt-auto flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                <button
                  onClick={() => handleEdit(template)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit Template"
                >
                  <SafeIcon icon={FiIcons.FiEdit2} />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Template"
                >
                  <SafeIcon icon={FiIcons.FiTrash2} />
                </button>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <SafeIcon icon={FiIcons.FiMail} className="text-4xl mx-auto mb-3 opacity-50" />
              <p>No email templates found.</p>
              <button onClick={handleCreateNew} className="text-indigo-600 font-bold text-sm mt-2 hover:underline">Create your first template</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Templates;
