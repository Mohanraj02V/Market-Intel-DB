import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, Plus, MapPin, Eye, Edit2, Trash2 } from 'lucide-react';
import { fetchMarketEvents, deleteMarketEvent, setSearch } from '../features/marketEvents/marketEventSlice';
import MarketEventForm from '../components/marketEvents/MarketEventForm';

const MarketEventsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { items: events, loading, error, search } = useSelector((state) => state.marketEvents);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    dispatch(fetchMarketEvents({ search }));
  }, [dispatch, search]);

  const handleSearch = (e) => {
    dispatch(setSearch(e.target.value));
  };

  const handleAdd = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (event, e) => {
    e.stopPropagation();
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this market event?\n\nAssociated event participation links will also be removed.")) {
      await dispatch(deleteMarketEvent(id));
      dispatch(fetchMarketEvents({ search }));
    }
  };

  // Utility to format date correctly (prevent timezone issues)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Market Events
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 max-w-xl">
            Track industry events and the prospects participating in each event.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Add Market Event
        </button>
      </div>

      {/* Filters/Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder:text-slate-400"
            placeholder="Search by event title or country..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Event Title</th>
                <th className="px-6 py-4">Host Country</th>
                <th className="px-6 py-4">Event Date</th>
                <th className="px-6 py-4">Participating Companies</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading && events?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    Loading events...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-red-500">
                    Error loading events. Please try again.
                  </td>
                </tr>
              ) : events?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                      <Calendar className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">No market events found</h3>
                    <p className="text-sm text-slate-500">
                      {search ? "Try adjusting your search query." : "Get started by adding a new market event."}
                    </p>
                  </td>
                </tr>
              ) : (
                (events || []).map((event) => (
                  <tr 
                    key={event.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/market-events/${event.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 truncate max-w-md">
                        {event.event_title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {event.host_country}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(event.event_date)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {event.participating_companies_count} Companies
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/market-events/${event.id}`); }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleEdit(event, e)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(event.id, e)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MarketEventForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingEvent}
      />
    </div>
  );
};

export default MarketEventsPage;
