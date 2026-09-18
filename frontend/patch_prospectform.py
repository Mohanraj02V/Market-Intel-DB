import os

file_path = 'src/components/prospects/ProspectForm.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add market event imports
if "import { fetchMarketEvents }" not in content:
    content = content.replace(
        "import { useDispatch, useSelector } from 'react-redux';",
        "import { useDispatch, useSelector } from 'react-redux';\nimport { fetchMarketEvents } from '../../features/marketEvents/marketEventSlice';"
    )

if "const { items: marketEventsList } = useSelector((state) => state.marketEvents);" not in content:
    content = content.replace(
        "const { items: prospects } = useSelector((state) => state.prospects);",
        "const { items: prospects } = useSelector((state) => state.prospects);\n  const { items: marketEventsList } = useSelector((state) => state.marketEvents);"
    )

if "dispatch(fetchMarketEvents({}));" not in content:
    content = content.replace(
        "setFormData({",
        "dispatch(fetchMarketEvents({}));\n      setFormData({"
    )

# Add market_event_ids to initial states
if "market_event_ids:" not in content:
    content = content.replace(
        "key_contacts: initialData.key_contacts || [],",
        "key_contacts: initialData.key_contacts || [],\n          market_event_ids: initialData.market_events ? initialData.market_events.map(e => e.id) : [],"
    )
    content = content.replace(
        "key_contacts: [],",
        "key_contacts: [],\n          market_event_ids: [],"
    )

# Add event handler for market events
if "handleMarketEventToggle" not in content:
    handler = """
  const handleMarketEventToggle = (eventId) => {
    setFormData(prev => {
      const isSelected = prev.market_event_ids.includes(eventId);
      return {
        ...prev,
        market_event_ids: isSelected 
          ? prev.market_event_ids.filter(id => id !== eventId)
          : [...prev.market_event_ids, eventId]
      };
    });
  };
"""
    content = content.replace("const handleSubmit = async (e) =>", handler + "\n  const handleSubmit = async (e) =>")

# Add Market Events UI section to the form
if "Market Events" not in content:
    ui_section = """
            {/* Market Events Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">ME</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Market Events</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Associate Market Events
                </label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.market_event_ids && formData.market_event_ids.map(id => {
                      const event = marketEventsList.find(e => e.id === id);
                      if (!event) return null;
                      return (
                        <div key={id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                          {event.event_title}
                          <button 
                            type="button" 
                            onClick={() => handleMarketEventToggle(id)}
                            className="hover:text-indigo-900 transition-colors"
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-900"
                    onChange={(e) => {
                      if(e.target.value) handleMarketEventToggle(e.target.value);
                      e.target.value = "";
                    }}
                    value=""
                  >
                    <option value="" disabled>+ Select an event to add...</option>
                    {marketEventsList.filter(e => !(formData.market_event_ids || []).includes(e.id)).map(event => (
                      <option key={event.id} value={event.id}>
                        {event.event_title} ({event.host_country})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
"""
    content = content.replace("            {/* Submit Button */}", ui_section + "\n            {/* Submit Button */}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ProspectForm.jsx")
