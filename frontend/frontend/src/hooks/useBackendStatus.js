import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useBackendStatus() {
  const [status, setStatus] = useState({
    status: 'checking',
    scheduler_active: false,
    database_connected: false,
    lastCheck: null
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/status`);
        const data = await res.json();
        setStatus({
          status: data.status,
          scheduler_active: data.scheduler_active,
          database_connected: data.database_connected,
          lastCheck: new Date(data.timestamp)
        });
      } catch (e) {
        setStatus({ status: 'offline', scheduler_active: false, database_connected: false, lastCheck: null });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return status;
}
