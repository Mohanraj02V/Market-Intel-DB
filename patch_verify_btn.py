import re

filepath = 'frontend/src/pages/LqPipelinePage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """                      ) : (
                        <button
                          onClick={() => openWorkspace(item)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <FileEdit className="w-3 h-3" /> Verify
                        </button>
                      )}"""

replacement = """                      ) : (
                        <button
                          onClick={() => openWorkspace(item)}
                          disabled={isIssue}
                          className={`px-3 py-1.5 rounded text-[11px] font-bold transition flex items-center gap-1 ml-auto ${
                            isIssue ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-900 text-white'
                          }`}
                        >
                          <FileEdit className="w-3 h-3" /> Verify
                        </button>
                      )}"""

content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
