import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMarketEvent, clearSelectedMarketEvent } from '../features/marketEvents/marketEventSlice';
import { ArrowLeft, Calendar, MapPin, Building2, Globe } from 'lucide-react';

const MarketEventDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedMarketEvent: event, loading, error } = useSelector((state) => state.marketEvents);

  useEffect(() => {
    dispatch(fetchMarketEvent(id));
    return () => {
      dispatch(clearSelectedMarketEvent());
    };
  }, [dispatch, id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 font-medium">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500 font-medium">Error loading event. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back button */}
      <button 
        onClick={() => navigate('/market-events')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Market Events
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100">
                <Calendar className="w-3.5 h-3.5" />
                Market Event
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{event.event_title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {event.host_country}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {formatDate(event.event_date)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {event.participating_companies_count} Participating Companies
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participating Companies Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Participating Companies
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {event.participating_companies && event.participating_companies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Company Name</th>
                    <th className="px-6 py-4">Country</th>
                    <th className="px-6 py-4">Structure</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Primary Industry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {event.participating_companies.map((company) => (
                    <tr 
                      key={company.id} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/prospects/${company.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold">
                            {company.company_name.charAt(0)}
                          </div>
                          <div className="font-medium text-slate-900 truncate max-w-xs">
                            {company.company_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Globe className="w-4 h-4 text-slate-400" />
                          {company.country_head_office}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {company.company_structure}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          company.operational_status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : company.operational_status === 'Inactive'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {company.operational_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
                        {company.primary_industries}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                <Building2 className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">No participating companies</h3>
              <p className="text-sm text-slate-500">
                No prospects are currently associated with this event.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketEventDetailPage;
