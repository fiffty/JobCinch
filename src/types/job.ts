export interface ContactInfo {
  name: string;
  link: string;
  conversationSummary: string;
}

export interface JobStatus {
  appliedAt: string;
  introCallAt: string;
  interviewsAt: string[];
  receivedOfferAt: string;
}

export interface Job {
  id: string;
  link: string;
  company: string;
  jobTitle: string;
  currency: string;
  salaryMin: number;
  salaryMax: number;
  rsu: number;
  stockOption: string;
  bonus: string;
  remote: string;
  city: string;
  country: string;
  address: string[];
  visaSponsorship: boolean;
  companyDescription: string;
  teamDescription: string;
  responsibilities: string[];
  perks: string[];
  keyAttributes: string[];
  referrer: ContactInfo;
  pointOfContact: ContactInfo;
  status: JobStatus;
}
