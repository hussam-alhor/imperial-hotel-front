import React from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // أو spinner
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default App;
