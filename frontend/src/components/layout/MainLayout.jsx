import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { useHostel } from '@/context/useHostel';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { isSidebarCollapsed } = useHostel();
  const isMobile = useIsMobile();
  const isAdminPath = location.pathname.startsWith('/admin');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Determine margin for desktop admin view
  const desktopMargin = isAdminPath
    ? (isSidebarCollapsed ? "ml-[60px]" : "ml-[180px]")
    : "w-full overflow-x-hidden";

  return (
    <div className="min-h-screen font-sans selection:bg-primary/10" style={{ backgroundColor: '#F0F2F5' }}>
      {isAdminPath && (
        <Sidebar
          isMobile={isMobile}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      {isAdminPath && isMobile && (
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="fixed top-3 left-3 z-30 flex items-center justify-center rounded-lg shadow-md"
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#1E1E1E',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Menu style={{ width: '20px', height: '20px' }} />
        </button>
      )}

      <main className={cn(
        "min-h-screen transition-all duration-200 ease-in-out",
        isAdminPath && !isMobile ? desktopMargin : "w-full overflow-x-hidden"
      )}
      style={{ padding: '16px' }}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
