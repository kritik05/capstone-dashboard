import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Findings from './pages/Findings';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { UserProvider } from './UserContext';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <Router>
      <UserProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/finding" element={
          <ProtectedRoute>
          <Findings />
          </ProtectedRoute>
          } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
          <Dashboard />
          </ProtectedRoute>
          } />
      </Routes>
    </UserProvider>
    </Router>
  );
}

export default App;
