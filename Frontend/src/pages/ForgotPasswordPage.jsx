import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  return (
    <div className=" w-screen min-h-screen grid place-items-center bg-zinc-950 text-white p-6">
      <div className="w-full max-w-sm space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
        <h1 className="text-xl font-semibold">Forgot Password</h1>
        <p className="text-sm text-zinc-400">Router test: dit is /forgot-password</p>
        <Link className="text-sm underline" to="/login">Back to Login</Link>
      </div>
    </div>
  );
}
