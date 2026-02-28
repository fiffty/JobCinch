import { create } from 'zustand';
import type { Job } from '../types/job';

const jobModules = import.meta.glob('../jobs/*.json', { eager: true }) as Record<string, { default: Job }>;

const jobs: Job[] = Object.values(jobModules).map((mod) => mod.default);

interface JobStore {
  jobs: Job[];
  getJobById: (id: string) => Job | undefined;
}

export const useJobStore = create<JobStore>(() => ({
  jobs,
  getJobById: (id: string) => jobs.find((job) => job.id === id),
}));
