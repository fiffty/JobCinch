import { create } from 'zustand';
import type { Resume } from '../types/resume';

const resumeModules = import.meta.glob('../resumes/*.json', {
  eager: true,
}) as Record<string, { default: Resume }>;

const resumes: Resume[] = Object.values(resumeModules).map((mod) => mod.default);

interface ResumeStore {
  resumes: Resume[];
  getResumeById: (id: string) => Resume | undefined;
}

export const useResumeStore = create<ResumeStore>(() => ({
  resumes,
  getResumeById: (id: string) => resumes.find((resume) => resume.id === id),
}));
