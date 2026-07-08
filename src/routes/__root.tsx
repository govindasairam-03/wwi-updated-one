import { QueryClient } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, useRouterState } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Toaster } from "../components/ui/sonner";

const SITE = {
  name: "Work Wizards Innovations",
  url: "https://wwi.org.in",
  description: "Work Wizards Innovations Pvt Ltd builds cutting-edge web, mobile, and AI-powered products for modern businesses.",
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. You can try again or head home.</p>
        <div className="mt-6 flex gap-2 justify-center">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Try again</button>
          <a href="/" className="rounded-full border border-input px-5 py-2.5 text-sm font-medium">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/**
 * Reads merged `meta` and `links` declared by each matched route's `head()`
 * and sync them via react-helmet-async. Works in a pure-SPA setup.
 */
function HeadSync() {
  const matches = useRouterState({ select: (s) => s.matches });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const meta: Array<Record<string, string>> = [];
  const links: Array<Record<string, string>> = [];
  const scripts: Array<Record<string, unknown>> = [];
  for (const m of matches) {
    const head = (m as { meta?: Record<string, string>[]; links?: Record<string, string>[]; scripts?: Record<string, unknown>[] });
    if (Array.isArray(head.meta)) meta.push(...head.meta);
    if (Array.isArray(head.links)) links.push(...head.links);
    if (Array.isArray(head.scripts)) scripts.push(...head.scripts);
  }
  const resolveUrl = (value: string) => (value.startsWith("http://") || value.startsWith("https://") ? value : new URL(value, SITE.url).href);
  const isNoIndex = meta.some((t) => t.name === "robots" && typeof t.content === "string" && t.content.includes("noindex"));
  const title = [...meta].reverse().find((t) => "title" in t)?.title ?? SITE.name;
  const description = [...meta].reverse().find((t) => t.name === "description")?.content ?? SITE.description;
  const ogType = [...meta].reverse().find((t) => t.property === "og:type")?.content ?? "website";
  const ogImage = [...meta].reverse().find((t) => t.property === "og:image")?.content ?? [...meta].reverse().find((t) => t.name === "twitter:image")?.content;
  const canonicalHref = (() => {
    const canonical = [...links].reverse().find((l) => l.rel === "canonical")?.href;
    if (canonical) return resolveUrl(canonical);
    if (isNoIndex) return undefined;
    return resolveUrl(pathname);
  })();
  const normalizedLinks = links.map((link) => (link.rel === "canonical" && link.href ? { ...link, href: resolveUrl(link.href) } : link));
  const mergedLinks = canonicalHref && !normalizedLinks.some((link) => link.rel === "canonical")
    ? [...normalizedLinks, { rel: "canonical", href: canonicalHref }]
    : normalizedLinks;
  const hasMeta = (predicate: (t: Record<string, string>) => boolean) => meta.some(predicate);
  const mergedMeta = [
    ...meta,
    ...(hasMeta((t) => "title" in t) ? [] : [{ title }]),
    ...(hasMeta((t) => t.name === "description") ? [] : [{ name: "description", content: description }]),
    ...(hasMeta((t) => t.property === "og:title") ? [] : [{ property: "og:title", content: title }]),
    ...(hasMeta((t) => t.property === "og:description") ? [] : [{ property: "og:description", content: description }]),
    ...(hasMeta((t) => t.property === "og:type") ? [] : [{ property: "og:type", content: ogType }]),
    ...(hasMeta((t) => t.property === "og:site_name") ? [] : [{ property: "og:site_name", content: SITE.name }]),
    ...(hasMeta((t) => t.property === "og:url") ? [] : canonicalHref ? [{ property: "og:url", content: canonicalHref }] : []),
    ...(ogImage && !hasMeta((t) => t.property === "og:image") ? [{ property: "og:image", content: ogImage }] : []),
    ...(hasMeta((t) => t.name === "twitter:card") ? [] : [{ name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" }]),
    ...(hasMeta((t) => t.name === "twitter:title") ? [] : [{ name: "twitter:title", content: title }]),
    ...(hasMeta((t) => t.name === "twitter:description") ? [] : [{ name: "twitter:description", content: description }]),
    ...(ogImage && !hasMeta((t) => t.name === "twitter:image") ? [{ name: "twitter:image", content: ogImage }] : []),
  ];
  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {mergedMeta.map((t, i) => {
        if ("title" in t) return null;
        if ("name" in t) return <meta key={`n-${i}`} name={t.name} content={t.content ?? ""} />;
        if ("property" in t) return <meta key={`p-${i}`} property={t.property} content={t.content ?? ""} />;
        if ("charSet" in t) return <meta key={`c-${i}`} charSet={t.charSet} />;
        return null;
      })}
      {mergedLinks.map((l, i) => <link key={`l-${i}`} {...l} />)}
      {scripts.map((s, i) => {
        const { children, ...attrs } = s as Record<string, unknown> & { children?: string };
        return <script key={`s-${i}`} {...attrs}>{children ?? null}</script>;
      })}
    </Helmet>
  );
}

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin =
    pathname.startsWith("/vks") ||
    pathname.startsWith("/vks/dashboard") ||
    pathname.startsWith("/admin");
  return (
    <>
      <HeadSync />
      {!isAdmin && <Navbar />}
      <main className={isAdmin ? "min-h-screen" : "min-h-screen pt-16"}>
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
      <Toaster />
    </>
  );
}
