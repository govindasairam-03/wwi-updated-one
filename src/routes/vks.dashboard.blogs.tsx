import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { blogs, type BlogPost } from "../lib/firestore";

export const Route = createFileRoute("/vks/dashboard/blogs")({
  component: BlogsPage,
});

type BlogForm = Omit<BlogPost, "id" | "createdAt" | "updatedAt">;

const empty: BlogForm = {
  title: "", slug: "", category: "", shortDescription: "", content: "",
  featuredImage: "", author: "WWI Team", published: false,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function BlogsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["blogs"], queryFn: blogs.list });
  const [editing, setEditing] = useState<BlogPost | "new" | null>(null);

  const create = useMutation({
    mutationFn: (b: BlogForm) => blogs.create(b),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["blogs"] }); toast.success("Created"); setEditing(null); },
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<BlogPost> }) => blogs.update(id, patch),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["blogs"] }); toast.success("Saved"); setEditing(null); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => blogs.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["blogs"] }); toast.success("Deleted"); },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blogs</h1>
        <button onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 bg-foreground text-background rounded-full px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground border-b border-border">
            <tr><th className="text-left p-3">Image</th><th className="text-left p-3">Title</th><th className="text-left p-3 hidden md:table-cell">Slug</th><th className="text-left p-3">Published</th><th className="text-left p-3 hidden md:table-cell">Created</th><th className="text-left p-3">Actions</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>}
            {!isLoading && (data ?? []).length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No posts yet.</td></tr>}
            {(data ?? []).map((b) => (
              <tr key={b.id} className="border-b border-border last:border-0">
                <td className="p-3">{b.featuredImage ? <img src={b.featuredImage} alt="" className="w-12 h-12 rounded object-cover" loading="lazy" /> : <div className="w-12 h-12 rounded bg-secondary" />}</td>
                <td className="p-3 font-medium">{b.title}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">{b.slug}</td>
                <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${b.published ? "bg-foreground text-background" : "bg-secondary"}`}>{b.published ? "Yes" : "No"}</span></td>
                <td className="p-3 hidden md:table-cell text-xs text-muted-foreground">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}</td>
                <td className="p-3 flex gap-1">
                  <Link to="/blogs/$slug" params={{ slug: b.slug }} target="_blank" className="p-1.5 rounded hover:bg-secondary"><Eye className="w-4 h-4" /></Link>
                  <button onClick={() => setEditing(b)} className="p-1.5 rounded hover:bg-secondary"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { if (confirm(`Delete "${b.title}"?`)) remove.mutate(b.id); }} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <BlogModal
          initial={editing === "new" ? empty : editing}
          onClose={() => setEditing(null)}
          onSubmit={(f) => {
            if (editing === "new") create.mutate(f);
            else update.mutate({ id: editing.id, patch: f });
          }}
        />
      )}
    </div>
  );
}

function BlogModal({ initial, onClose, onSubmit }: { initial: BlogForm | BlogPost; onClose: () => void; onSubmit: (f: BlogForm) => void }) {
  const [f, setF] = useState<BlogForm>({
    title: initial.title ?? "",
    slug: initial.slug ?? "",
    category: initial.category ?? "",
    shortDescription: initial.shortDescription ?? "",
    content: initial.content ?? "",
    featuredImage: initial.featuredImage ?? "",
    author: initial.author ?? "WWI Team",
    published: initial.published ?? false,
  });
  const set = <K extends keyof BlogForm>(k: K, v: BlogForm[K]) => setF((p) => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="bg-background rounded-2xl w-full max-w-3xl border border-border max-h-[92vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h3 className="font-semibold">{(initial as BlogPost).id ? "Edit Post" : "New Post"}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 overflow-y-auto space-y-3">
          <Field label="Title *" value={f.title} onChange={(v) => { set("title", v); if (!(initial as BlogPost).id) set("slug", slugify(v)); }} />
          <Field label="Slug *" value={f.slug} onChange={(v) => set("slug", slugify(v))} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Category" value={f.category ?? ""} onChange={(v) => set("category", v)} />
            <Field label="Author" value={f.author ?? ""} onChange={(v) => set("author", v)} />
          </div>
          <Field label="Featured Image URL" value={f.featuredImage ?? ""} onChange={(v) => set("featuredImage", v)} />
          <label className="block">
            <span className="text-xs text-muted-foreground">Short Description</span>
            <textarea value={f.shortDescription ?? ""} onChange={(e) => set("shortDescription", e.target.value)} rows={2}
              className="mt-1 w-full bg-card border border-border rounded-lg px-3 py-2 text-sm resize-none" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Content (Markdown or HTML)</span>
            <textarea value={f.content} onChange={(e) => set("content", e.target.value)} rows={12}
              className="mt-1 w-full bg-card border border-border rounded-lg px-3 py-2 text-sm font-mono resize-y" />
          </label>
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} /> Published</label>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-full border border-border text-sm">Cancel</button>
          <button onClick={() => { if (!f.title.trim() || !f.slug.trim()) { toast.error("Title & slug required"); return; } onSubmit(f); }}
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
