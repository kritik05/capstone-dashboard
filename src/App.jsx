import React from 'react';
import { BrowserRouter as Router, Routes, Route,Navigate } from 'react-router-dom';
import Findings from './pages/Findings';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { UserProvider } from './UserContext';
import ProtectedRoute from './ProtectedRoute';
import Tickets from './pages/Tickets';
import Runbook from './pages/Runbook';
import RunbookDetailPage from './pages/RunbookDetailPage';
function App() {
  return (
    <Router>
      <UserProvider>
      <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
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
          <Route path="/tickets" element={
          <ProtectedRoute>
          <Tickets />
          </ProtectedRoute>
          } />
           <Route path="/runbook" element={
          <ProtectedRoute>
          <Runbook />
          </ProtectedRoute>
          } />
          <Route path="/runbook/:runbookId" element={<ProtectedRoute><RunbookDetailPage/> </ProtectedRoute>} />
      </Routes>
    </UserProvider>
    </Router>
  );
}

export default App;
