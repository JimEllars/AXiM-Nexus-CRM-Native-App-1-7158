import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { taskService } from '../../services/taskService';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { notificationService } from '../../services/notificationService';

const TaskDrawer = ({ isOpen, onClose }) => {
  const { tasks, logSystemActivity, refreshData, session } = useCrm();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTasks = tasks.filter(t => t.status !== 'DONE' || t.status === 'TODO'); // Or map as needed

  const handleCreateTask = async (e) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      setIsSubmitting(true);
      try {
        const task = await taskService.createTask(newTaskTitle.trim());
        await logSystemActivity(
          `Operator created a manual task: ${newTaskTitle.trim().substring(0, 30)}...`,
          'SYSTEM_EVENT'
        );
        setNewTaskTitle('');
        await refreshData();
        notificationService.notifySuccess('Task created successfully.');
      } catch (error) {
        console.error('Error creating task:', error);
        notificationService.notifyError('Failed to create task.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleToggleCompletion = async (id, currentStatus) => {
    try {
      const isCompleted = currentStatus === 'TODO';
      await taskService.toggleTaskCompletion(id, isCompleted);
      await refreshData();
    } catch (error) {
      console.error('Error toggling task:', error);
      notificationService.notifyError('Failed to update task.');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      await refreshData();
      notificationService.notifySuccess('Task deleted.');
    } catch (error) {
      console.error('Error deleting task:', error);
      notificationService.notifyError('Failed to delete task.');
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
      )}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <SafeIcon icon={FiIcons.FiCheckSquare} className="text-indigo-600" />
            <span>Task Drawer</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <SafeIcon icon={FiIcons.FiX} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 bg-white">
          <input
            type="text"
            placeholder="Add a new task... (Press Enter)"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleCreateTask}
            disabled={isSubmitting}
            className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50">
          {tasks.map(task => (
            <div key={task.id} className="group flex items-start space-x-3 bg-white p-3 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors shadow-sm">
              <button
                onClick={() => handleToggleCompletion(task.id, task.status)}
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'DONE' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-500'}`}
              >
                {task.status === 'DONE' && <SafeIcon icon={FiIcons.FiCheck} className="text-xs" />}
              </button>
              <div className="flex-1">
                <p className={`text-sm ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                  {task.title}
                </p>
                {task.type && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-slate-100 text-slate-500 mt-1 inline-block">
                        {task.type.replace('_', ' ')}
                    </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-1"
              >
                <SafeIcon icon={FiIcons.FiTrash2} className="text-sm" />
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
             <div className="text-center p-6 text-slate-400 text-sm italic">No tasks found.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default TaskDrawer;
