import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../features/auth/authSlice';
import api from '../services/api';
import LoginPage from '../pages/LoginPage';
import ProspectsPage from '../pages/ProspectsPage';
import MarketEventsPage from '../pages/MarketEventsPage';
import MarketEventDetailPage from '../pages/MarketEventDetailPage';
import InboxPage from '../pages/InboxPage';
import ProspectDetailPage from '../pages/ProspectDetailPage';
import LqPipelinePage from '../pages/LqPipelinePage';
import LqPipelineDetailPage from '../pages/LqPipelineDetailPage';
import KeyPeoplePage from '../pages/KeyPeoplePage';
import KeyPersonDetailPage from '../pages/KeyPersonDetailPage';
import UserManagementPage from '../pages/UserManagementPage';
import PreTasksPage from '../pages/PreTasksPage';

import Layout from '../components/layout/Layout';

const RoleRoute = ({ children, allowedRoles, requireAdmin }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (requireAdmin && !user?.is_superuser) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'LQ') return <Navigate to="/lq-pipeline" replace />;
    return <Navigate to="/prospects" replace />;
  }
  
  return children;
};

const AppRouter = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, accessToken, refreshToken } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated && !user && accessToken) {
        try {
          const response = await api.get('/auth/me/');
          dispatch(loginSuccess({ access: accessToken, refresh: refreshToken, user: response.data }));
        } catch (error) {
          dispatch(logout());
        }
      }
    };
    fetchUser();
  }, [isAuthenticated, user, accessToken, refreshToken, dispatch]);

  // Show a loading screen while user is being fetched to prevent premature redirects
  if (isAuthenticated && !user) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading session...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <RoleRoute allowedRoles={['PRE', 'LQ']}><Layout /></RoleRoute>
        }>
          {/* Default Route redirects to prospects for PRE, lq-pipeline for LQ */}
          <Route index element={
            user?.role === 'LQ' ? <Navigate to="/lq-pipeline" replace /> : <Navigate to="/prospects" replace />
          } />
          
          <Route path="prospects" element={<RoleRoute allowedRoles={['PRE']}><ProspectsPage /></RoleRoute>} />
          <Route path="prospects/:id" element={<RoleRoute allowedRoles={['PRE']}><ProspectDetailPage /></RoleRoute>} />
          <Route path="market-events" element={<RoleRoute allowedRoles={['PRE']}><MarketEventsPage /></RoleRoute>} />
          <Route path="market-events/:id" element={<RoleRoute allowedRoles={['PRE']}><MarketEventDetailPage /></RoleRoute>} />
          <Route path="pre-tasks" element={<RoleRoute allowedRoles={['PRE']}><PreTasksPage /></RoleRoute>} />
          <Route path="key-people" element={<RoleRoute allowedRoles={['PRE', 'LQ']}><KeyPeoplePage /></RoleRoute>} />
          <Route path="key-people/:id" element={<RoleRoute allowedRoles={['PRE', 'LQ']}><KeyPersonDetailPage /></RoleRoute>} />
          <Route path="users" element={<RoleRoute requireAdmin={true}><UserManagementPage /></RoleRoute>} />
          <Route path="lq-pipeline" element={<RoleRoute allowedRoles={['LQ']}><LqPipelinePage /></RoleRoute>} />
          <Route path="lq-pipeline/:id" element={<RoleRoute allowedRoles={['LQ']}><LqPipelineDetailPage /></RoleRoute>} />
          <Route path="inbox" element={<RoleRoute allowedRoles={['LQ']}><InboxPage /></RoleRoute>} />

        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
