import { useState } from "react";
import { registerUser } from "@/services/auth";

export function useRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Encapsuleert register-call + token/user opslag voor de RegisterPage.
  async function submit() {
    setError(null);
    setLoading(true);

    try {
      const data = await registerUser({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

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
    name, setName,
    email, setEmail,
    password, setPassword,
    passwordConfirmation, setPasswordConfirmation,
    loading,
    error,
    submit,
  };
}
