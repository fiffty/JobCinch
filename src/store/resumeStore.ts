import { create } from 'zustand';
import type { Resume } from '../types/resume';

const resumeModules = import.meta.glob('../resumes/*.json', {
  eager: true,
}) as Record<string, { default: Resume }>;

const resumes: Resume[] = Object.values(resumeModules).map((mod) => mod.default);

interface ResumeStore {
  resumes: Resume[];
  getResumeById: (id: string) => Resume | undefined;
  deleteResume: (resumeId: string) => void;
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  resumes,
  getResumeById: (id: string) => get().resumes.find((resume) => resume.id === id),
  deleteResume: (resumeId) => {
    set((state) => ({
      resumes: state.resumes.filter((r) => r.id !== resumeId),
    }));
  },
}));
