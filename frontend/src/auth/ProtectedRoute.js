import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // Check if user is authenticated
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role (if role is specified)
  if (role && user.role !== role) {
    // Redirect to their own dashboard based on role
    switch (user.role) {
      case 'citizen':
        return <Navigate to="/citizen" replace />;
      case 'rescue':
        return <Navigate to="/rescue" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Render children if authenticated and authorized
  return children;
};

export default ProtectedRoute;
