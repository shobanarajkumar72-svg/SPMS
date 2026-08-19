// service/job.service.ts
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Job } from '../models/spms';

const K = StorageService.KEYS;

@Injectable({ providedIn: 'root' })
export class JobService {

  constructor(private storage: StorageService) { }

  getAll(): Job[] {
    return this.storage.get<Job[]>(K.JOBS) ?? [];
  }

  getById(id: string): Job | undefined {
    return this.getAll().find(j => j.id === id);
  }

  getByCompany(companyId: string): Job[] {
    return this.getAll().filter(j => j.companyId === companyId);
  }

  getOpen(): Job[] {
    return this.getAll().filter(j => j.status === 'open');
  }

  add(data: Omit<Job, 'id' | 'createdAt'>): Job {
    const all = this.getAll();
    const job: Job = {
      ...data,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.storage.set(K.JOBS, [...all, job]);
    return job;
  }

  update(updated: Job): void {
    const all = this.getAll();
    const idx = all.findIndex(j => j.id === updated.id);
    if (idx !== -1) {
      all[idx] = updated;
      this.storage.set(K.JOBS, all);
    }
  }

  delete(id: string): void {
    this.storage.set(K.JOBS, this.getAll().filter(j => j.id !== id));
  }

  search(term: string): Job[] {
    const t = term.toLowerCase().trim();
    if (!t) return this.getAll();
    return this.getAll().filter(j =>
      j.title.toLowerCase().includes(t) ||
      j.companyName.toLowerCase().includes(t) ||
      j.location.toLowerCase().includes(t)
    );
  }

  filterByStatus(status: Job['status'] | 'all'): Job[] {
    if (status === 'all') return this.getAll();
    return this.getAll().filter(j => j.status === status);
  }
}