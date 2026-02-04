import { useNavigate } from "react-router-dom";
import { loginMock } from "@/lib/auth";

import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Card, CardContent } from "@/components/shadcn/card";

export default function LoginCard({ onLogin }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    if (typeof onLogin === "function") return onLogin();
    loginMock();
    navigate("/dashboard", { replace: true });
  };

  return (
    <Card className="w-[min(520px,92vw)] rounded-none border-2 border-black bg-white text-black shadow-none">
      <CardContent className="max-h-[90vh] overflow-auto px-6 py-6 sm:px-10 sm:py-10">
        {/* Title box */}
        <div className="flex justify-center">
          <div className="border-2 border-black px-10 py-4 text-xl font-medium">
            Smart Home System
          </div>
        </div>

        {/* Subtitle */}
        <div className="mt-6 text-center text-sm">Login to continue</div>

        {/* Form */}
        <div className="mt-10 space-y-8">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-base font-normal">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
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
              className="h-14 rounded-lg border-2 border-black bg-gray-100 px-5 text-base placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <Button
            type="button"
            onClick={handleLogin}
            className="h-14 w-full rounded-lg bg-black text-base font-medium text-white hover:bg-black"
          >
            Login
          </Button>

          <div className="text-center">
              <a
                className="text-sm underline text-gray-500 hover:text-gray-700"
                href="#"
              >
                Forgot password?
              </a>
            </div>


          {/* Divider */}
          <div className="pt-2">
            <div className="h-px w-full bg-gray-300" />
          </div>

          {/* Demo credentials */}
          <div className="space-y-3 text-sm">
            <div>Demo credentials:</div>

            <div className="space-y-2">
              <div>
                Admin: <span className="font-normal">admin@smart.home</span> /{" "}
                <span className="font-normal">admin123</span>
              </div>
              <div>
                User: <span className="font-normal">user@smart.home</span> /{" "}
                <span className="font-normal">user123</span>
              </div>
              <div>
                Visitor: <span className="font-normal">visitor@smart.home</span>{" "}
                / <span className="font-normal">visitor123</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
