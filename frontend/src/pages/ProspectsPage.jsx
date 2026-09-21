import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProspects, deleteProspect } from '../features/prospects/prospectSlice';
import { fetchMarketEvents } from '../features/marketEvents/marketEventSlice';
import ProspectForm from '../components/prospects/ProspectForm';
import { Plus, Search, Edit2, Trash2, Building2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProspectsPage = () => {
  const dispatch = useDispatch();
  const { items, loading, error, count, next, previous } = useSelector((state) => state.prospects);
  const { items: marketEventsList } = useSelector((state) => state.marketEvents);
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [marketEventFilter, setMarketEventFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchMarketEvents({}));
  }, [dispatch]);

  useEffect(() => {
    const params = {
      page: page,
      search: searchTerm,
    };
    if (marketEventFilter) {
      params.market_event = marketEventFilter;
    }
    dispatch(fetchProspects(params));
  }, [dispatch, page, searchTerm, marketEventFilter]);

  const handleAddClick = () => {
    setEditingProspect(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (prospect) => {
    setEditingProspect(prospect);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this prospect?')) {
      dispatch(deleteProspect(id));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600" />
            Prospects
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your market intelligence prospects, corporate structures, and key contacts.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {user?.role === 'PRE' && (
          <button
            onClick={handleAddClick}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Prospect
          </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-1 max-w-2xl gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            
            <select
              className="w-64 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              value={marketEventFilter}
              onChange={(e) => {
                setMarketEventFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Market Events</option>
              {(!marketEventsList || marketEventsList.length === 0) && (
                <option value="none" disabled>No events created yet</option>
              )}
              {marketEventsList && marketEventsList.map(event => (
                <option key={event.id} value={event.id}>{event.event_title}</option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-slate-500 font-medium">
            Total Records: {count}
          </div>
        </div>
        
        {marketEventFilter && (
          <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-sm text-indigo-900">
                Showing prospects participating in: <span className="font-bold">{marketEventsList?.find(e => e.id === marketEventFilter)?.event_title}</span>
              </span>
            </div>
            <button 
              onClick={() => {
                setMarketEventFilter('');
                setPage(1);
              }}
              className="text-xs font-semibold text-indigo-700 bg-white px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              Clear Filter
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prospect Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Country</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Structure</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Industry</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 animate-ping"></div>
                      Loading prospects...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No prospects found.
                  </td>
                </tr>
              ) : (
                items.map((prospect) => (
                  <tr key={prospect.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link to={`/prospects/${prospect.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                          {prospect.company_name}
                        </Link>
                        {prospect.qualification_status === 'Lead Qualified' && (
                          <CheckCircle className="w-4 h-4 text-emerald-500" title="Lead Qualified" />
                        )}
                        {prospect.qualification_status === 'Budget Frozen' && (
                          <XCircle className="w-4 h-4 text-red-500" title="Budget Frozen" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{prospect.country_head_office}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {prospect.company_structure}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        prospect.operational_status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                        prospect.operational_status === 'Inactive' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {prospect.operational_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{prospect.primary_industries}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3 items-center">
                        {user?.role === 'PRE' && (
                          <>
                            <Link to={`/prospects/${prospect.id}`} className="text-emerald-600 hover:text-emerald-900" title="View Details">
                              <Eye size={18} />
                            </Link>
                            <button onClick={() => handleEditClick(prospect)} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(prospect.id)} className="text-red-500 hover:text-red-700" title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                        {user?.role === 'LQ' && (
                          <span className="text-xs text-slate-400 italic">No actions available</span>
                        )}
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-700">
            Showing page <span className="font-medium">{page}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!previous}
              className="px-3 py-1 border border-slate-300 rounded-md bg-white text-slate-700 text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!next}
              className="px-3 py-1 border border-slate-300 rounded-md bg-white text-slate-700 text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ProspectForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        prospect={editingProspect} 
      />
    </div>
  );
};

export default ProspectsPage;
