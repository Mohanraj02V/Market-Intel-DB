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
                  {formatDate(event.start_date)} - {formatDate(event.end_date)}
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
    </div>
  );
};

export default MarketEventDetailPage;
