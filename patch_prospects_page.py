import re

filepath = 'frontend/src/pages/ProspectsPage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Get the user role from Redux
if "const { user } = useSelector((state) => state.auth);" not in content:
    content = content.replace("const { items, loading, error, totalPages, count } = useSelector((state) => state.prospects);", "const { items, loading, error, totalPages, count } = useSelector((state) => state.prospects);\n  const { user } = useSelector((state) => state.auth);")

# Hide Add Button
content = content.replace("<button\n            onClick={handleAddClick}", "{user?.role === 'PRE' && (\n          <button\n            onClick={handleAddClick}")
content = content.replace("Add Prospect\n          </button>", "Add Prospect\n          </button>\n          )}")

# Hide Action column entirely for LQ or just the buttons?
# Let's hide the buttons inside the column.
actions_block = """<div className="flex justify-end gap-3 items-center">
                        {user?.role === 'PRE' && (
                          <>
                            <Link to={`/prospects/${prospect.id}`} className="text-emerald-600 hover:text-emerald-900" title="View Details">
                              <Eye size={18} />
                            </Link>
                            <button onClick={() => handleEditClick(prospect)} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(prospect.id)} className="text-red-500 hover:text-red-700" title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                        {user?.role === 'LQ' && (
                          <span className="text-xs text-slate-400 italic">No actions available</span>
                        )}
                        </div>"""

# I need to carefully replace the existing div.flex.justify-end...
# Wait, replacing complex JSX via regex is risky. Let's use a more targeted replace.

content = re.sub(
    r'<div className="flex justify-end gap-3 items-center">.*?</div>',
    actions_block,
    content,
    flags=re.DOTALL
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated ProspectsPage.jsx to hide actions for LQ")
