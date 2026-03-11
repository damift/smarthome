import { Link } from "react-router-dom";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Card, CardContent } from "@/components/shadcn/card";

export default function LoginCard({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  onSubmit,
}) {
  return (
    <Card className="w-[min(520px,92vw)] rounded-none border-2 border-black bg-white text-black shadow-none">
      <CardContent className="max-h-[90vh] overflow-auto px-6 py-6 sm:px-10 sm:py-10">
        <div className="flex justify-center">
          <div className="border-2 border-black px-10 py-4 text-xl font-medium">
            Smart Home System
          </div>
        </div>

        <div className="mt-6 text-center text-sm">Login to continue</div>

        <form
          // Houdt submit-logica in de parent (LoginPage/useLogin).
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="mt-10 space-y-8"
        >
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
              placeholder="Password"
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
                 <Link className="text-sm underline text-gray-500 hover:text-gray-700" to="/register">
                        Create account
               </Link>
             </div>


          <div className="text-center">
            <Link
              className="text-sm underline text-gray-500 hover:text-gray-700"
              to="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
