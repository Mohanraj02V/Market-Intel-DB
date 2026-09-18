import os

file_path = 'src/components/layout/Layout.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

bad_str = """className={inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium 
                    location.pathname.startsWith('/prospects')
                      ? 'border-indigo-500 text-slate-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }"""
good_str = """className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname.startsWith('/prospects')
                      ? 'border-indigo-500 text-slate-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}"""

bad_str2 = """className={inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium 
                    location.pathname.startsWith('/market-events')
                      ? 'border-indigo-500 text-slate-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }"""
good_str2 = """className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname.startsWith('/market-events')
                      ? 'border-indigo-500 text-slate-900'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}"""

content = content.replace(bad_str, good_str)
content = content.replace(bad_str2, good_str2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed Layout.jsx")
