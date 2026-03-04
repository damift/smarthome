import { Navigate } from "react-router-dom";
import { isLoggedIn } from "@/lib/auth";

export default function ProtectedRoute({ children }) {
  // Blokkeert toegang tot private routes zonder token.
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}
