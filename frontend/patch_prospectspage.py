import os

file_path = 'src/pages/ProspectsPage.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add fetchMarketEvents import
if "import { fetchMarketEvents }" not in content:
    content = content.replace(
        "import { fetchProspects, setFilters, setSearch, setPage, deleteProspect } from '../features/prospects/prospectSlice';",
        "import { fetchProspects, setFilters, setSearch, setPage, deleteProspect } from '../features/prospects/prospectSlice';\nimport { fetchMarketEvents } from '../features/marketEvents/marketEventSlice';"
    )

# Add marketEvents state
if "const { items: marketEventsList } = useSelector((state) => state.marketEvents);" not in content:
    content = content.replace(
        "const { items: prospects, loading, error, filters, search, pagination } = useSelector((state) => state.prospects);",
        "const { items: prospects, loading, error, filters, search, pagination } = useSelector((state) => state.prospects);\n  const { items: marketEventsList } = useSelector((state) => state.marketEvents);"
    )

# Add useEffect for market events
if "dispatch(fetchMarketEvents({}));" not in content:
    content = content.replace(
        "dispatch(fetchProspects({ page: 1, search, ...filters }));",
        "dispatch(fetchProspects({ page: 1, search, ...filters }));\n    dispatch(fetchMarketEvents({}));"
    )

# Add Market Event filter UI
if "name=\"market_event\"" not in content:
    filter_ui = """
          <select
            name="market_event"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            value={filters.market_event || ''}
            onChange={handleFilterChange}
          >
            <option value="">All Market Events</option>
            {marketEventsList.map(event => (
              <option key={event.id} value={event.id}>{event.event_title}</option>
            ))}
          </select>
          """
    content = content.replace(
        '<option value="">All Primary Offerings</option>\n            <option value="Product">Product</option>\n            <option value="Service">Service</option>\n            <option value="Solution">Solution</option>\n            <option value="Multiple">Multiple</option>\n          </select>',
        '<option value="">All Primary Offerings</option>\n            <option value="Product">Product</option>\n            <option value="Service">Service</option>\n            <option value="Solution">Solution</option>\n            <option value="Multiple">Multiple</option>\n          </select>' + filter_ui
    )

# Add Contextual Indicator
if "Participating in:" not in content:
    contextual_indicator = """
      {filters.market_event && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-indigo-900">Participating in:</h3>
            <p className="text-lg font-bold text-indigo-700">
              {marketEventsList.find(e => e.id === filters.market_event)?.event_title || 'Selected Event'}
            </p>
            <p className="text-xs text-indigo-600 mt-1">{pagination.count} participating companies</p>
          </div>
          <button 
            onClick={() => handleFilterChange({ target: { name: 'market_event', value: '' } })}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-md border border-indigo-200 shadow-sm transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}
      """
    content = content.replace(
        "      {/* Main Content */}",
        contextual_indicator + "\n      {/* Main Content */}"
    )

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ProspectsPage.jsx")
