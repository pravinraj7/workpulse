import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/LoadingSpinner";

/** Any logged-in user. */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) {
    const signIn =
      location.pathname.startsWith("/admin") && location.pathname !== "/admin/login"
        ? "/admin/login"
        : "/login";
    return <Navigate to={signIn} state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}
