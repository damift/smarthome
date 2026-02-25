import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import LoginCard from "@/components/loginCard";
import { useLogin } from "@/components/hooks/useLogin";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { email, setEmail, password, setPassword, loading, error, submit } = useLogin();

  async function handleSubmit() {
    const result = await submit();
    if (result.ok) {
      toast.success("Logged in");
      navigate("/dashboard", { replace: true });
    } else {
      toast.error("Login failed");
    }
  }

  return (
  <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
      <LoginCard
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />
    
    </div>
    
  );
}
