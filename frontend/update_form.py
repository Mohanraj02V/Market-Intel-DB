import re

filepath = 'src/components/marketEvents/MarketEventForm.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update formData initial state
content = content.replace("event_date: ''", "start_date: '',\n    end_date: ''")

# 2. Update initialData loading
content = content.replace(
    "event_date: initialData.event_date || ''", 
    "start_date: initialData.start_date || '',\n          end_date: initialData.end_date || ''"
)

# 3. Replace the single date input with two side-by-side inputs
old_input = """              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="event_date"
                  required
                  value={formData.event_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-900"
                />
              </div>"""

new_input = """              <div className="grid grid-cols-2 gap-4">
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
              </div>"""

content = content.replace(old_input, new_input)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated MarketEventForm.jsx")
