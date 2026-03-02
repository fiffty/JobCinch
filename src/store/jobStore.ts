import { create } from 'zustand';
import type { Job, JobStatus } from '../types/job';

const STORAGE_KEY = 'jobStatusOverrides';
const DELETED_KEY = 'deletedJobIds';

function loadStatusOverrides(): Record<string, Partial<JobStatus>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStatusOverrides(overrides: Record<string, Partial<JobStatus>>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

function loadDeletedJobIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDeletedJobIds(ids: Set<string>) {
  localStorage.setItem(DELETED_KEY, JSON.stringify([...ids]));
}

const jobModules = import.meta.glob('../jobs/*.json', { eager: true }) as Record<string, { default: Job }>;

const overrides = loadStatusOverrides();
const deletedJobIds = loadDeletedJobIds();
const jobs: Job[] = Object.values(jobModules)
  .map((mod) => {
    const job = mod.default;
    if (overrides[job.id]) {
      return { ...job, status: { ...job.status, ...overrides[job.id] } };
    }
    return job;
  })
  .filter((job) => !deletedJobIds.has(job.id));

interface JobStore {
  jobs: Job[];
  getJobById: (id: string) => Job | undefined;
  updateJobStatus: (jobId: string, field: keyof JobStatus, value: string | string[]) => void;
  deleteJob: (jobId: string) => void;
}

export const useJobStore = create<JobStore>((set, get) => ({
  jobs,
  getJobById: (id: string) => get().jobs.find((job) => job.id === id),
  updateJobStatus: (jobId, field, value) => {
    set((state) => {
      const updatedJobs = state.jobs.map((job) =>
        job.id === jobId
          ? { ...job, status: { ...job.status, [field]: value } }
          : job
      );
      return { jobs: updatedJobs };
    });

    // Persist to localStorage
    const currentOverrides = loadStatusOverrides();
    const existing = currentOverrides[jobId] ?? {};
    currentOverrides[jobId] = { ...existing, [field]: value };
    saveStatusOverrides(currentOverrides);
  },
  deleteJob: (jobId) => {
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== jobId),
    }));
    const ids = loadDeletedJobIds();
    ids.add(jobId);
    saveDeletedJobIds(ids);
    // Clean up status overrides
    const currentOverrides = loadStatusOverrides();
    delete currentOverrides[jobId];
    saveStatusOverrides(currentOverrides);
  },
}));
