import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { homePathForRole } from "@/lib/paths";
import { PageLoader } from "@/components/LoadingSpinner";

export function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homePathForRole(user.role)} replace />;
}
