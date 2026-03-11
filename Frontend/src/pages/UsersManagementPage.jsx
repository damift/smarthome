import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import UserList from "@/components/UserList";
import {
  getUsers as apiGetUsers,
  createUser as apiCreateUser,
  deleteUser as apiDeleteUser,
  assignRole as apiAssignRole,
  updateUserPassword as apiUpdateUserPassword,
} from "@/services/users";
import { toast } from "sonner";
import LoadingState from "@/components/ui/LoadingState";
import { getUser, logout } from "@/lib/auth";

function normalizeRole(role) {
  const value = String(role ?? "user").trim().toLowerCase();
  return value === "admin" ? "admin" : "user";
}

// Vangt meerdere backend response-vormen af en normaliseert ze naar 1 users-array.
function normalizeUsersResponse(data) {
  let list = [];

  if (Array.isArray(data)) list = data;
  else if (data == null) list = [];
  else if (Array.isArray(data.users)) list = data.users;
  else if (Array.isArray(data.data)) list = data.data;
  else list = [data];

  return list.map((u) => ({
    id: u.id ?? u.user_id ?? u.email,
    name: u.name ?? u.full_name ?? "",
    email: u.email ?? "",
    role: normalizeRole(u.role), // <-- altijd lowercase opslaan in frontend state
    status: u.status ?? "ACTIVE",
  }));
}

