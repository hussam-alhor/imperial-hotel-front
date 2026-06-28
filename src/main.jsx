import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import NotFounPage from './pages/NotFoundPage/NotFoundPage.jsx';
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx';
import { SidebarProvider } from './context/SidebarContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import LoginPage from './pages/Login/LoginPage.jsx';
import EmployeesManagement from './pages/Admin/EmployeesManagement.jsx';
import RoomsManagement from './pages/Employee/RoomsManagement.jsx';
import CustomersManagement from './pages/Employee/CustomersManagement.jsx';
import RoomsBookingManagement from './pages/Employee/RoomsBookingManagement.jsx';
import InvoicesManagement from './pages/Employee/InvoicesManagement.jsx';
import MaintenancesManagement from './pages/Employee/MaintenancesManagement.jsx';
import CleaningSchedulesManagement from './pages/Employee/CleaningSchedulesManagement.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import AdminReports from './pages/Admin/AdminReports.jsx';
import AdminInvoices from './pages/Admin/AdminInvoices.jsx';
import AdminAuditLogs from './pages/Admin/AdminAuditLogs.jsx';




const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  // مسار الجذر: يتحقق من المصادقة ويوجه
  {
    path: "/",
    element: <App />,
  },

  // مسار تسجيل الدخول (عام)
  {
    path: "/login",
    element: <LoginPage />,
  },

  // مسارات الداشبورد (محمية)
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "employees",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <EmployeesManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "rooms",
        element: (
          <ProtectedRoute allowedRoles={["Employee"]}>
            <RoomsManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "customers",
        element: (
          <ProtectedRoute allowedRoles={["Employee"]}>
            <CustomersManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "bookings",
        element: (
          <ProtectedRoute allowedRoles={["Employee"]}>
            <RoomsBookingManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "invoices",
        element: (
          <ProtectedRoute allowedRoles={["Employee"]}>
            <InvoicesManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "maintenances",
        element: (
          <ProtectedRoute allowedRoles={["Employee"]}>
            <MaintenancesManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "cleaning-schedules",
        element: (
          <ProtectedRoute allowedRoles={["Employee"]}>
            <CleaningSchedulesManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/reports",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminReports />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/invoices",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminInvoices />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/audit-logs",
        element: (
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminAuditLogs />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // مسار غير مصرح به
  {
    path: "/unauthorized",
    element: <div>غير مصرح لك بالوصول</div>,
  },

  // صفحة 404
  {
    path: "*",
    element: <NotFounPage />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SidebarProvider>
          <RouterProvider router={router} />
          <Toaster />
        </SidebarProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
   
