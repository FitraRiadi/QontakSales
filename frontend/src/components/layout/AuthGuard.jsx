import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AuthGuard() {
  const token = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("user_role");
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace />;

  if (userRole === "AGENT" && location.pathname === "/agents") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
