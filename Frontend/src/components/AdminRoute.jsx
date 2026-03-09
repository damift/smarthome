import { Navigate } from "react-router-dom";
import { getUser, isLoggedIn } from "@/lib/auth";

function isAdmin(user) {
  return String(user?.role ?? "").trim().toLowerCase() === "admin";
}

export default function AdminRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  const user = getUser();
  if (!isAdmin(user)) return <Navigate to="/dashboard" replace />;

  return children;
}
