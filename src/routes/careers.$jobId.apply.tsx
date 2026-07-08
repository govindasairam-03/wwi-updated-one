import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { api, type JobOpening } from "../lib/api";
import { JobApplicationForm } from "../lib/job-application-form";

export const Route = createFileRoute("/careers/$jobId/apply")({
  loader: async ({ params }) => {
    const jobs = await api.listJobs();
    const job = jobs.find((item) => item.id === params.jobId);
    if (!job || job.archived || job.published === false) throw notFound();
    return { job };
  },
  head: ({ loaderData }) => {
    const job = loaderData?.job as JobOpening | undefined;
    const title = job ? `Apply: ${job.title} — Work Wizards Innovations` : "Apply — Work Wizards Innovations";
    const description = job?.description ?? "Apply for a role at Work Wizards Innovations.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "robots", content: "noindex,nofollow" },
      ],
      links: job ? [{ rel: "canonical", href: `/careers/${job.id}/apply` }] : [],
    };
  },
  component: ApplyPage,
});

function ApplyPage() {
  const navigate = useNavigate();
  const { jobId } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["jobs"],
    queryFn: api.listJobs,
    staleTime: 30_000,
  });
  const job = (data ?? []).find((item) => item.id === jobId);
  if (!job) return null;

  return (
    <>
      <section className="px-6 pt-28 pb-8 border-b border-border bg-background">
        <div className="max-w-5xl mx-auto">
          <Link to="/careers/$jobId" params={{ jobId: job.id }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to role details
          </Link>
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <ShieldCheck className="w-3 h-3" /> Full-page application
                </div>
                <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">Apply for {job.title}</h1>
                <p className="mt-4 text-muted-foreground">Complete the full application form below. The form is laid out to keep every input visible and comfortable on desktop and mobile.</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="w-4 h-4" /> Application flow
                </div>
                <div className="mt-4 grid gap-3 text-sm">
                  <div className="flex items-center gap-2 rounded-xl bg-background border border-border px-3 py-2"><CheckCircle2 className="w-4 h-4 text-foreground" /> Personal details</div>
                  <div className="flex items-center gap-2 rounded-xl bg-background border border-border px-3 py-2"><CheckCircle2 className="w-4 h-4 text-foreground" /> Education and experience</div>
                  <div className="flex items-center gap-2 rounded-xl bg-background border border-border px-3 py-2"><CheckCircle2 className="w-4 h-4 text-foreground" /> Resume and review</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <JobApplicationForm role={job.title} jobId={job.id} onSuccess={() => navigate({ to: "/careers/$jobId", params: { jobId: job.id } })} />
        </div>
      </section>
    </>
  );
}