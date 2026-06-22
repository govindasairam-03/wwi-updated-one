// Compatibility shim — old code imports `api`, `resumeUrl`, types from here.
// All logic now lives in src/lib/firestore.ts.
export {
  type Application,
  type ApplicationStatus,
  type JobOpening,
  resumeUrl,
} from "./firestore";

import { applications, jobs } from "./firestore";

export const api = {
  listApplications: applications.list,
  updateApplication: (id: string, patch: Parameters<typeof applications.update>[1]) =>
    applications.update(id, patch),
  deleteApplication: applications.remove,
  listJobs: jobs.list,
  createJob: jobs.create,
  updateJob: jobs.update,
  deleteJob: jobs.remove,
};
