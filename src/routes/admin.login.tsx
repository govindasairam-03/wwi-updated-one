import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — WWI" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const { user, signIn, resetPassword, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("official@wwi.org.in");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/vks/dashboard" });
  }, [user, authLoading, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(email, password, remember);
      toast.success("Welcome back");
      navigate({ to: "/vks/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const onForgot = async () => {
    if (!email) { toast.error("Enter your email first"); return; }
    try { await resetPassword(email); toast.success("Password reset email sent"); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed to send reset"); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <motion.form
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-card border border-border rounded-2xl p-7 space-y-5"
      >
        <div className="flex items-center gap-2"><Lock className="w-4 h-4" /><h1 className="font-semibold text-lg">WWI Admin</h1></div>

        <label className="block">
          <span className="text-xs text-muted-foreground">Email</span>
          <div className="mt-1 relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-foreground" />
          </div>
        </label>

        <label className="block">
          <span className="text-xs text-muted-foreground">Password</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-foreground" />
        </label>

        <div className="flex items-center justify-between text-xs">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Remember me</span>
          </label>
          <button type="button" onClick={onForgot} className="text-muted-foreground hover:text-foreground underline">Forgot password?</button>
        </div>

        <button type="submit" disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background rounded-full py-2.5 text-sm font-medium disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Sign In
        </button>

        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">← Back to website</Link>
      </motion.form>
    </div>
  );
}
