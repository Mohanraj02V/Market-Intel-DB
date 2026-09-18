import os

file_path = 'src/components/layout/Layout.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "Calendar" not in content:
    content = content.replace(
        "import { LogOut, User } from 'lucide-react';",
        "import { LogOut, User, Building2, Calendar } from 'lucide-react';\nimport { Link, useLocation } from 'react-router-dom';"
    )
    
    content = content.replace(
        "const user = useSelector((state) => state.auth.user);",
        "const user = useSelector((state) => state.auth.user);\n  const location = useLocation();"
    )
    
    nav_links = """
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-700 mr-8">MarketIntel DB</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/prospects"
                  className={inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium }
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Prospects
                </Link>
                <Link
                  to="/market-events"
                  className={inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium }
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Market Events
                </Link>
              </div>
            </div>
"""
    
    content = content.replace(
        """            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-700">MarketIntel DB</h1>
              </div>
            </div>""",
        nav_links
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated Layout.jsx")
