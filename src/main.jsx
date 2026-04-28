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
        element: <div>Dashboard Home</div>, // placeholder
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
   
