import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import { useSidebar } from '../context/SidebarContext'; 
import { Toaster } from 'react-hot-toast';

const DashboardLayout = () => {
  const isRtl = false;
  const { 
    isDesktopSidebarExpanded, 
    isMobileDrawerOpen,
    closeMobileDrawer 
  } = useSidebar(); 
  
  // فئات الشريط الجانبي في حالة التوسع (w-64 = 16rem)
  const sidebarExpandedClasses = isRtl
    ? 'lg:mr-64 lg:w-[calc(100%-16rem)]'  
    : 'lg:ml-64 lg:w-[calc(100%-16rem)]'; 

  // فئات الشريط الجانبي في حالة الطي (w-20 = 5rem)
  const sidebarCollapsedClasses = isRtl
    ? 'lg:mr-20 lg:w-[calc(100%-5rem)]'   
    : 'lg:ml-20 lg:w-[calc(100%-5rem)]';  

  // في حالة الموبايل والتابلت، لن يتم تطبيق أي من الفئات أعلاه، وسيأخذ العرض الكامل

  const dynamicMainDesktopClasses = isDesktopSidebarExpanded
    ? sidebarExpandedClasses
    : sidebarCollapsedClasses;

  return (
    <div className="flex min-h-screen bg-primary font-sans" dir="ltr">
      <Sidebar />

      {/* التراكب (Overlay) للموبايل والتابلت عند فتح السايد الجانبي */}
      {isMobileDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={closeMobileDrawer} 
        ></div>
      )}

      {/* منطقة المحتوى الرئيسية */}
      <main 
        className={`
          transition-all duration-300 min-h-screen flex flex-col relative 
          w-full 
          ${dynamicMainDesktopClasses}
        `}
      >
        <DashboardHeader />
        
        <div className="p-4 md:p-8 flex-1 bg-secondary-background">
          <div className="min-h-full rounded-[2rem] bg-white/95 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] border border-white/70 p-6 backdrop-blur-sm">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
