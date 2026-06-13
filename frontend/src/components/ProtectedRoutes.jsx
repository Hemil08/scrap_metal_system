import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Route guard component for secure page routing
 * Handles JWT authentication checking and Role-Based Access Control (RBAC)
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // 1. Not Authenticated: Redirect to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role validation failed: Redirect to default safe page (Dashboard)
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.warn(`Access Denied: User role ${user?.role} not in allowed list [${allowedRoles.join(', ')}]`);
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Authorized: Render Page
  return children;
};

export default ProtectedRoute;
