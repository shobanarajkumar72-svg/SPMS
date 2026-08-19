import { Injectable, signal, computed } from '@angular/core';

/**
 * Status lifecycle for a placement record.
 * Selected -> student has cleared the process, offer issued.
 * Joined   -> student has confirmed / joined the company.
 * Pending  -> process is still in progress (interview / result awaited).
 */
export type PlacementStatus = 'Selected' | 'Joined' | 'Pending';

export type ApplicationStatus =
  'Applied'
  | 'Shortlisted'
  | 'Selected'
  | 'Rejected';

export interface Placement {

  id: string;

  studentName: string;
  registerNumber: string;
  department: string;
  batch: string;

  email: string;
  phone: string;
  cgpa: number;

  companyName: string;
  jobRole: string;
  packageLPA: number;

  appliedDate: string;
  placementDate: string;

  applicationStatus: ApplicationStatus;

  status: PlacementStatus;

  offerLetterName?: string;
  offerLetterData?: string;

  createdAt: string;
  updatedAt: string;

}
export type PlacementInput = Omit<Placement, 'id' | 'createdAt' | 'updatedAt'>;

const STORAGE_KEY = 'spms.placements';

@Injectable({ providedIn: 'root' })
export class PlacementService {
  /** Central reactive store of all placement records. */
  private readonly _placements = signal<Placement[]>(this.loadFromStorage());

  /** Read-only view for components. */
  readonly placements = this._placements.asReadonly();

  /** Dashboard stats derived reactively from the store. */
  readonly totalPlacements = computed(() => this._placements().length);

  readonly highestPackage = computed(() => {
    const list = this._placements();
    return list.length ? Math.max(...list.map(p => p.packageLPA)) : 0;
  });

  readonly averagePackage = computed(() => {
    const list = this._placements();
    if (!list.length) return 0;
    const total = list.reduce((sum, p) => sum + p.packageLPA, 0);
    return Math.round((total / list.length) * 100) / 100;
  });

  readonly companiesVisited = computed(() => {
    const names = new Set(this._placements().map(p => p.companyName.trim().toLowerCase()));
    return names.size;
  });

  readonly appliedStudents=computed(()=>{

return this._placements()
.filter(x=>x.applicationStatus==='Applied')
.length;

});

readonly shortlistedStudents=computed(()=>{

return this._placements()
.filter(x=>x.applicationStatus==='Shortlisted')
.length;

});

readonly selectedStudents=computed(()=>{

return this._placements()
.filter(x=>x.applicationStatus==='Selected')
.length;

});

readonly rejectedStudents=computed(()=>{

return this._placements()
.filter(x=>x.applicationStatus==='Rejected')
.length;

});

  // ---------- Persistence ----------

  private loadFromStorage(): Placement[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return [];
      }

      return JSON.parse(raw) as Placement[];
    } catch {
      return [];
    }
  }

  private persist(list: Placement[]): void {
    this._placements.set(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  // ---------- CRUD (Admin) ----------

  addPlacement(input: PlacementInput): void {
    const now = new Date().toISOString();
    const record: Placement = {
      ...input,
      id: 'p-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.persist([record, ...this._placements()]);
  }

  updatePlacement(id: string, changes: Partial<PlacementInput>): void {
    const list = this._placements().map(p =>
      p.id === id ? { ...p, ...changes, updatedAt: new Date().toISOString() } : p
    );
    this.persist(list);
  }

  deletePlacement(id: string): void {
    this.persist(this._placements().filter(p => p.id !== id));
  }

  // ---------- Company actions ----------

  markSelected(id: string) {

    this.updatePlacement(id, {

      status: 'Selected',
      applicationStatus: 'Selected'

    });

  }

  updateJoiningStatus(id: string, status: PlacementStatus): void {
    this.updatePlacement(id, { status });
  }

  uploadOfferLetter(id: string, fileName: string, dataUrl: string): void {
    this.updatePlacement(id, { offerLetterName: fileName, offerLetterData: dataUrl });
  }

  // ---------- Lookups for filter dropdowns ----------

  getUniqueCompanies(): string[] {
    return Array.from(new Set(this._placements().map(p => p.companyName))).sort();
  }

  getUniqueDepartments(): string[] {
    return Array.from(new Set(this._placements().map(p => p.department))).sort();
  }

  getUniqueBatches(): string[] {
    return Array.from(new Set(this._placements().map(p => p.batch))).sort();
  }

  getById(id: string): Placement | undefined {
    return this._placements().find(p => p.id === id);
  }
}
