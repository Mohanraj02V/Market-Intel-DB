import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { createMarketEvent, updateMarketEvent } from '../../features/marketEvents/marketEventSlice';

const MarketEventForm = ({ isOpen, onClose, initialData = null }) => {
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    event_title: '',
    host_country: '',
    start_date: '',
    end_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          event_title: initialData.event_title || '',
          host_country: initialData.host_country || '',
          start_date: initialData.start_date || '',
          end_date: initialData.end_date || '',
        });
      } else {
        setFormData({
          event_title: '',
          host_country: '',
          start_date: '',
    end_date: '',
        });
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (initialData) {
        await dispatch(updateMarketEvent({ id: initialData.id, data: formData })).unwrap();
      } else {
        await dispatch(createMarketEvent(formData)).unwrap();
      }
      onClose();
    } catch (err) {
      let errorMessage = 'An error occurred while saving.';
      
      const formatDrfError = (obj, parentKey = '') => {
        let msgs = [];
        for (const [key, value] of Object.entries(obj)) {
          const readableKey = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          const fullKey = parentKey ? `${parentKey} -> ${readableKey}` : readableKey;
          
          if (Array.isArray(value)) {
            msgs.push(`${fullKey}: ${value.join(' ')}`);
          } else if (typeof value === 'object' && value !== null) {
            msgs = msgs.concat(formatDrfError(value, fullKey));
          } else {
            msgs.push(`${fullKey}: ${value}`);
          }
        }
        return msgs;
      };

      if (err && typeof err === 'object' && !err.message) {
        if (err.detail) {
          errorMessage = err.detail;
        } else {
          const errors = formatDrfError(err);
          errorMessage = errors.join(' | ');
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-full bg-white shadow-xl flex flex-col rounded-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            {initialData ? 'Edit Market Event' : 'Add Market Event'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form id="market-event-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="event_title"
                  required
                  value={formData.event_title}
                  onChange={handleChange}
                  placeholder="e.g. Global Technology Summit 2026"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Host Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="host_country"
                  required
                  value={formData.host_country}
                  onChange={handleChange}
                  placeholder="e.g. United States"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    required
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    required
                    value={formData.end_date}
                    onChange={handleChange}
                    min={formData.start_date}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-sm transition-all"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="market-event-form"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketEventForm;
