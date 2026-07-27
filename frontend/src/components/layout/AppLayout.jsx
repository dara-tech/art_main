import { useState, useEffect } from 'react';
import AppNavActions from './AppNavActions';
import SidebarNav from './SidebarNav';

/** Authenticated shell: supports top horizontal bar or left vertical sidebar. */
export default function AppLayout({ onLogout, children }) {
  const [layoutStyle, setLayoutStyle] = useState(() => {
    return localStorage.getItem('app-layout-style') || 'navbar';
  });

  useEffect(() => {
    const handleLayoutChange = () => {
      setLayoutStyle(localStorage.getItem('app-layout-style') || 'navbar');
    };
    window.addEventListener('app-layout-style-changed', handleLayoutChange);
    return () => window.removeEventListener('app-layout-style-changed', handleLayoutChange);
  }, []);

  const isSidebar = layoutStyle === 'sidebar';

  useEffect(() => {
    if (isSidebar) {
      document.documentElement.style.setProperty('--sidebar-w', '13rem');
    } else {
      document.documentElement.style.setProperty('--sidebar-w', '0px');
    }
  }, [isSidebar]);
// ok
  return (
    <div className={isSidebar ? "flex min-h-screen bg-card" : "min-h-screen bg-card"}>
      {isSidebar && <SidebarNav />}
      <div className="flex-1 flex flex-col min-w-0">
        <AppNavActions onLogout={onLogout} hideNav={isSidebar} />
        <div className={isSidebar ? "flex-1 overflow-auto bg-card" : "min-h-[calc(100vh-2.5rem)] bg-card"}>
          {children}
        </div>
      </div>
    </div>
  );
}
