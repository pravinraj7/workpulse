import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAxiosError } from "axios";

export function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const intended = (location.state as { from?: string })?.from;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminLogin(email, password);
      toast.success("Welcome, admin");
      const dest =
        intended && intended.startsWith("/admin") ? intended : "/admin/dashboard";
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = isAxiosError(err) ? err.response?.data?.message : "Login failed";
      toast.error(typeof msg === "string" ? msg : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12">
      <Card className="w-full max-w-md border-[#e5e7eb] shadow-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-[#111827]">WorkPulse</CardTitle>
          <CardDescription className="text-[#6b7280]">
            Administrator sign in — not for team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@yourcompany.com"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <PasswordInput
                id="admin-password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in as admin"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[#6b7280]">
            Team member?{" "}
            <Link to="/login" className="font-medium text-[#3b82f6] hover:text-[#2563eb]">
              User sign in
            </Link>
            {" · "}
            <Link to="/register" className="font-medium text-[#3b82f6] hover:text-[#2563eb]">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
