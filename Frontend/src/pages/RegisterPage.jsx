import { useNavigate } from "react-router-dom";
import LoginCard from "@/components/loginCard";
import { loginMock } from "@/lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  function handleRegister() {
    loginMock();
    navigate("/dashboard", { replace: true });
  }

return (
  <div className="w-screen flex items-center justify-center">
    <LoginCard onLogin={handleRegister} />
  </div>
);
}
