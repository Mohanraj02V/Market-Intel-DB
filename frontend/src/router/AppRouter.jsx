import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from '../pages/LoginPage';
import ProspectsPage from '../pages/ProspectsPage';
import MarketEventsPage from '../pages/MarketEventsPage';
import MarketEventDetailPage from '../pages/MarketEventDetailPage';
import ProspectDetailPage from '../pages/ProspectDetailPage';
import Layout from '../components/layout/Layout';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/prospects" replace />} />
          <Route path="prospects" element={<ProspectsPage />} />
          <Route path="prospects/:id" element={<ProspectDetailPage />} />
          <Route path="market-events" element={<MarketEventsPage />} />
          <Route path="market-events/:id" element={<MarketEventDetailPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
