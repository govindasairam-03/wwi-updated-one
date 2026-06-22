import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowRight } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { PageHero } from "../components/PageHero";
import { blogs } from "../lib/firestore";

export const Route = createFileRoute("/blogs")({
  head: () => ({
    meta: [
      { title: "Blog — Work Wizards Innovations" },
      { name: "description", content: "Insights, tutorials, and updates from the WWI team on web, mobile, and AI." },
      { property: "og:title", content: "Blog — Work Wizards Innovations" },
      { property: "og:description", content: "Insights, tutorials, and updates from the WWI team." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/blogs" }],
  }),
  component: BlogsList,
});

function BlogsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["blogs", "published"],
    queryFn: blogs.listPublished,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return (
    <>
      <PageHero title="From the Blog" description="Insights, ideas, and updates from the WWI team." />
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : (data ?? []).length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No posts published yet — check back soon.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(data ?? []).map((b, i) => (
                <Reveal key={b.id} delay={i * 0.05}>
                  <Link to="/blogs/$slug" params={{ slug: b.slug }}
                    className="group block rounded-2xl bg-card border border-border overflow-hidden hover:border-foreground/40 transition-colors h-full">
                    {b.featuredImage ? (
                      <img src={b.featuredImage} alt={b.title} loading="lazy" className="w-full aspect-[16/9] object-cover" />
                    ) : <div className="w-full aspect-[16/9] bg-secondary" />}
                    <div className="p-5">
                      {b.category && <div className="text-xs uppercase tracking-wider text-muted-foreground">{b.category}</div>}
                      <h2 className="mt-2 font-semibold text-lg group-hover:underline">{b.title}</h2>
                      {b.shortDescription && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{b.shortDescription}</p>}
                      <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium">Read More <ArrowRight className="w-3.5 h-3.5" /></div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
