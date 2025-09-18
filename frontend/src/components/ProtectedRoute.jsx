import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Get token and user from localStorage
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user'); 

  console.log('ProtectedRoute check - Token:', !!token, 'User:', !!user);

  // If not authenticated, redirect to login
  if (!token || !user) {
    console.log('Redirecting to login...');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children
  return children;
};

export default ProtectedRoute;