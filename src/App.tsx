import React, { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      window.location.replace('/hotspot/login.html');
    }
  }, []);

  return (
    <iframe
      src="/hotspot/login.html"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
      }}
      title="شبكة الاحمدي نت اللاسلكية"
    />
  );
}
