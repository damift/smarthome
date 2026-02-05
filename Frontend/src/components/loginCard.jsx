import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Card, CardContent } from "@/components/shadcn/card";

const API_BASE = "http://localhost:8080";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Laravel stuurt vaak JSON errors, dus proberen te lezen
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // mogelijke formats: message / errors
        const msg =
          data?.message ||
          (data?.errors
            ? Object.values(data.errors).flat().join(" ")
            : "Login failed");
        throw new Error(msg);
      }

      // token veld kan verschillen per setup
      const token = data?.token || data?.access_token || data?.data?.token;
      if (token) localStorage.setItem("token", token);

      // optioneel: user opslaan
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message ?? "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
      <Card className="w-[min(520px,92vw)] rounded-none border-2 border-black bg-white text-black shadow-none">
        <CardContent className="max-h-[90vh] overflow-auto px-6 py-6 sm:px-10 sm:py-10">
          <div className="flex justify-center">
            <div className="border-2 border-black px-10 py-4 text-xl font-medium">
              Smart Home System
            </div>
          </div>

          <div className="mt-6 text-center text-sm">Login to continue</div>

          <form onSubmit={handleLogin} className="mt-10 space-y-8">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-normal">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 rounded-lg border-2 border-black bg-gray-100 px-5 text-base placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-normal">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-lg border-2 border-black bg-gray-100 px-5 text-base placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

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
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center">
              <Link
                className="text-sm underline text-gray-500 hover:text-gray-700"
                to="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <div className="h-px w-full bg-gray-300" />
            </div>

            <div className="space-y-3 text-sm">
              <div>Demo credentials:</div>
              <div className="space-y-2">
                <div>Admin: admin@smart.home / admin123</div>
                <div>User: user@smart.home / user123</div>
                <div>Visitor: visitor@smart.home / visitor123</div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
