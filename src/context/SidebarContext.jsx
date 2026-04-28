import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  // حالة الشريط الجانبي للديسكتوب (هل هو موسع أم مصغر؟)
  // يكون موسعًا بشكل افتراضي على الشاشات الكبيرة
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(window.innerWidth >= 768); 

  // حالة النافذة الجانبية للموبايل (هل هي مفتوحة أم مغلقة؟)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // دالة تبديل حالة الشريط الجانبي للديسكتوب
  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarExpanded(prev => !prev);
  };

  // دالة فتح/إغلاق النافذة الجانبية للموبايل
  const openMobileDrawer = () => setIsMobileDrawerOpen(true);
  const closeMobileDrawer = () => setIsMobileDrawerOpen(false);

  // تأثير لمتابعة تغيير حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      // إذا كانت الشاشة ديسكتوب (md فأكثر)
      if (window.innerWidth >= 768) {
        setIsDesktopSidebarExpanded(true); // اجعله موسعًا دائمًا بشكل افتراضي
        setIsMobileDrawerOpen(false);      // أغلق النافذة الجانبية للموبايل
      } else {
        setIsDesktopSidebarExpanded(false); // على الموبايل، حالة التوسيع/التصغير غير مطبقة
      }
    };

    window.addEventListener('resize', handleResize);
    // إزالة المستمع عند إلغاء تحميل المكون
    return () => window.removeEventListener('resize', handleResize);
  }, []); 

  const value = {
    isDesktopSidebarExpanded,
    isMobileDrawerOpen,
    toggleDesktopSidebar,
    openMobileDrawer,
    closeMobileDrawer,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
