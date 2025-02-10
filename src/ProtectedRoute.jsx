import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './UserContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading user data...</div>;
  }

  if (!user || !(user.authenticated)) {
    return <Navigate to="/login" replace/>;
  }

  return children;
}
