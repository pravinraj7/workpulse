import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { GuestRoute } from "@/components/GuestRoute";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { UserRoute } from "@/components/UserRoute";
import { HomeRedirect } from "@/components/HomeRedirect";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { UserLayout } from "@/components/layout/UserLayout";
import { LoginPage } from "@/pages/Login";
import { AdminLoginPage } from "@/pages/AdminLogin";
import { RegisterPage } from "@/pages/Register";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboard";
import { AdminProjectsPage } from "@/pages/admin/AdminProjects";
import { AdminTasksPage } from "@/pages/admin/AdminTasks";
import { AdminUsersPage } from "@/pages/admin/AdminUsers";
import { UserDashboardPage } from "@/pages/user/UserDashboard";
import { MyProjectsPage } from "@/pages/user/MyProjects";
import { MyTasksPage } from "@/pages/user/MyTasks";

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomeRedirect />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="tasks" element={<AdminTasksPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Route>

          <Route element={<UserRoute />}>
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboardPage />} />
              <Route path="my-projects" element={<MyProjectsPage />} />
              <Route path="my-tasks" element={<MyTasksPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors closeButton theme="light" />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
