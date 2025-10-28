import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const DebugAuth = () => {
  const { user, loading } = useContext(AuthContext);
  
  useEffect(() => {

    
    // Check localStorage
    const savedUser = localStorage.getItem('user');
   
  }, [user, loading]);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.9)', 
      color: 'white', 
      padding: '15px', 
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      fontFamily: 'monospace'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>🔍 AUTH DEBUG</div>
      <div>User: <span style={{ color: user ? '#4ADE80' : '#F87171' }}>
        {user ? 'LOGGED IN' : 'NOT LOGGED IN'}
      </span></div>
      <div>Loading: <span style={{ color: loading ? '#FBBF24' : '#60A5FA' }}>
        {loading ? 'YES' : 'NO'}
      </span></div>
      <div>User ID: {user?.id || 'NULL'}</div>
      <div>Email: {user?.email || 'NULL'}</div>
      <div>Name: {user ? `${user.first_name} ${user.last_name}` : 'NULL'}</div>
      <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
        Check browser console for details
      </div>
    </div>
  );
};

export default DebugAuth;