import os

with open('src/pages/ProspectsPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_select = """            <select
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
            </select>"""

new_select = """            <select
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
            </select>"""

content = content.replace(old_select, new_select)

with open('src/pages/ProspectsPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/components/prospects/ProspectForm.jsx', 'r', encoding='utf-8') as f:
    form_content = f.read()

old_form_select = """                  <option value="" disabled>+ Select an event to add...</option>
                  {marketEventsList && marketEventsList.filter(e => !(formData.market_event_ids || []).includes(e.id)).map(event => ("""

new_form_select = """                  <option value="" disabled>+ Select an event to add...</option>
                  {(!marketEventsList || marketEventsList.length === 0) && (
                    <option value="none" disabled>No events created yet</option>
                  )}
                  {marketEventsList && marketEventsList.filter(e => !(formData.market_event_ids || []).includes(e.id)).map(event => ("""

form_content = form_content.replace(old_form_select, new_form_select)

with open('src/components/prospects/ProspectForm.jsx', 'w', encoding='utf-8') as f:
    f.write(form_content)

print("Fixed both files!")
