// services/student.service.ts
import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Student } from '../models/spms';

const K = StorageService.KEYS;

@Injectable({ providedIn: 'root' })
export class StudentService {
  constructor(private storage: StorageService) { }

  getAll(): Student[] {
    return this.storage.get<Student[]>(K.STUDENTS) ?? [];
  }

  getById(id: string): Student | undefined {
    return this.getAll().find(s => s.id === id);
  }

  getByUserId(userId: string): Student | undefined {
    return this.getAll().find(s => s.userId === userId);
  }
getCurrentStudent(): Student | null {
  const currentUser = this.storage.get<any>(K.CURRENT_USER);

  if (!currentUser) {
    return null;
  }

  return this.getAll().find(s => s.userId === currentUser.id) ?? null;
}
  create(student: Omit<Student, 'id' | 'createdAt'>): Student {
    const all = this.getAll();
    const newStudent: Student = {
      ...student,
      id: `stu-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.storage.set(K.STUDENTS, [...all, newStudent]);
    return newStudent;
  }

  update(id: string, data: Partial<Student>): Student | null {
    const all = this.getAll();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    this.storage.set(K.STUDENTS, all);
    return all[idx];
  }

  delete(id: string): void {
    this.storage.set(K.STUDENTS, this.getAll().filter(s => s.id !== id));
  }

  getStats() {
    const all = this.getAll();
    return {
      total: all.length,
      placed: all.filter(s => s.status === 'placed').length,
      available: all.filter(s => s.status === 'available').length,
      notEligible: all.filter(s => s.status === 'not_eligible').length,
    };
  }
}