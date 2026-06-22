import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Calendar, Clock, User as UserIcon, ArrowLeft, Facebook, Linkedin, Twitter } from "lucide-react";
import { blogs, type BlogPost } from "../lib/firestore";

export const Route = createFileRoute("/blogs_/$slug")({
  loader: async ({ params }) => {
    const post = await blogs.getBySlug(params.slug);
    if (!post || !post.published) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.post as BlogPost | undefined;
    const title = p ? `${p.title} — WWI Blog` : "Blog — WWI";
    const desc = p?.shortDescription ?? "Read insights from the WWI team.";
    const img = p?.featuredImage;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: p ? [{ rel: "canonical", href: `/blogs/${p.slug}` }] : [],
      scripts: p ? [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org", "@type": "Article",
          headline: p.title, image: p.featuredImage ? [p.featuredImage] : undefined,
          datePublished: p.createdAt, author: p.author ? { "@type": "Person", name: p.author } : undefined,
        }),
      }] : [],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-[60vh] grid place-items-center px-4 text-center">
      <div><h1 className="text-2xl font-bold">Post not found</h1>
        <Link to="/blogs" className="mt-4 inline-block underline">Back to blog</Link></div>
    </div>
  ),
  component: BlogView,
});

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

function BlogView() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => blogs.getBySlug(slug),
    initialData: Route.useLoaderData().post,
  });
  const p = data;
  if (isLoading || !p) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(p.title);

  return (
    <article className="pb-16 md:pb-20">
      {p.featuredImage && (
        <div className="w-full aspect-[16/10] sm:aspect-[21/9] max-h-[520px] overflow-hidden bg-secondary">
          <img src={p.featuredImage} alt={p.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-6 md:mt-10">
        <Link to="/blogs" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="w-3.5 h-3.5" /> All posts</Link>
        {p.category && <div className="mt-3 md:mt-4 text-[10px] md:text-xs uppercase tracking-wider text-muted-foreground">{p.category}</div>}
        <h1 className="mt-2 text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight">{p.title}</h1>
        <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-3 md:gap-4 text-[11px] md:text-xs text-muted-foreground">
          {p.author && <span className="inline-flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" /> {p.author}</span>}
          {p.createdAt && <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(p.createdAt).toLocaleDateString()}</span>}
          <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {readingTime(p.content)} min read</span>
        </div>

        <div className="prose prose-sm md:prose-base prose-neutral dark:prose-invert max-w-none mt-6 md:mt-8 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: p.content }} />

        <div className="mt-12 pt-6 border-t border-border">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Share</div>
          <div className="flex gap-2">
            <ShareBtn href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} icon={Facebook} label="Facebook" />
            <ShareBtn href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} icon={Linkedin} label="LinkedIn" />
            <ShareBtn href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`} icon={Twitter} label="Twitter" />
            <ShareBtn href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`} icon={() => <span className="text-xs font-bold">W</span>} label="WhatsApp" />
          </div>
        </div>
      </div>
    </article>
  );
}

function ShareBtn({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="w-9 h-9 grid place-items-center rounded-full bg-secondary hover:bg-foreground hover:text-background transition">
      <Icon className="w-4 h-4" />
    </a>
  );
}
