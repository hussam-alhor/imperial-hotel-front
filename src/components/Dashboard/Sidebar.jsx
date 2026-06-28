import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';

// Icons
import { BiStats, BiCategory } from 'react-icons/bi';
import { FiShoppingBag, FiSettings, FiPlus } from 'react-icons/fi';
import { MdOutlineFastfood, MdTableRestaurant } from 'react-icons/md';
import { BsQrCode } from 'react-icons/bs';
import { IoLogOutOutline, IoClose, IoReceiptOutline } from 'react-icons/io5';
import { FaCrown, FaUsers, FaClipboardList } from 'react-icons/fa';
import { HiOutlineMenu } from "react-icons/hi";

const Sidebar = () => {
    const { user, logout } = useAuth();
    const {
        isDesktopSidebarExpanded,
        isMobileDrawerOpen,
        closeMobileDrawer,
        toggleDesktopSidebar
    } = useSidebar();

    const userData = user || {};
    const isAdmin = userData.role === 'Admin' ;
    const isEmployee = userData.role === 'Employee' ;
    const isRtl = false;

    // 1. التحقق إذا كان الحساب فعالاً
    const isAccountActive = userData.accountStatus === 'active';

    // 2. تحديد ما إذا كان يجب تعطيل الروابط
    // يتم التعطيل فقط إذا كان الحساب غير فعال والمستخدم ليس super_admin
    const shouldDisableLinks = !isAccountActive && !isAdmin && !isEmployee;


    const employeeLinks = [
        { icon: <BiStats size={20} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <MdTableRestaurant size={20} />, label: 'Rooms', path: '/dashboard/rooms' },
        { icon: <FaClipboardList size={20} />, label: 'Customers', path: '/dashboard/customers' },
        { icon: <IoReceiptOutline size={20} />, label: 'Bookings', path: '/dashboard/bookings' },
        { icon: <FiPlus size={20} />, label: 'Invoices', path: '/dashboard/invoices' },
        { icon: <BiCategory size={20} />, label: 'Maintenances', path: '/dashboard/maintenances' },
        { icon: <FiSettings size={20} />, label: 'Cleaning Schedules', path: '/dashboard/cleaning-schedules' },

    ];


    const adminLinks = [
        { icon: <BiStats size={20} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <FaUsers size={20} />, label: 'Employees', path: '/dashboard/employees' },
        { icon: <BiCategory size={20} />, label: 'Reports', path: '/dashboard/admin/reports' },
        { icon: <IoReceiptOutline size={20} />, label: 'Invoices', path: '/dashboard/admin/invoices' },
        { icon: <FaClipboardList size={20} />, label: 'Audit Logs', path: '/dashboard/admin/audit-logs' },
    ];


    const linksToRender = isAdmin ? adminLinks : employeeLinks;
    
    const handleMobileLinkClick = (e) => {
        // منع التنقل إذا كان الحساب غير نشط
        if (shouldDisableLinks) {
            e.preventDefault();
        }
        // إغلاق القائمة دائماً عند الضغط
        closeMobileDrawer();
    };

    return (
        <>
            {/* ================= MOBILE / TABLET DRAWER ================= */}
            <aside
                className={`
                    fixed top-0 h-screen z-50 bg-white border-gray-100 transition-all duration-300 overflow-hidden font-sans
                    ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} 
                    w-64 
                    ${isMobileDrawerOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')} 
                    lg:hidden
                `}
            >
                <div className="p-6 flex items-center justify-between shrink-0">
                    <h1 className="text-3xl font-bold text-secondary">
                            {isAdmin ?  <div className='flex items-center justify-center w-full'><img className='w-[100%]' src="/img/logo.jpg" alt="logo"/> </div>  : <div className='flex items-center justify-center w-full'><img className='w-[100%]' src="/img/logo.jpg" alt="logo"/> </div> }
                    </h1>
                    <button onClick={closeMobileDrawer} className="p-2 text-secondary hover:text-secondary-hover">
                        <IoClose size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scroll pr-1">
                    {linksToRender.map((link, index) => (
                        <NavLink
                            key={index}
                            to={link.path}
                            end
                            onClick={handleMobileLinkClick} 
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-primary text-white font-bold'
                                    : 'text-gray-500 hover:bg-secondary-background hover:text-primary'}
                                ${shouldDisableLinks ? 'opacity-50 cursor-not-allowed' : ''} // -- MODIFIED: إضافة تصميم التعطيل --
                            `}
                        >
                            <span className="shrink-0">{link.icon}</span>
                            <span className="flex-1 text-sm whitespace-nowrap">{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100 shrink-0 bg-white">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-gray-100 font-bold uppercase shrink-0">
                            {userData.name ? userData.name.charAt(0) : 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-sm font-bold text-gray-800 truncate capitalize">
                                {userData.name}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                                {isAdmin ? 'Admin' : 'Employee'}
                            </p>
                        </div>
                        <button onClick={logout} className="text-primary hover:text-secondary-btn transition-colors p-1 shrink-0">
                            <IoLogOutOutline size={22} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ================= DESKTOP SIDEBAR (Large Screens Only) ================= */}
            <aside
                className={`
                    fixed top-0 h-screen z-50 bg-white border-gray-100 transition-all duration-300 overflow-hidden font-sans
                    ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} 
                    hidden lg:flex flex-col
                    ${isDesktopSidebarExpanded ? 'w-64' : 'w-20'} 
                `}
            >
                <div className={`p-6 flex items-center shrink-0 ${isDesktopSidebarExpanded ? 'justify-between' : 'justify-center'}`}>
                    {isDesktopSidebarExpanded ? (
                        <h1 className="text-3xl font-bold text-secondary">
                            {isAdmin ?  <div className='flex items-center justify-center w-full'><img className='w-[100%]' src="/img/logo.jpg" alt="logo"/> </div>  : <div className='flex items-center justify-center w-full'><img className='w-[100%]' src="/img/logo.jpg" alt="logo"/> </div> }
                        </h1>
                    ) : (
                        // <span className="text-2xl font-bold text-secondary ">
                        <>
                        
                             <img className='w-[100px]' src="/img/logo.jpg" alt="logo" /> 
                        </>
                        // </span>
                    )}
                    <button
                        onClick={toggleDesktopSidebar}
                        className={`p-1 text-secondary hover:text-secondary-hover rounded-full hover:bg-gray-100 ${isDesktopSidebarExpanded ? 'block' : 'hidden lg:block'}`}
                    >
                        {isDesktopSidebarExpanded ? <IoClose size={20} /> : <HiOutlineMenu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scroll pr-1">
                    {linksToRender.map((link, index) => (
                        <NavLink
                            key={index}
                            to={link.path}
                            end
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-primary text-white font-bold'
                                    : 'text-gray-500 hover:bg-secondary-background hover:text-primary'}
                                ${shouldDisableLinks ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} // -- MODIFIED: إضافة تصميم التعطيل ومنع الضغط --
                            `}
                        >
                            <span className="shrink-0">{link.icon}</span>
                            {isDesktopSidebarExpanded && (
                                <span className="flex-1 text-sm whitespace-nowrap">
                                    {link.label}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className={`p-4 border-t border-gray-100 shrink-0 bg-white ${!isDesktopSidebarExpanded && 'lg:hidden'}`}>
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-gray-100 font-bold uppercase shrink-0">
                            {userData.name ? userData.name.charAt(0) : 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-sm font-bold text-gray-800 truncate capitalize">
                                {userData.name}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                                {isAdmin ? 'Admin' : 'Employee'}
                            </p>
                        </div>
                        <button onClick={logout} className="text-primary hover:text-secondary-btn transition-colors p-1 shrink-0">
                            <IoLogOutOutline size={22} />
                        </button>
                    </div>
                </div>

                {!isDesktopSidebarExpanded && (
                    <div className="p-4 border-t border-gray-100 shrink-0 bg-white hidden lg:flex items-center justify-center">
                        <button onClick={logout} className="text-primary hover:text-secondary-btn transition-colors p-1" title="Logout">
                            <IoLogOutOutline size={22} />
                        </button>
                    </div>
                )}

                <div className={`px-6 py-2 text-[10px] text-gray-400 text-center mb-1 shrink-0 ${!isDesktopSidebarExpanded && 'lg:hidden'}`}>
                    جميع الحقوق محفوظة لـ 2026 ©
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
