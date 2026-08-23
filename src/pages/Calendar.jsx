import React, { useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { notificationService } from '../services/notificationService';

const Calendar = () => {
  const { tasks } = useCrm();

  const today = new Date();

  // Calculate days for the current month
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Create an array for days to render in grid
  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      return new Date(currentYear, currentMonth, dayNumber);
    }
    return null; // Pad with null for empty grid cells
  });

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const getTasksForDate = (date) => {
    if (!date) return [];
    return tasks.filter(t => {
      if (!t.due_date) return false;
      const tDate = new Date(t.due_date);
      return tDate.getFullYear() === date.getFullYear() &&
             tDate.getMonth() === date.getMonth() &&
             tDate.getDate() === date.getDate() &&
             (t.status !== 'DONE' || t.status === 'TODO'); // only open tasks
    });
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
            <SafeIcon icon={FiIcons.FiCalendar} className="text-indigo-600" />
            <span>Global Calendar</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Task Management & Due Dates</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">{monthNames[currentMonth]} {currentYear}</h2>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-200">
            {dayLabels.map(label => (
                <div key={label} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-0 bg-slate-50">
                    {label}
                </div>
            ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[minmax(120px,_1fr)] flex-1">
            {days.map((date, idx) => {
                const isToday = date && date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
                const dayTasks = getTasksForDate(date);

                return (
                    <div key={idx} className={`border-r border-b border-slate-100 last:border-r-0 p-2 overflow-y-auto ${!date ? 'bg-slate-50' : 'bg-white'} ${isToday ? 'ring-2 ring-inset ring-indigo-500 bg-indigo-50/10' : ''}`}>
                        {date && (
                            <div className="flex flex-col h-full">
                                <span className={`text-sm font-semibold mb-2 inline-block w-6 h-6 text-center leading-6 rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>
                                    {date.getDate()}
                                </span>
                                <div className="space-y-1 mt-1">
                                    {dayTasks.map(t => (
                                        <div key={t.id} className="text-[10px] p-1 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate font-medium">
                                            {t.priority === 'HIGH' && <span className="text-rose-500 font-bold mr-1">!</span>}
                                            {t.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
