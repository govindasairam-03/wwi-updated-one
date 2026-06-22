import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { jobs, type JobOpening } from "../lib/firestore";

export const Route = createFileRoute("/vks/dashboard/jobs")({
  component: JobsPage,
});

type JobForm = Omit<JobOpening, "id" | "createdAt">;

const emptyJob: JobForm = {
  title: "",
  department: "",
  description: "",
  skills: "",
  experience: "",
  salary: "",
  type: "Full-time",
  remote: false,
  location: "",
  published: true,
};

function JobsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["jobs"], queryFn: jobs.list });
  const [editing, setEditing] = useState<JobOpening | "new" | null>(null);

  const create = useMutation({
    mutationFn: (j: JobForm) => jobs.create(j),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobs"] }); toast.success("Job created"); setEditing(null); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<JobOpening> }) => jobs.update(id, patch),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobs"] }); toast.success("Saved"); setEditing(null); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => jobs.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobs"] }); toast.success("Deleted"); },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Job Openings</h1>
        <button onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 bg-foreground text-background rounded-full px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground border-b border-border">
            <tr><th className="text-left p-3">Title</th><th className="text-left p-3 hidden md:table-cell">Department</th><th className="text-left p-3 hidden md:table-cell">Location</th><th className="text-left p-3">Published</th><th className="text-left p-3">Actions</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>}
            {!isLoading && (data ?? []).length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No jobs yet.</td></tr>}
            {(data ?? []).map((j) => (
              <tr key={j.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{j.title}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{j.department || "—"}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{j.location || (j.remote ? "Remote" : "—")}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${j.published !== false ? "bg-foreground text-background" : "bg-secondary"}`}>
                    {j.published !== false ? "Yes" : "No"}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => setEditing(j)} className="p-1.5 rounded hover:bg-secondary"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { if (confirm(`Delete "${j.title}"?`)) remove.mutate(j.id); }} className="p-1.5 rounded hover:bg-destructive/10 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <JobModal
          initial={editing === "new" ? emptyJob : editing}
          onClose={() => setEditing(null)}
          onSubmit={(form) => {
            if (editing === "new") create.mutate(form);
            else update.mutate({ id: editing.id, patch: form });
          }}
        />
      )}
    </div>
  );
}

function JobModal({ initial, onClose, onSubmit }: { initial: JobForm | JobOpening; onClose: () => void; onSubmit: (f: JobForm) => void }) {
  const [f, setF] = useState<JobForm>({
    title: initial.title ?? "",
    department: initial.department ?? "",
    description: initial.description ?? "",
    skills: initial.skills ?? "",
    experience: initial.experience ?? "",
    salary: initial.salary ?? "",
    type: initial.type ?? "Full-time",
    remote: initial.remote ?? false,
    location: initial.location ?? "",
    published: initial.published !== false,
  });
  const set = <K extends keyof JobForm>(k: K, v: JobForm[K]) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="bg-background rounded-2xl w-full max-w-2xl border border-border max-h-[92vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h3 className="font-semibold">{(initial as JobOpening).id ? "Edit Job" : "New Job"}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 overflow-y-auto grid sm:grid-cols-2 gap-3">
          <Field label="Title *" value={f.title} onChange={(v) => set("title", v)} />
          <Field label="Department" value={f.department ?? ""} onChange={(v) => set("department", v)} />
          <Field label="Experience" value={f.experience ?? ""} onChange={(v) => set("experience", v)} />
          <Field label="Salary" value={f.salary ?? ""} onChange={(v) => set("salary", v)} />
          <Field label="Location" value={f.location ?? ""} onChange={(v) => set("location", v)} />
          <label className="text-xs text-muted-foreground">Type
            <select value={f.type ?? "Full-time"} onChange={(e) => set("type", e.target.value)} className="mt-1 w-full bg-card border border-border rounded-lg px-3 py-2 text-sm">
              <option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option>
            </select>
          </label>
          <div className="sm:col-span-2"><Field label="Skills (comma separated)" value={f.skills ?? ""} onChange={(v) => set("skills", v)} /></div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">Description</label>
            <textarea value={f.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={4}
              className="mt-1 w-full bg-card border border-border rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={f.remote ?? false} onChange={(e) => set("remote", e.target.checked)} /> Remote</label>
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={f.published !== false} onChange={(e) => set("published", e.target.checked)} /> Published</label>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-full border border-border text-sm">Cancel</button>
          <button onClick={() => { if (!f.title.trim()) { toast.error("Title required"); return; } onSubmit(f); }}
            className="px-5 py-2 rounded-full bg-foreground text-background text-sm font-medium">Save</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-foreground" />
    </label>
  );
}
