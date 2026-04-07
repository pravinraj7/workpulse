import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { homePathForRole } from "@/lib/paths";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAxiosError } from "axios";

export function LoginPage() {
  const { login } = useAuth();
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
      const user = await login(email, password);
      toast.success("Welcome back");
      const home = homePathForRole(user.role);
      const dest =
        intended &&
        ((user.role === "admin" && intended.startsWith("/admin")) ||
          (user.role === "user" && intended.startsWith("/user")))
          ? intended
          : home;
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
          <CardDescription className="text-[#6b7280]">Team sign in (members only)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[#6b7280]">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-[#3b82f6] hover:text-[#2563eb]">
              Register
            </Link>
            <span className="mx-2 text-[#e5e7eb]">|</span>
            <Link to="/admin/login" className="font-medium text-[#3b82f6] hover:text-[#2563eb]">
              Admin sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
