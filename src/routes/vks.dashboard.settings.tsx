import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { settings, type SiteSettings } from "../lib/firestore";

export const Route = createFileRoute("/vks/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: settings.get });
  const [f, setF] = useState<SiteSettings>({});

  useEffect(() => { if (data) setF(data); }, [data]);

  const save = useMutation({
    mutationFn: (v: SiteSettings) => settings.save(v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["settings"] }); toast.success("Settings saved"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  if (isLoading) return <Loader2 className="w-5 h-5 animate-spin" />;

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setF((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <Field label="Company Name" value={f.companyName ?? ""} onChange={(v) => set("companyName", v)} />
        <Field label="Phone" value={f.phone ?? ""} onChange={(v) => set("phone", v)} />
        <Field label="Email" value={f.email ?? ""} onChange={(v) => set("email", v)} />
        <Field label="Address" value={f.address ?? ""} onChange={(v) => set("address", v)} />
        <Field label="Instagram URL" value={f.instagram ?? ""} onChange={(v) => set("instagram", v)} />
        <Field label="Twitter URL" value={f.twitter ?? ""} onChange={(v) => set("twitter", v)} />
        <Field label="LinkedIn URL" value={f.linkedin ?? ""} onChange={(v) => set("linkedin", v)} />
        <button onClick={() => save.mutate(f)} disabled={save.isPending}
          className="inline-flex items-center gap-2 bg-foreground text-background rounded-full px-5 py-2 text-sm font-medium disabled:opacity-60">
          {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-foreground" />
    </label>
  );
}
