import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, X, FileText, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { applications, type Application, type ApplicationStatus } from "../lib/firestore";
import { deleteFromR2 } from "../lib/r2";

export const Route = createFileRoute("/vks/dashboard/applications")({
  component: ApplicationsPage,
});

const STATUSES: ApplicationStatus[] = ["PENDING", "REVIEWED", "INTERVIEW", "REJECTED", "SELECTED"];
const FILTERS = ["ALL", ...STATUSES] as const;

function ApplicationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["apps"], queryFn: applications.list });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [open, setOpen] = useState<Application | null>(null);

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Application> }) => applications.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["apps"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const remove = useMutation({
    mutationFn: async (a: Application) => {
      if (a.resumeKey) await deleteFromR2(a.resumeKey);
      await applications.remove(a.id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["apps"] }); setOpen(null); toast.success("Application deleted"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const filtered = useMemo(() => {
    let xs = data ?? [];
    if (filter !== "ALL") xs = xs.filter((a) => (a.status ?? "PENDING") === filter);
    if (search) {
      const q = search.toLowerCase();
      xs = xs.filter((a) => [a.fullName, a.name, a.email, a.jobTitle, a.role].some((v) => v?.toLowerCase().includes(q)));
    }
    return xs;
  }, [data, filter, search]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Applications</h1>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search applicant name…"
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-foreground" />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {FILTERS.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 text-xs rounded-full border ${filter === s ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left p-3">Applicant</th>
              <th className="text-left p-3 hidden md:table-cell">Job</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Resume</th>
              <th className="text-left p-3 hidden md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No applications.</td></tr>}
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/40 cursor-pointer" onClick={() => setOpen(a)}>
                <td className="p-3 font-medium">{a.fullName || a.name}<div className="text-xs text-muted-foreground">{a.email}</div></td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">{a.jobTitle || a.role || "—"}</td>
                <td className="p-3"><span className="text-xs px-2 py-1 rounded-full bg-secondary">{a.status ?? "PENDING"}</span></td>
                <td className="p-3">
                  {a.resumeUrl ? (
                    <a href={a.resumeUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs underline"><FileText className="w-3.5 h-3.5" /> View</a>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <ApplicationModal
          app={open}
          onClose={() => setOpen(null)}
          onSave={(patch) => update.mutate({ id: open.id, patch })}
          onDelete={() => { if (confirm("Delete this application and its resume?")) remove.mutate(open); }}
        />
      )}
    </div>
  );
}

function ApplicationModal({ app, onClose, onSave, onDelete }: {
  app: Application; onClose: () => void; onSave: (p: Partial<Application>) => void; onDelete: () => void;
}) {
  const [status, setStatus] = useState<ApplicationStatus>((app.status ?? "PENDING") as ApplicationStatus);
  const [notes, setNotes] = useState(app.notes ?? "");
  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="bg-background rounded-2xl w-full max-w-4xl border border-border max-h-[92vh] overflow-hidden flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
        <div className="md:w-1/2 border-b md:border-b-0 md:border-r border-border bg-card min-h-[260px] grid place-items-center">
          {app.resumeUrl ? <iframe src={app.resumeUrl} title="Resume" className="w-full h-[60vh] md:h-full" /> : <div className="text-sm text-muted-foreground p-6">No resume</div>}
        </div>
        <div className="md:w-1/2 p-6 overflow-y-auto space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold">{app.fullName || app.name}</h2>
              <p className="text-xs text-muted-foreground">{app.jobTitle || app.role}</p>
            </div>
            <button onClick={onClose}><X className="w-5 h-5" /></button>
          </div>

          <Section title="Profile">
            <Row k="Email" v={app.email} />
            <Row k="Phone" v={app.phone} />
            <Row k="DOB" v={app.dob} />
            <Row k="Gender" v={app.gender} />
            <Row k="Location" v={app.location || [app.currentPlace, app.state, app.country].filter(Boolean).join(", ")} />
          </Section>

          <Section title="Education">
            <Row k="Qualification" v={app.education || app.qualification} />
            <Row k="College" v={app.college} />
            <Row k="University" v={app.university} />
            <Row k="Graduation" v={app.graduationYear || app.passingYear} />
            <Row k="CGPA" v={app.cgpa} />
          </Section>

          <Section title="Experience">
            <Row k="Years" v={app.experience} />
            <Row k="Company" v={app.currentCompany} />
            <Row k="Expected Salary" v={app.expectedSalary} />
            <Row k="Work Mode" v={app.workMode} />
            <Row k="Skills" v={app.skills} />
          </Section>

          <Section title="Links">
            {app.linkedin && <a href={app.linkedin} target="_blank" rel="noreferrer" className="text-xs underline inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" /> LinkedIn</a>}
            {app.portfolio && <a href={app.portfolio} target="_blank" rel="noreferrer" className="ml-3 text-xs underline inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Portfolio</a>}
            {app.github && <a href={app.github} target="_blank" rel="noreferrer" className="ml-3 text-xs underline inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" /> GitHub</a>}
          </Section>

          <div>
            <label className="text-xs text-muted-foreground">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none" />
          </div>

          <div className="flex gap-2">
            <button onClick={() => { onSave({ status, notes }); toast.success("Saved"); onClose(); }}
              className="flex-1 bg-foreground text-background rounded-full py-2 text-sm font-medium">Save</button>
            <button onClick={onDelete} className="px-4 py-2 rounded-full border border-destructive text-destructive hover:bg-destructive/10 inline-flex items-center gap-1 text-sm">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v?: string | null }) {
  if (!v) return null;
  return <div className="flex justify-between gap-2 text-sm border-b border-border/40 py-1"><span className="text-muted-foreground">{k}</span><span className="text-right truncate max-w-[60%]">{v}</span></div>;
}
