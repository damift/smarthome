import { useNavigate } from "react-router-dom";
import LoginCard from "@/components/loginCard";
import { loginMock } from "@/lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  function handleLogin() {
    loginMock();
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className=" w-screen flex items-center justify-center">
      <LoginCard onLogin={handleLogin} />
    </div>
  );
}