export default function UsersManagementPage() {
  const navigate = useNavigate();
  const authUser = getUser();
  const authUserId = authUser?.id;

  const [users, setUsers] = React.useState([]);
  const [open, setOpen] = React.useState(false);

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    role: "user", // lowercase
    password: "",
    password_confirmation: "",
  });

  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [changingPasswordId, setChangingPasswordId] = React.useState(null);
  const [deletingId, setDeletingId] = React.useState(null);
  const [updatingRoleId, setUpdatingRoleId] = React.useState(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = React.useState(null);
  const [passwordForm, setPasswordForm] = React.useState({
    password: "",
    password_confirmation: "",
  });
  const [passwordFormErrors, setPasswordFormErrors] = React.useState({});
  const [passwordSubmitError, setPasswordSubmitError] = React.useState(null);
  const [passwordSubmitting, setPasswordSubmitting] = React.useState(false);

  const [formErrors, setFormErrors] = React.useState({});
  const [submitError, setSubmitError] = React.useState(null);

  // Centrale loader die hergebruikt wordt na create/update acties.
  const loadUsers = React.useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await apiGetUsers();
      setUsers(normalizeUsersResponse(data));
    } catch (err) {
      console.error("Failed to load users:", err);
      toast.error(`Kon gebruikers niet laden: ${err.message}`);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleRoleChange(id, newRole) {
    const normalizedNewRole = normalizeRole(newRole);

    const currentUser = users.find((u) => u.id === id);
    const previousRole = normalizeRole(currentUser?.role);

    if (!currentUser) return;
    if (previousRole === normalizedNewRole) return;

    // Optimistic update: UI toont de nieuwe rol meteen.
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: normalizedNewRole } : u))
    );
    setUpdatingRoleId(id);

    try {
      await apiAssignRole(id, normalizedNewRole); // <-- altijd lowercase naar backend
      toast.success(`Role gewijzigd naar ${normalizedNewRole}`);

      if (String(id) === String(authUserId)) {
        toast("Je eigen rol is gewijzigd. Log opnieuw in.");
        logout();
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("Failed to assign role:", err);

      // Fallback bij fout: zet de vorige rol direct terug.
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: previousRole } : u))
      );

      toast.error(`Kon rol niet wijzigen: ${err.message}`);
    } finally {
      setUpdatingRoleId(null);
    }
  }

  async function handleRemove(id) {
    if (!window.confirm("Verwijder gebruiker?")) return;

    try {
      setDeletingId(id);
      await apiDeleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Gebruiker verwijderd");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(`Kon gebruiker niet verwijderen: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  function handleOpenPasswordDialog(user) {
    setPasswordTargetUser(user);
    setPasswordForm({ password: "", password_confirmation: "" });
    setPasswordFormErrors({});
    setPasswordSubmitError(null);
    setPasswordDialogOpen(true);
  }

  function validatePasswordForm() {
    const errors = {};

    if (!passwordForm.password) {
      errors.password = "Password is required";
    } else if (passwordForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!passwordForm.password_confirmation) {
      errors.password_confirmation = "Confirm password is required";
    } else if (passwordForm.password !== passwordForm.password_confirmation) {
      errors.password_confirmation = "Passwords do not match";
    }

    setPasswordFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordSubmitError(null);

    if (!passwordTargetUser) return;
    if (!validatePasswordForm()) return;

    try {
      setPasswordSubmitting(true);
      setChangingPasswordId(passwordTargetUser.id);

      await apiUpdateUserPassword(
        passwordTargetUser.id,
        passwordForm.password,
        passwordForm.password_confirmation
      );

      setPasswordDialogOpen(false);
      setPasswordTargetUser(null);
      setPasswordForm({ password: "", password_confirmation: "" });
      setPasswordFormErrors({});
      setPasswordSubmitError(null);

      toast.success("Wachtwoord gewijzigd");
    } catch (err) {
      console.error("Password update failed:", err);

      if (err?.data?.errors && typeof err.data.errors === "object") {
        const fieldErrors = {};
        for (const [field, messages] of Object.entries(err.data.errors)) {
          fieldErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        }
        setPasswordFormErrors(fieldErrors);
        setPasswordSubmitError("Please check the errors below");
      } else {
        setPasswordSubmitError(err.message || "An unexpected error occurred");
      }

      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setPasswordSubmitting(false);
      setChangingPasswordId(null);
    }
  }

  function handleAdd() {
    setFormErrors({});
    setSubmitError(null);
    setForm({
      name: "",
      email: "",
      role: "user", // lowercase
      password: "",
      password_confirmation: "",
    });
    setOpen(true);
  }

  function validateForm() {
    // Houdt frontend validatie dicht bij de formstate voor snelle feedback.
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Name is required";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Invalid email format";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!form.password_confirmation) {
      errors.password_confirmation = "Confirm password is required";
    } else if (form.password !== form.password_confirmation) {
      errors.password_confirmation = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      await apiCreateUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
        role: normalizeRole(form.role), // <-- lowercase naar backend
      });

      await loadUsers();

      setForm({
        name: "",
        email: "",
        role: "user",
        password: "",
        password_confirmation: "",
      });
      setFormErrors({});
      setSubmitError(null);
      setOpen(false);

      toast.success("Gebruiker aangemaakt");
    } catch (err) {
      console.error("Create user failed:", err);

      if (err?.data?.errors && typeof err.data.errors === "object") {
        const fieldErrors = {};
        for (const [field, messages] of Object.entries(err.data.errors)) {
          fieldErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
        }
        setFormErrors(fieldErrors);
        setSubmitError("Please check the errors below");
      } else {
        setSubmitError(err.message || "An unexpected error occurred");
      }

      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-zinc-400">Manage users and their permissions</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default" onClick={handleAdd}>
              ➕ Add User
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
              <DialogDescription>
                Fill in user details to create a new account.
              </DialogDescription>
            </DialogHeader>

            {submitError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className={formErrors.name ? "text-red-600" : ""}>
                  Name
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    if (formErrors.name) {
                      setFormErrors((err) => ({ ...err, name: "" }));
                    }
                  }}
                  placeholder="Full name"
                  className={formErrors.name ? "border-red-500 focus:border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className={formErrors.email ? "text-red-600" : ""}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, email: e.target.value }));
                    if (formErrors.email) {
                      setFormErrors((err) => ({ ...err, email: "" }));
                    }
                  }}
                  placeholder="email@example.com"
                  className={formErrors.email ? "border-red-500 focus:border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  value={normalizeRole(form.role)}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: normalizeRole(e.target.value) }))
                  }
                >
                  {/* labels met hoofdletter, values lowercase */}
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div>
                <Label htmlFor="password" className={formErrors.password ? "text-red-600" : ""}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, password: e.target.value }));
                    if (formErrors.password) {
                      setFormErrors((err) => ({ ...err, password: "" }));
                    }
                  }}
                  placeholder="Choose a password"
                  className={formErrors.password ? "border-red-500 focus:border-red-500" : ""}
                />
                {formErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="password_confirmation"
                  className={formErrors.password_confirmation ? "text-red-600" : ""}
                >
                  Confirm Password
                </Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => {
                    setForm((f) => ({
                      ...f,
                      password_confirmation: e.target.value,
                    }));
                    if (formErrors.password_confirmation) {
                      setFormErrors((err) => ({
                        ...err,
                        password_confirmation: "",
                      }));
                    }
                  }}
                  placeholder="Confirm password"
                  className={
                    formErrors.password_confirmation
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }
                />
                {formErrors.password_confirmation && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.password_confirmation}
                  </p>
                )}
              </div>

              <DialogFooter className="pt-2">
                <DialogClose asChild>
                  <button
                    type="button"
                    className="mr-2 rounded-md border px-4 py-2"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </DialogClose>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loadingUsers ? (
        <LoadingState message="Loading users..." />
      ) : (
        <UserList
          users={users}
          onRoleChange={handleRoleChange}
          onRemove={handleRemove}
          onChangePassword={handleOpenPasswordDialog}
          showActions={true}
          deletingId={deletingId}
          updatingRoleId={updatingRoleId}
          changingPasswordId={changingPasswordId}
        />
      )}

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              {passwordTargetUser
                ? `Set a new password for ${passwordTargetUser.name || passwordTargetUser.email}.`
                : "Set a new password for this user."}
            </DialogDescription>
          </DialogHeader>

          {passwordSubmitError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {passwordSubmitError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="edit_password"
                className={passwordFormErrors.password ? "text-red-600" : ""}
              >
                New password
              </Label>
              <Input
                id="edit_password"
                type="password"
                value={passwordForm.password}
                onChange={(e) => {
                  setPasswordForm((f) => ({ ...f, password: e.target.value }));
                  if (passwordFormErrors.password) {
                    setPasswordFormErrors((err) => ({ ...err, password: "" }));
                  }
                }}
                placeholder="Enter new password"
                className={passwordFormErrors.password ? "border-red-500 focus:border-red-500" : ""}
              />
              {passwordFormErrors.password && (
                <p className="mt-1 text-xs text-red-600">{passwordFormErrors.password}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="edit_password_confirmation"
                className={passwordFormErrors.password_confirmation ? "text-red-600" : ""}
              >
                Confirm password
              </Label>
              <Input
                id="edit_password_confirmation"
                type="password"
                value={passwordForm.password_confirmation}
                onChange={(e) => {
                  setPasswordForm((f) => ({
                    ...f,
                    password_confirmation: e.target.value,
                  }));
                  if (passwordFormErrors.password_confirmation) {
                    setPasswordFormErrors((err) => ({
                      ...err,
                      password_confirmation: "",
                    }));
                  }
                }}
                placeholder="Confirm new password"
                className={
                  passwordFormErrors.password_confirmation
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }
              />
              {passwordFormErrors.password_confirmation && (
                <p className="mt-1 text-xs text-red-600">
                  {passwordFormErrors.password_confirmation}
                </p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <button
                  type="button"
                  className="mr-2 rounded-md border px-4 py-2"
                  disabled={passwordSubmitting}
                >
                  Cancel
                </button>
              </DialogClose>

              <button
                type="submit"
                disabled={passwordSubmitting}
                className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-50"
              >
                {passwordSubmitting ? "Saving..." : "Save"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="text-sm text-zinc-500">Total: {users.length} users</div>
    </div>
  );
}
