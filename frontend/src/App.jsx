import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';

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

      
      
    </Routes>
  )
}

export default App