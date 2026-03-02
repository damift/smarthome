import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export default function ChangePasswordDialog({ userId, userName, onPasswordChanged }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!password || !confirmPassword) {
      toast.error("Voer alstublieft beide wachtwoorden in");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Wachtwoorden komen niet overeen");
      return;
    }

    if (password.length < 6) {
      toast.error("Wachtwoord moet minstens 6 karakters lang zijn");
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/api/users/${userId}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      toast.success("Wachtwoord succesvol gewijzigd");
      setPassword("");
      setConfirmPassword("");
      setOpen(false);
      
      if (onPasswordChanged) {
        onPasswordChanged();
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Fout bij wijzigen wachtwoord");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Wachtwoord wijzigen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Wachtwoord wijzigen</DialogTitle>
          <DialogDescription>
            Wijzig het wachtwoord voor {userName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Nieuw wachtwoord</Label>
            <Input
              id="password"
              type="password"
              placeholder="Voer nieuw wachtwoord in"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Bevestig wachtwoord</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Bevestig wachtwoord"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Annuleren
          </Button>
          <Button
            type="submit"
            onClick={handleChangePassword}
            disabled={loading}
          >
            {loading ? "Updating..." : "Wachtwoord wijzigen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
