import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user'); 

  console.log('ProtectedRoute check - Token:', !!token, 'User:', !!user);
  if (!token || !user) {
    console.log('Redirecting to login...');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export default ProtectedRoute;