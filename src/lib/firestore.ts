// Firestore-backed data layer. Replaces the old Cloudflare Worker API client.
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc,
  query, orderBy, where, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ---------- Types ----------
export type ApplicationStatus = "NEW" | "PENDING" | "REVIEWED" | "INTERVIEW" | "REJECTED" | "SELECTED" | "SHORTLISTED" | "HIRED";

export interface Application {
  id: string;
  jobId?: string;
  jobTitle?: string;
  role?: string;
  fullName?: string;
  name?: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: string;
  location?: string;
  currentPlace?: string;
  state?: string;
  country?: string;
  education?: string;
  qualification?: string;
  college?: string;
  university?: string;
  graduationYear?: string;
  passingYear?: string;
  cgpa?: string;
  skills?: string;
  experience?: string;
  currentCompany?: string;
  currentRole?: string;
  expectedSalary?: string;
  workMode?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  coverLetter?: string;
  resumeUrl?: string;
  resumeKey?: string;
  status: ApplicationStatus;
  notes?: string;
  createdAt?: string;
}

export interface JobOpening {
  id: string;
  title: string;
  department?: string;
  description?: string;
  skills?: string;
  experience?: string;
  salary?: string;
  salaryRange?: string;
  type?: string;
  employmentType?: string;
  remote?: boolean;
  location?: string;
  published?: boolean;
  archived?: boolean;
  createdAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category?: string;
  shortDescription?: string;
  content: string;
  featuredImage?: string;
  author?: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSettings {
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}

function tsToString(v: unknown): string | undefined {
  if (!v) return undefined;
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (typeof v === "string") return v;
  return undefined;
}

function normalize<T extends { id: string }>(id: string, data: Record<string, unknown>): T {
  return {
    id,
    ...data,
    createdAt: tsToString(data.createdAt) ?? (typeof data.createdAt === "string" ? data.createdAt : undefined),
    updatedAt: tsToString(data.updatedAt),
  } as unknown as T;
}

// ---------- Applications ----------
export const applications = {
  list: async (): Promise<Application[]> => {
    const snap = await getDocs(query(collection(db, "applications"), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => normalize<Application>(d.id, d.data()));
  },
  create: async (data: Omit<Application, "id" | "status" | "createdAt"> & { status?: ApplicationStatus }) => {
    const ref = await addDoc(collection(db, "applications"), {
      ...data,
      status: data.status ?? "PENDING",
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },
  update: async (id: string, patch: Partial<Application>) => {
    await updateDoc(doc(db, "applications", id), { ...patch, updatedAt: serverTimestamp() });
  },
  remove: async (id: string) => {
    await deleteDoc(doc(db, "applications", id));
  },
};

// ---------- Jobs ----------
export const jobs = {
  list: async (): Promise<JobOpening[]> => {
    const snap = await getDocs(query(collection(db, "jobs"), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => normalize<JobOpening>(d.id, d.data()));
  },
  listOpen: async (): Promise<JobOpening[]> => {
    const all = await jobs.list();
    return all.filter((j) => !j.archived && j.published !== false);
  },
  create: async (data: Omit<JobOpening, "id" | "createdAt">) => {
    const ref = await addDoc(collection(db, "jobs"), { ...data, createdAt: serverTimestamp() });
    return ref.id;
  },
  update: async (id: string, patch: Partial<JobOpening>) => {
    await updateDoc(doc(db, "jobs", id), patch);
  },
  remove: async (id: string) => {
    await deleteDoc(doc(db, "jobs", id));
  },
};

// ---------- Blogs ----------
export const blogs = {
  list: async (): Promise<BlogPost[]> => {
    const snap = await getDocs(query(collection(db, "blogs"), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => normalize<BlogPost>(d.id, d.data()));
  },
  listPublished: async (): Promise<BlogPost[]> => {
    const all = await blogs.list();
    return all.filter((b) => b.published);
  },
  getBySlug: async (slug: string): Promise<BlogPost | null> => {
    const snap = await getDocs(query(collection(db, "blogs"), where("slug", "==", slug)));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return normalize<BlogPost>(d.id, d.data());
  },
  create: async (data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => {
    const ref = await addDoc(collection(db, "blogs"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },
  update: async (id: string, patch: Partial<BlogPost>) => {
    await updateDoc(doc(db, "blogs", id), { ...patch, updatedAt: serverTimestamp() });
  },
  remove: async (id: string) => {
    await deleteDoc(doc(db, "blogs", id));
  },
};

// ---------- Settings ----------
const SETTINGS_DOC = doc(db, "settings", "site");
export const settings = {
  get: async (): Promise<SiteSettings> => {
    const snap = await getDoc(SETTINGS_DOC);
    return (snap.exists() ? (snap.data() as SiteSettings) : {});
  },
  save: async (data: SiteSettings) => {
    await setDoc(SETTINGS_DOC, data, { merge: true });
  },
};

export function resumeUrl(a: Application): string | null {
  return a.resumeUrl ?? null;
}
