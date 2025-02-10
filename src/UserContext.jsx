import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchCurrentUser() {
      try {
        const resp = await fetch('http://localhost:8083/api/currentuser', {
          credentials: 'include',
        });
        if (resp.status === 401) {
          setUser(null);
        } else if (!resp.ok) {
          throw new Error(`Failed to fetch user: ${resp.status}`);
        } else {
          const data = await resp.json();
          if (data && data.authenticated) {
            setUser(data);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchCurrentUser();
  }, []);
  const logout = async () => {
    try {
      await fetch('http://localhost:8083/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    setUser(null);
    window.location.href = 'http://localhost:5173/login';
  };
  return (
    <UserContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
};
