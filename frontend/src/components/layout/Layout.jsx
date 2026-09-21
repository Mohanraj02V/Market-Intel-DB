import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, Users, Calendar, Search, Activity, ClipboardList, UserCircle, Mail } from 'lucide-react';
import { logout } from '../../features/auth/authSlice';
import NotificationCenter from './NotificationCenter';

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [];
  
  if (user?.role === 'PRE') {
    navItems.push(
      { path: '/prospects', label: 'Prospects', icon: Users },
      { path: '/key-people', label: 'Key People', icon: UserCircle },
      { path: '/market-events', label: 'Market Events', icon: Calendar },
      { path: '/pre-tasks', label: 'Tasks', icon: ClipboardList }
    );
  }
  
  if (user?.is_superuser) {
    navItems.push(
      { path: '/users', label: 'User Management', icon: Users }
    );
  } else if (user?.role === 'LQ') {
    navItems.push(
      { path: '/lq-pipeline', label: 'Lead Qualifier Pipeline', icon: Activity },
      { path: '/key-people', label: 'Key People', icon: UserCircle }, { path: '/inbox', label: 'Inbox', icon: Mail }
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-black text-indigo-700 tracking-tight">MarketIntel <span className="font-light text-slate-800">DB</span></span>
              </div>
              <nav className="hidden sm:ml-10 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center">
              {user && (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900 flex items-center justify-end gap-2">
                      <span className="font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-xs">
                        {user.role}
                      </span>
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {user.role === 'PRE' ? 'Prospect Research Engineer' : 'Lead Qualifier'}
                    </div>
                  </div>
                  {user.role === 'LQ' && (
                    <div className="ml-2 pl-4 border-l border-slate-200">
                      <NotificationCenter />
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="ml-4 p-2 text-slate-400 hover:text-slate-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
