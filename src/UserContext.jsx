import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const [selectedTenantId, setSelectedTenantId] = useState(() => {
    const savedTenant = localStorage.getItem('selectedTenantId');
    return savedTenant ? parseInt(savedTenant, 10) : null;
  })
  const [loading, setLoading] = useState(true);

  // fetch user data from the server, optionally with tenantId
  const fetchUser = async (tenantIdParam) => {
    let url = 'http://localhost:8083/api/currentuser';
    if (tenantIdParam) {
      url += `?tenantId=${tenantIdParam}`;
    }
    const resp = await fetch(url, { credentials: 'include' });
    if (resp.ok) {
      const data = await resp.json();
      return data;
    } else {
      throw new Error(`Failed to fetch user: ${resp.status}`);
    }
  };
  useEffect(() => {
    if (initialFetchDone) return; // only run once

    (async () => {
      try {
        if (selectedTenantId === null) {
          // Means localStorage was empty. So fetch user w/o tenant param
          const data = await fetchUser(null);
          setUser(data);
          if (data?.authenticated) {
            // If user has no local stored tenant, use their defaultTenant
            const fallbackTenant = data.requestedTenant ?? data.defaultTenant;
            if (fallbackTenant) {
              setSelectedTenantId(fallbackTenant);
              localStorage.setItem('selectedTenantId', fallbackTenant);
            }
          } else {
            setUser(null);
          }
        } else {
          // We DO have a tenant in localStorage, fetch user with that tenant
          const data = await fetchUser(selectedTenantId);
          setUser(data);
        }
      } catch (err) {
        console.error('Error in initial fetchUser:', err);
        setUser(null);
      } finally {
        setInitialFetchDone(true);
        setLoading(false);
      }
    })();
  }, [initialFetchDone, selectedTenantId]);
  useEffect(() => {
    if (!initialFetchDone) return; // skip until first load is done

    (async () => {
      try {
        if (selectedTenantId != null) {
          localStorage.setItem('selectedTenantId', selectedTenantId);
          const data = await fetchUser(selectedTenantId);
          setUser(data);
        }
      } catch (err) {
        console.error('Error fetching user for tenant:', err);
        setUser(null);
      }
    })();
  }, [selectedTenantId, initialFetchDone]);
  
  const logout = async () => {
    try {
      await fetch('http://localhost:8083/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    localStorage.removeItem('selectedTenantId');
    setUser(null);
    setSelectedTenantId(null);
    window.location.href = 'http://localhost:5173/login';
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        selectedTenantId,
        setSelectedTenantId,
        loading,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
