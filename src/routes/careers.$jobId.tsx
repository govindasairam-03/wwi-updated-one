import { createFileRoute, Link, Outlet, notFound, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, Clock, Coins, MapPin, BadgeCheck, Send, Sparkles } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { api, type JobOpening } from "../lib/api";

export const Route = createFileRoute("/careers/$jobId")({
  loader: async ({ params }) => {
    const jobs = await api.listJobs();
    const job = jobs.find((item) => item.id === params.jobId);
    if (!job || job.archived || job.published === false) throw notFound();
    return { job };
  },
  head: ({ loaderData }) => {
    const job = loaderData?.job as JobOpening | undefined;
    const title = job ? `${job.title} — Careers | Work Wizards Innovations` : "Job Details — Work Wizards Innovations";
    const description = job?.description ?? "Detailed job opening information from Work Wizards Innovations.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
      links: job ? [{ rel: "canonical", href: `/careers/${job.id}` }] : [],
    };
  },
  component: JobDetailPage,
});

function JobDetailPage() {
  const { jobId } = Route.useParams();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data } = useQuery({
    queryKey: ["jobs"],
    queryFn: api.listJobs,
    staleTime: 30_000,
  });
  const job = (data ?? []).find((item) => item.id === jobId);
  if (!job) return null;

  if (pathname === `/careers/${jobId}/apply`) {
    return <Outlet />;
  }

  const compensation = [job.salaryRange, job.salary].filter(Boolean).join(" • ");
  const employment = [job.type, job.employmentType].filter(Boolean).join(" • ");
  const overviewItems = [
    { label: "Department", value: job.department || "Not specified", icon: Briefcase },
    { label: "Location", value: job.location || (job.remote ? "Remote" : "Not specified"), icon: MapPin },
    { label: "Type", value: employment || "Not specified", icon: BadgeCheck },
    { label: "Experience", value: job.experience || "Not specified", icon: Clock },
    { label: "Salary", value: compensation || "Not specified", icon: Coins },
  ];

  const detailSections = [
    { title: "Role Summary", content: job.description },
    { title: "Required Skills", content: job.skills },
  ].filter((section) => Boolean(section.content));

  const keyPoints = [
    { label: "Location", value: job.location || (job.remote ? "Remote" : "Not specified"), icon: MapPin },
    { label: "Type", value: employment || "Not specified", icon: BadgeCheck },
    { label: "Experience", value: job.experience || "Not specified", icon: Clock },
    { label: "Salary", value: compensation || "Not specified", icon: Coins },
  ];

  return (
    <>
      <section className="px-6 pt-28 pb-12 border-b border-border bg-background">
        <div className="max-w-6xl mx-auto">
          <Link to="/careers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Careers
          </Link>
          <Reveal>
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="w-3 h-3" /> Open Role
              </div>
              <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight">{job.title}</h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground">{job.shortDescription || job.description || "Detailed job information for this role."}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.3fr_0.9fr] items-start">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {keyPoints.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <item.icon className="w-3.5 h-3.5" /> {item.label}
                  </div>
                  <div className="mt-3 text-sm font-semibold">{item.value}</div>
                </div>
              ))}
            </div>

            {detailSections.map((section) => (
              <div key={section.title} className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{section.content as string}</p>
              </div>
            ))}

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold">Application Notes</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>Submit a full-page application with your resume link.</li>
                <li>Use the same role title so your application is matched correctly.</li>
                <li>We review published roles only.</li>
              </ul>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Quick Apply</div>
              <h2 className="mt-2 text-2xl font-bold">Apply to this role</h2>
              <p className="mt-3 text-sm text-muted-foreground">The application opens as a full page so you can complete the form without losing your place.</p>
              <a
                href={`/careers/${job.id}/apply`}
                onClick={(event) => {
                  event.preventDefault();
                  window.location.assign(`/careers/${job.id}/apply`);
                }}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
              >
                Apply Now <Send className="w-4 h-4" />
              </a>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BadgeCheck className="w-4 h-4" /> Role Snapshot
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <InfoRow label="Department" value={job.department || "Not specified"} />
                <InfoRow label="Remote" value={job.remote ? "Yes" : "No"} />
                <InfoRow label="Skills" value={job.skills || "Not specified"} />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground text-xs uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}