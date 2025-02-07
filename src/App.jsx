import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Findings from './pages/Findings';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/finding" element={<Findings />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
