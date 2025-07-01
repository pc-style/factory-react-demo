import { useEffect, useState } from 'react';

// Extend Window interface to include factory property
declare global {
  interface Window {
    factory?: {
      systemInfo: () => string;
    };
  }
}

export default function SystemInfo() {
  // Default to a friendly greeting for the demo
  const [systemInfo, setSystemInfo] = useState<string>('Hello World');

  useEffect(() => {
    // Check if running in Electron with factory API available
    if (window.factory && typeof window.factory.systemInfo === 'function') {
      try {
        const info = window.factory.systemInfo();
        setSystemInfo(info);
      } catch (error) {
        console.error('Error getting system info:', error);
        setSystemInfo('Error retrieving system info');
      }
    }
  }, []);

  return (
    <div className="system-info">
      <span>{systemInfo}</span>
    </div>
  );
}
