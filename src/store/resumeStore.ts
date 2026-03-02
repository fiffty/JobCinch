import { create } from 'zustand';
import type { Resume } from '../types/resume';

const DELETED_KEY = 'deletedResumeIds';

function loadDeletedResumeIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDeletedResumeIds(ids: Set<string>) {
  localStorage.setItem(DELETED_KEY, JSON.stringify([...ids]));
}

const resumeModules = import.meta.glob('../resumes/*.json', {
  eager: true,
}) as Record<string, { default: Resume }>;

const deletedResumeIds = loadDeletedResumeIds();
const resumes: Resume[] = Object.values(resumeModules)
  .map((mod) => mod.default)
  .filter((r) => !deletedResumeIds.has(r.id!));

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
    const ids = loadDeletedResumeIds();
    ids.add(resumeId);
    saveDeletedResumeIds(ids);
  },
}));
