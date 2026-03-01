export type RemotePreference = boolean | "full" | "hybrid" | "on-site";

export interface LinkItem {
  label?: string;
  url?: string;
}

export interface ResumeLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  other?: LinkItem[];
}

export interface ResumeLocation {
  city?: string;
  country?: string;
  remote?: RemotePreference;
}

export interface ImpactEntry {
  challenge?: string;
  action?: string;
  result?: string;
  metric?: string;
  scope?: string;
  skills?: string[];
  links?: string[];
}

export interface ExperienceEntry {
  company?: string;
  jobTitle?: string;
  startDate?: string;
  endDate?: string;
  city?: string;
  country?: string;
  remote?: RemotePreference;
  description?: string;
  impactEntries?: ImpactEntry[];
  highlights?: string[];
  skills?: string[];
}

export interface EducationEntry {
  institution?: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: number;
  highlights?: string[];
}

export interface SkillEntry {
  name?: string;
  level?: string;
  lastUsed?: string;
  tags?: string[];
  evidence?: string[];
}

export interface ProjectEntry {
  name?: string;
  link?: string;
  description?: string;
  impactEntries?: ImpactEntry[];
  highlights?: string[];
  skills?: string[];
}

export interface CertificationEntry {
  name?: string;
  issuer?: string;
  issuedAt?: string;
  expiresAt?: string;
  link?: string;
}

export interface SignificantItem {
  title?: string;
  kind?: string;
  summary?: string;
  impact?: string;
  date?: string;
  links?: string[];
  tags?: string[];
  evidence?: string[];
}

export interface Resume {
  id?: string;
  metaTitle?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: ResumeLocation;
  links?: ResumeLinks;
  summary?: string;
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  skills?: SkillEntry[];
  projects?: ProjectEntry[];
  certifications?: CertificationEntry[];
  significantItems?: SignificantItem[];
}
