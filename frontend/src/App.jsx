import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoutes';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScrapManagement from './pages/ScrapManagement';
import Inventory from './pages/Inventory';
import AIClassification from './pages/AIClassification';
import WorkflowTracking from './pages/WorkflowTracking';
import SalesManagement from './pages/SalesManagement'
import UserManagement from './pages/UserManagement';


const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes with DashboardLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Worker']}>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/scrap"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Worker']}>
            <DashboardLayout>
              <ScrapManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Worker']}>
            <DashboardLayout>
              <Inventory />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai-classification"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Worker']}>
            <DashboardLayout>
              <AIClassification />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/workflow"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Worker']}>
            <DashboardLayout>
              <WorkflowTracking />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
            <DashboardLayout>
              <SalesManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      
    </Routes>
  )
}

export default App