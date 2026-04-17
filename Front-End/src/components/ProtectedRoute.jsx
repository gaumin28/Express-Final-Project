import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

/** Redirects to /login if the user is not authenticated */
export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

/** Redirects to /login if not authenticated, or to / if not an admin */
export function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
