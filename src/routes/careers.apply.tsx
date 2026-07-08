import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { JobApplicationForm } from "../lib/job-application-form";

export const Route = createFileRoute("/careers/apply")({
  head: () => ({
    meta: [
      { title: "Apply — Work Wizards Innovations" },
      { name: "description", content: "Submit a general job application to Work Wizards Innovations." },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: "/careers/apply" }],
  }),
  component: ApplyGeneralPage,
});

function ApplyGeneralPage() {
  const navigate = useNavigate();
  return (
    <>
      <section className="px-6 pt-28 pb-8 border-b border-border bg-background">
        <div className="max-w-5xl mx-auto">
          <Link to="/careers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Careers
          </Link>
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <ShieldCheck className="w-3 h-3" /> General application
                </div>
                <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">Apply for the role you want</h1>
                <p className="mt-4 text-muted-foreground">Use this full-page form to apply even when you do not see an exact opening. Tell us what kind of role you want and we will route it to the right team.</p>
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
          <JobApplicationForm role="General Application" onSuccess={() => navigate({ to: "/careers" })} />
        </div>
      </section>
    </>
  );
}