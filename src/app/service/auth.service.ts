// services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { User, UserRole } from '../models/spms';

const K = StorageService.KEYS;

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private storage: StorageService, private router: Router) {
    this._seedAdmin();
  }

  // ── Seed default admin ───────────────────────
  private _seedAdmin(): void {
    const users = this.storage.get<User[]>(K.USERS) ?? [];
    const hasAdmin = users.some(u => u.role === 'admin');
    if (!hasAdmin) {
      const admin: User = {
        id: 'admin-001',
        name: 'Admin',
        email: 'admin@spms.com',
        password: 'Admin@123',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      this.storage.set(K.USERS, [...users, admin]);
    }
  }

  // ── Register ─────────────────────────────────
  register(name: string, email: string, password: string, role: UserRole): { success: boolean; message: string; user?: User } {
    const users = this.storage.get<User[]>(K.USERS) ?? [];
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already registered.' };
    }
    const user: User = {
      id: `user-${Date.now()}`,
      name, email, password, role,
      createdAt: new Date().toISOString()
    };
    this.storage.set(K.USERS, [...users, user]);
    return { success: true, message: 'Registered successfully!',user };
  }

  // ── Login ─────────────────────────────────────
  login(email: string, password: string): { success: boolean; message: string; user?: User } {
    const users = this.storage.get<User[]>(K.USERS) ?? [];
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, message: 'Invalid email or password.' };
    this.storage.set(K.CURRENT_USER, user);
    return { success: true, message: 'Login successful!', user };
  }

  // ── Logout ────────────────────────────────────
  logout(): void {
    this.storage.remove(K.CURRENT_USER);
    this.router.navigate(['/login']);
  }

  // ── Current User ──────────────────────────────
  getCurrentUser(): User | null {
    return this.storage.get<User>(K.CURRENT_USER);
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  getRole(): UserRole | null {
    return this.getCurrentUser()?.role ?? null;
  }

  isAdmin(): boolean { return this.getRole() === 'admin'; }
  isStudent(): boolean { return this.getRole() === 'student'; }
  isCompany(): boolean { return this.getRole() === 'company'; }
}