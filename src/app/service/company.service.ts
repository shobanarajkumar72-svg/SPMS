// services/company.service.ts
import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Company, Job } from '../models/spms';

const K = StorageService.KEYS;

@Injectable({ providedIn: 'root' })
export class CompanyService {
  companies = signal<Company[]>([]);
  jobs = signal<Job[]>([]);

  constructor(private storage: StorageService) {
    this.loadCompanies();
    this.loadJobs();
  }

  // ── Companies ─────────────────────────────────
  private loadCompanies(): void {
    this.companies.set(this.storage.get<Company[]>(K.COMPANIES) ?? []);
  }

  getAllCompanies(): Company[] {
    return this.storage.get<Company[]>(K.COMPANIES) ?? [];
  }

  getCompanyById(id: string): Company | undefined {
    return this.getAllCompanies().find(c => c.id === id);
  }

getCompanyByUserId(userId: string): Company | undefined {

  console.log("Searching User ID:", userId);

  console.log("All Companies:", this.getAllCompanies());

  return this.getAllCompanies().find(c => c.userId === userId);

}

  searchCompanies(term: string): Company[] {
    const t = term.toLowerCase().trim();
    if (!t) return this.getAllCompanies();
    return this.getAllCompanies().filter(c =>
      c.name.toLowerCase().includes(t) ||
      c.industry?.toLowerCase().includes(t) ||
      c.email?.toLowerCase().includes(t)
    );
  }

  createCompany(company: Omit<Company, 'id' | 'createdAt' | 'verified'>): Company {
    const all = this.getAllCompanies();
    const newCompany: Company = {
      ...company,
      id: `comp-${Date.now()}`,
      verified: false,
      createdAt: new Date().toISOString()
    };
    this.storage.set(K.COMPANIES, [...all, newCompany]);
    this.loadCompanies();
    return newCompany;
  }

  updateCompany(id: string, data: Partial<Company>): Company | null {
    const all = this.getAllCompanies();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    this.storage.set(K.COMPANIES, all);
    this.loadCompanies();
    return all[idx];
  }

  deleteCompany(id: string): void {
    this.storage.set(K.COMPANIES, this.getAllCompanies().filter(c => c.id !== id));
    this.loadCompanies();
  }

  verifyCompany(id: string): void {
    this.updateCompany(id, { verified: true });
  }

  // ── Jobs ──────────────────────────────────────
  private loadJobs(): void {
    this.jobs.set(this.storage.get<Job[]>(K.JOBS) ?? []);
  }

  getAllJobs(): Job[] {
    return this.storage.get<Job[]>(K.JOBS) ?? [];
  }

  getJobById(id: string): Job | undefined {
    return this.getAllJobs().find(j => j.id === id);
  }

  getJobsByCompany(companyId: string): Job[] {
    return this.getAllJobs().filter(j => j.companyId === companyId);
  }

  getOpenJobs(): Job[] {
    return this.getAllJobs().filter(j => j.status === 'open');
  }

  createJob(job: Omit<Job, 'id' | 'createdAt'>): Job {
    const all = this.getAllJobs();
    const newJob: Job = {
      ...job,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.storage.set(K.JOBS, [...all, newJob]);
    this.loadJobs();
    return newJob;
  }

  updateJob(id: string, data: Partial<Job>): Job | null {
    const all = this.getAllJobs();
    const idx = all.findIndex(j => j.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    this.storage.set(K.JOBS, all);
    this.loadJobs();
    return all[idx];
  }

  deleteJob(id: string): void {
    this.storage.set(K.JOBS, this.getAllJobs().filter(j => j.id !== id));
    this.loadJobs();
  }
}