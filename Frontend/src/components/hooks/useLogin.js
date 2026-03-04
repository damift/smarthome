import { useState } from "react";
import { login } from "@/services/auth";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Encapsuleert login-call + token/user opslag voor de LoginPage.
  async function submit() {
    setError(null);
    setLoading(true);

    try {
      const data = await login(email, password);

      const token = data?.token || data?.access_token || data?.data?.token;
      if (token) localStorage.setItem("token", token);

      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

      return { ok: true, data };
    } catch (err) {
      setError(err?.message ?? "Er ging iets mis");
      return { ok: false };
    } finally {
      setLoading(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    submit,
  };
}
