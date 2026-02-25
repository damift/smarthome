import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/shadcn/button";
import AuthCard from "@/components/auth/AuthCard";
import AuthTextField from "@/components/auth/AuthTextField";
import { useRegister } from "@/components/hooks/useRegister";
import { toast } from "sonner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const {
    name, setName,
    email, setEmail,
    password, setPassword,
    passwordConfirmation, setPasswordConfirmation,
    loading, error, submit
  } = useRegister();

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await submit();
    if (result.ok) {
      toast.success("Account created");
      navigate("/dashboard", { replace: true });
    } else {
      toast.error("Registration failed");
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
      <AuthCard subtitle="Create an account">
        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <AuthTextField
            id="name"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />

          <AuthTextField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />

          <AuthTextField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <AuthTextField
            id="password_confirmation"
            label="Confirm Password"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-14 w-full rounded-lg bg-black text-base font-medium text-white hover:bg-black disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register"}
          </Button>

          <div className="text-center">
            <Link className="text-sm underline text-gray-500 hover:text-gray-700" to="/login">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}
