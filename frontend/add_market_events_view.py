import os

filepath = 'src/pages/ProspectDetailPage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix imports
content = content.replace(
    "import { ArrowLeft, Building2, Globe, Mail, Phone, MapPin, Network, Package, Users } from 'lucide-react';",
    "import { ArrowLeft, Building2, Globe, Mail, Phone, MapPin, Network, Package, Users, Calendar } from 'lucide-react';"
)

# Add Market Events block
old_block = """          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <Users size={20} className="text-indigo-500" /> Key Contacts
              </h3>
            </div>"""

new_block = """          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <Calendar size={20} className="text-indigo-500" /> Market Events
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {p.market_events && p.market_events.length > 0 ? (
                p.market_events.map((event, i) => (
                  <div key={i} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 transition-colors group">
                    <Link to={`/market-events/${event.id}`} className="block">
                      <div className="font-medium text-sm text-indigo-900 group-hover:text-indigo-700">{event.event_title}</div>
                      <div className="text-xs text-indigo-600/80 mt-1 flex items-center gap-2">
                        <MapPin size={12} /> {event.host_country}
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 italic">No associated market events.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                <Users size={20} className="text-indigo-500" /> Key Contacts
              </h3>
            </div>"""

content = content.replace(old_block, new_block)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Market Events to Prospect Detailed View")
