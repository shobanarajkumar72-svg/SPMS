// services/storage.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {

  // ── Generic helpers ──────────────────────────
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }

  // ── Keys ─────────────────────────────────────
  static readonly KEYS = {
  USERS: 'spms_users',
  CURRENT_USER: 'spms_current_user',
  STUDENTS: 'spms_students',
  COMPANIES: 'spms_companies',
  JOBS: 'spms_jobs',
  APPLICATIONS: 'spms_applications',
  PLACEMENTS: 'spms_placements',
  NOTIFICATIONS: 'spms_notifications',
  OFFERS: 'spms_offers',
};
}