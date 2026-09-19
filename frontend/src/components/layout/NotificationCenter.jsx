import React, { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, CheckCircle, X } from 'lucide-react';
import api from '../../services/api';

export default function NotificationCenter() {
  const [reminders, setReminders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeToasts, setActiveToasts] = useState([]);

  useEffect(() => {
    fetchReminders();
    const intervalId = setInterval(fetchReminders, 30000); // Check every 30 seconds
    return () => clearInterval(intervalId);
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await api.get('/reminders/pending/');
      const data = res.data;
      setReminders(data);
      checkNotifications(data);
    } catch (err) {
      console.error("Failed to fetch reminders", err);
    }
  };

  const checkNotifications = (currentReminders) => {
    const now = new Date();
    
    currentReminders.forEach(reminder => {
      const scheduledTime = new Date(reminder.scheduled_datetime);
      const diffMs = scheduledTime - now;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins >= 0) {
        if (diffMins <= 5 && !reminder.notified_5m) {
          triggerToast(reminder, '5m', `Call ${reminder.company_name} in 5 mins!`);
        } else if (diffMins <= 15 && diffMins > 5 && !reminder.notified_15m) {
          triggerToast(reminder, '15m', `Call ${reminder.company_name} in 15 mins!`);
        } else if (diffMins <= 30 && diffMins > 15 && !reminder.notified_30m) {
          triggerToast(reminder, '30m', `Call ${reminder.company_name} in 30 mins.`);
        }
      }
    });
  };

  const triggerToast = async (reminder, interval, message) => {
    const newToast = {
      id: `${reminder.id}-${interval}`,
      reminder,
      message,
      time: new Date().toLocaleTimeString()
    };
    
    setActiveToasts(prev => [...prev, newToast]);
    
    // Mark as notified in backend
    try {
      await api.patch(`/reminders/${reminder.id}/mark-notified/`, { interval });
      // We don't necessarily need to fetch again immediately since we just patched,
      // but it will be updated on next poll.
    } catch (err) {
      console.error("Failed to mark notification", err);
    }
    
    // Auto remove toast after 10 seconds
    setTimeout(() => {
      removeToast(newToast.id);
    }, 10000);
  };

  const removeToast = (id) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };
  
  // Format datetime
  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {reminders.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Scheduled Callbacks</h3>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full">{reminders.length} Pending</span>
            </div>
            <div className="max-h-96 overflow-y-auto p-2 space-y-2">
              {reminders.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs italic">
                  No upcoming callbacks scheduled.
                </div>
              ) : (
                reminders.map(r => (
                  <div key={r.id} className="p-3 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-bold text-slate-700">{formatTime(r.scheduled_datetime)}</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 truncate">{r.company_name}</h4>
                    {r.description && <p className="text-xs text-slate-500 mt-1 truncate">{r.description}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {activeToasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto bg-white border-l-4 border-amber-500 rounded-lg shadow-2xl p-4 w-72 transform transition-all flex items-start gap-3">
            <div className="bg-amber-100 text-amber-700 rounded-full p-2 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-extrabold text-slate-900">Upcoming Callback!</h4>
              <p className="text-xs text-slate-600 font-medium mt-0.5">{toast.message}</p>
              <div className="text-[10px] text-slate-400 mt-1">{toast.time}</div>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
