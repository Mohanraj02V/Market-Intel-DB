import os
import re

filepath = 'src/pages/ProspectsPage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Update icons import
content = content.replace(
    "import { Plus, Search, Edit2, Trash2, Building2 } from 'lucide-react';",
    "import { Plus, Search, Edit2, Trash2, Building2, Eye } from 'lucide-react';"
)

# Update the action buttons
old_actions = """                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleEditClick(prospect)} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(prospect.id)} className="text-red-500 hover:text-red-700" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>"""

new_actions = """                        <div className="flex justify-end gap-3 items-center">
                          <Link to={`/prospects/${prospect.id}`} className="text-emerald-600 hover:text-emerald-900" title="View Details">
                            <Eye size={18} />
                          </Link>
                          <button onClick={() => handleEditClick(prospect)} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(prospect.id)} className="text-red-500 hover:text-red-700" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>"""

content = content.replace(old_actions, new_actions)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Eye icon to ProspectsPage.jsx")
