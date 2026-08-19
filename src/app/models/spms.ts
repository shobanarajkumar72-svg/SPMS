// models/models.ts

export type UserRole = 'admin' | 'student' | 'company';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;   // stored as plain text (localStorage demo only)
  role: UserRole;
  createdAt: string;
}

export interface Student {
  rollNo: any;
  placementStatus: string;
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  batch: string;         // e.g. "2024"
  cgpa: number;
  skills: string[];      // ["Angular","Java",...]
  resumeUrl: string;     // base64 or URL string
  status: 'available' | 'placed' | 'not_eligible';
  appliedJobs: string[]; // job IDs
  placedCompany?: string;
  createdAt: string;
  gender:string;
  tenthPercent:number;
  twelthPercent:number;
}

export interface Company {
  contactPerson: any;
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  industry: string;
  website: string;
  description: string;
  logoUrl: string;
  verified: boolean;
  createdAt: string;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  skills: string[];
  salary: string;
  location: string;
  type: 'fulltime' | 'internship' | 'parttime';
  minCgpa: number;
  eligibleBatches: string[];
  deadline: string;
  status: 'open' | 'closed';
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  companyName: string;
  jobTitle: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'selected';
  appliedAt: string;
  updatedAt: string;

    // Resume
  resumeData?: string;
  resumeName?: string;
}

export interface Placement {
  id: string;
  studentId: string;
  studentName: string;
  companyId: string;
  companyName: string;
  jobTitle: string;
  salary: string;
  joiningDate: string;
  createdAt: string;
}
export interface Notification {
  id: string;
  studentId: string;
  companyName: string;
  subject: string;
  message: string;
  type: 'offer' | 'interview' | 'shortlist' | 'rejection' | 'application';
  date: string;
  isRead: boolean;
  
}
export interface OfferLetter {
  id: string;
  studentId: string;
  companyId: string;
  companyName: string;
  jobTitle: string;
  salary: string;
  joiningDate: string;
  message: string;
  sentAt: string;
}