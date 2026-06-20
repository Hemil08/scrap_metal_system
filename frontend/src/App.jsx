import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import ScrapManagement from './pages/ScrapManagement';
import Inventory from './pages/Inventory';
import AIClassification from './pages/AIClassification';


const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

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


      
    </Routes>
  )
}

export default App