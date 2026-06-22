import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export const Route = createFileRoute("/vks/dashboard/change-password")({
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !user.email) { toast.error("Not signed in"); return; }
    if (next.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (next !== confirm) { toast.error("Passwords do not match"); return; }
    setBusy(true);
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, current));
      await updatePassword(user, next);
      toast.success("Password Updated Successfully");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md space-y-4">
      <div className="flex items-center gap-2"><KeyRound className="w-5 h-5" /><h1 className="text-2xl font-bold">Change Password</h1></div>
      <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <Field label="Current Password" value={current} onChange={setCurrent} />
        <Field label="New Password" value={next} onChange={setNext} />
        <Field label="Confirm New Password" value={confirm} onChange={setConfirm} />
        <button type="submit" disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background rounded-full py-2.5 text-sm font-medium disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Update Password
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input type="password" value={value} onChange={(e) => onChange(e.target.value)} required
        className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-foreground" />
    </label>
  );
}
