
import React from 'react';
import { IoMenuOutline } from 'react-icons/io5';
import { useSidebar } from '../../context/SidebarContext';

const DashboardHeader = () => {
  const { openMobileDrawer } = useSidebar();

  return (
    <header className="bg-white h-20 border-b border-gray-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={openMobileDrawer}
          className="block p-2 text-secondary hover:text-secondary-hover rounded-full hover:bg-gray-100 lg:hidden"
        >
          <IoMenuOutline size={24} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome to the management panel</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
        <span>Ready</span>
      </div>
    </header>
  );
};

export default DashboardHeader;
