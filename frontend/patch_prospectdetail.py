import os

file_path = 'src/pages/ProspectDetailPage.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Calendar icon import if not there
if "Calendar" not in content:
    content = content.replace(
        "import { ArrowLeft, Building2, Globe, Phone, Mail, Link as LinkIcon, Briefcase, Linkedin } from 'lucide-react';",
        "import { ArrowLeft, Building2, Globe, Phone, Mail, Link as LinkIcon, Briefcase, Linkedin, Calendar, Plus } from 'lucide-react';"
    )
elif "Plus" not in content:
    content = content.replace("Calendar", "Calendar, Plus")

# Format date utility
if "formatDate" not in content:
    content = content.replace(
        "if (loading) {",
        "const formatDate = (dateString) => {\n    if (!dateString) return '';\n    const [year, month, day] = dateString.split('-');\n    return ${day}--;\n  };\n\n  if (loading) {"
    )

# Add Market Events UI section
if "MARKET EVENTS" not in content:
    market_events_ui = """
      {/* Market Events Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Market Events
          </h2>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
        <div className="p-6">
          {prospect.market_events && prospect.market_events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prospect.market_events.map((event, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                  onClick={() => navigate(/market-events/)}
                >
                  <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {event.event_title}
                  </div>
                  <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                    {event.host_country} &middot; {formatDate(event.event_date)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                <Calendar className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 font-medium">No market events associated with this prospect.</p>
            </div>
          )}
        </div>
      </div>
"""
    content = content.replace(
        "      {/* Key Contacts Section */}",
        market_events_ui + "\n      {/* Key Contacts Section */}"
    )

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ProspectDetailPage.jsx")
