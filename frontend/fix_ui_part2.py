import os

with open('src/pages/ProspectsPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
if "fetchMarketEvents" not in content:
    content = content.replace(
        "import { fetchProspects, deleteProspect } from '../features/prospects/prospectSlice';",
        "import { fetchProspects, deleteProspect } from '../features/prospects/prospectSlice';\nimport { fetchMarketEvents } from '../features/marketEvents/marketEventSlice';"
    )

# 2. State & Hooks
old_state = """  const { items, loading, error, count, next, previous } = useSelector((state) => state.prospects);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = {
      page: page,
      search: searchTerm,
    };
    dispatch(fetchProspects(params));
  }, [dispatch, page, searchTerm]);"""

new_state = """  const { items, loading, error, count, next, previous } = useSelector((state) => state.prospects);
  const { items: marketEventsList } = useSelector((state) => state.marketEvents);
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
  }, [dispatch, page, searchTerm, marketEventFilter]);"""

content = content.replace(old_state, new_state)

# 3. Filter UI and Contextual Banner
old_search_ui = """        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 max-w-sm relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              placeholder="Search companies, countries, industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          <div className="text-sm text-slate-500 font-medium">
            Total Records: {count}
          </div>
        </div>"""

new_search_ui = """        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        )}"""

content = content.replace(old_search_ui, new_search_ui)

with open('src/pages/ProspectsPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed ProspectsPage.jsx")
