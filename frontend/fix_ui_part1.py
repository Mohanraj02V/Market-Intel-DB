import os

# 1. FIX PROSPECT FORM
with open('src/components/prospects/ProspectForm.jsx', 'r', encoding='utf-8') as f:
    form_content = f.read()

ui_section = """
          {/* Section 4: Market Events */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 font-bold">
                ME
              </div>
              <h3 className="text-lg font-medium text-slate-800">Market Events</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Associate Market Events
              </label>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.market_event_ids && formData.market_event_ids.map(id => {
                    const event = marketEventsList?.find(e => e.id === id);
                    if (!event) return null;
                    return (
                      <div key={id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
                        {event.event_title}
                        <button 
                          type="button" 
                          onClick={() => handleMarketEventToggle(id)}
                          className="hover:text-indigo-900 transition-colors ml-1 font-bold"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                <select 
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border bg-white text-slate-900"
                  onChange={(e) => {
                    if(e.target.value) handleMarketEventToggle(e.target.value);
                    e.target.value = "";
                  }}
                  value=""
                >
                  <option value="" disabled>+ Select an event to add...</option>
                  {marketEventsList && marketEventsList.filter(e => !(formData.market_event_ids || []).includes(e.id)).map(event => (
                    <option key={event.id} value={event.id}>
                      {event.event_title} ({event.host_country})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
"""

if "Section 4: Market Events" not in form_content:
    form_content = form_content.replace("{/* Section 4: Key Contacts */}", ui_section + "\n          {/* Section 5: Key Contacts */}")
    
with open('src/components/prospects/ProspectForm.jsx', 'w', encoding='utf-8') as f:
    f.write(form_content)

print("Fixed ProspectForm.jsx")
