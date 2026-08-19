// services/application.service.ts
import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Application, Placement } from '../models/spms';
import { NotificationService } from './notification.service';

const K = StorageService.KEYS;

@Injectable({ providedIn: 'root' })
export class ApplicationService {
constructor(
  private storage: StorageService,
  private notificationService: NotificationService
) {}

  // ── Applications ──────────────────────────────
  getAll(): Application[] {
    return this.storage.get<Application[]>(K.APPLICATIONS) ?? [];
  }

  getById(id: string): Application | undefined {
    return this.getAll().find(a => a.id === id);
  }

  getByStudent(studentId: string): Application[] {
    return this.getAll().filter(a => a.studentId === studentId);
  }

  getByJob(jobId: string): Application[] {
    return this.getAll().filter(a => a.jobId === jobId);
  }

  getByCompany(companyName: string): Application[] {
    return this.getAll().filter(a => a.companyName === companyName);
  }

  hasApplied(studentId: string, jobId: string): boolean {
    return this.getAll().some(a => a.studentId === studentId && a.jobId === jobId);
  }

  apply(app: Omit<Application, 'id' | 'appliedAt' | 'updatedAt' | 'status'>): Application {
    const all = this.getAll();
    const newApp: Application = {
      ...app,
      id: `app-${Date.now()}`,
      status: 'applied',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.storage.set(K.APPLICATIONS, [...all, newApp]);
    return newApp;
  }

  updateStatus(id: string, status: Application['status']): Application | null {

  const all = this.getAllApplications();

  const index = all.findIndex(x => x.id === id);

  if (index === -1) {
    return null;
  }

  all[index] = {
    ...all[index],
    status,
    updatedAt: new Date().toISOString()
  };

  this.storage.set(K.APPLICATIONS, all);

  this.loadApplications();

  return all[index];

}
  delete(id: string): void {
    this.storage.set(K.APPLICATIONS, this.getAll().filter(a => a.id !== id));
  }

  getStats() {
    const all = this.getAll();
    return {
      total: all.length,
      applied: all.filter(a => a.status === 'applied').length,
      shortlisted: all.filter(a => a.status === 'shortlisted').length,
      selected: all.filter(a => a.status === 'selected').length,
      rejected: all.filter(a => a.status === 'rejected').length,
    };
  }

  // ── Placements ────────────────────────────────
  getAllPlacements(): Placement[] {
    return this.storage.get<Placement[]>(K.PLACEMENTS) ?? [];
  }

  createPlacement(placement: Omit<Placement, 'id' | 'createdAt'>): Placement {
    const all = this.getAllPlacements();
    const newPlacement: Placement = {
      ...placement,
      id: `plc-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.storage.set(K.PLACEMENTS, [...all, newPlacement]);
    return newPlacement;
  }

  deletePlacement(id: string): void {
    this.storage.set(K.PLACEMENTS, this.getAllPlacements().filter(p => p.id !== id));
  }

  applications = signal<Application[]>([]);


  private loadApplications(): void {
    this.applications.set(this.storage.get<Application[]>(K.APPLICATIONS) ?? []);
  }

  getAllApplications(): Application[] {
    return this.storage.get<Application[]>(K.APPLICATIONS) ?? [];
  }

  getApplicationById(id: string): Application | undefined {
    return this.getAllApplications().find(a => a.id === id);
  }

  getApplicationsByJob(jobId: string): Application[] {
    return this.getAllApplications().filter(a => a.jobId === jobId);
  }

  getApplicationsByStudent(studentId: string): Application[] {
    return this.getAllApplications().filter(a => a.studentId === studentId);
  }

  createApplication(data: Omit<Application, 'id' | 'appliedAt' | 'updatedAt' | 'status'>): Application {
    const all = this.getAllApplications();
    const now = new Date().toISOString();
    const newApp: Application = {
      ...data,
      id: `app-${Date.now()}`,
      status: 'applied',
      appliedAt: now,
      updatedAt: now
    };
    this.storage.set(K.APPLICATIONS, [...all, newApp]);
    this.loadApplications();
    return newApp;
  }

  updateApplication(id: string, data: Partial<Application>): Application | null {
    const all = this.getAllApplications();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    this.storage.set(K.APPLICATIONS, all);
    this.loadApplications();
    return all[idx];
  }
  
  deleteApplication(id: string): void {
    this.storage.set(K.APPLICATIONS, this.getAllApplications().filter(a => a.id !== id));
    this.loadApplications();
  }

  searchApplications(term: string): Application[] {
    const t = term.toLowerCase().trim();
    if (!t) return this.getAllApplications();
    return this.getAllApplications().filter(a =>
      a.studentName.toLowerCase().includes(t) ||
      a.companyName.toLowerCase().includes(t) ||
      a.jobTitle.toLowerCase().includes(t)
    );
  }

  filterByStatus(status: Application['status'] | 'all'): Application[] {
    if (status === 'all') return this.getAllApplications();
    return this.getAllApplications().filter(a => a.status === status);
  }

  // Current student's latest application
getLatestApplication(studentId: string): Application | null {
  const apps = this.getApplicationsByStudent(studentId);

  if (apps.length === 0) {
    return null;
  }

  return apps.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
}

// Current student's placement
getPlacementByStudent(studentId: string): Placement | null {
  return this.getAllPlacements().find(p => p.studentId === studentId) ?? null;
}
}