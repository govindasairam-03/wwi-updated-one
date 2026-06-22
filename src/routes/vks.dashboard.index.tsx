import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { applications, jobs, blogs } from "../lib/firestore";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/vks/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const apps = useQuery({ queryKey: ["apps"], queryFn: applications.list });
  const jbs = useQuery({ queryKey: ["jobs"], queryFn: jobs.list });
  const bls = useQuery({ queryKey: ["blogs"], queryFn: blogs.list });

  const total = apps.data?.length ?? 0;
  const pending = apps.data?.filter((a) => a.status === "PENDING" || a.status === "NEW").length ?? 0;
  const interview = apps.data?.filter((a) => a.status === "INTERVIEW").length ?? 0;
  const activeJobs = jbs.data?.filter((j) => !j.archived && j.published !== false).length ?? 0;
  const publishedBlogs = bls.data?.filter((b) => b.published).length ?? 0;

  const stats = [
    { label: "Total Applications", value: total },
    { label: "Pending Review", value: pending },
    { label: "Interview Stage", value: interview },
    { label: "Active Jobs", value: activeJobs },
    { label: "Published Blogs", value: publishedBlogs },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-card border border-border">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-2 text-3xl font-bold">{apps.isLoading || jbs.isLoading || bls.isLoading ? "—" : s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Recent Applications</h2>
          <Link to="/vks/dashboard/applications" className="text-xs underline">View all</Link>
        </div>
        {apps.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
          <ul className="text-sm divide-y divide-border">
            {(apps.data ?? []).slice(0, 6).map((a) => (
              <li key={a.id} className="py-2 flex justify-between gap-3">
                <span className="truncate">{a.fullName || a.name} · <span className="text-muted-foreground">{a.jobTitle || a.role || "—"}</span></span>
                <span className="text-xs text-muted-foreground">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}</span>
              </li>
            ))}
            {(apps.data ?? []).length === 0 && <li className="py-4 text-muted-foreground text-center">No applications yet.</li>}
          </ul>
        )}
      </div>
    </div>
  );
}
