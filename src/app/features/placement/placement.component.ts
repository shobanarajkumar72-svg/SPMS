import { Component, Inject, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PlacementService, Placement, PlacementInput, PlacementStatus } from '../../service/placement.service';
// -----------------------------------------------------------------------
// NOTE ON AUTH INTEGRATION
// This component expects an existing `AuthService` in the app that exposes
// `getCurrentUser()` returning an object shaped like `CurrentUser` below.
// Adjust the import path to match your project structure, e.g.:
//   import { AuthService } from '../../core/services/auth.service';
// If your AuthService returns an Observable instead, swap `getCurrentUser()`
// for `currentUser$` and read it with `toSignal(this.auth.currentUser$)`.
// -----------------------------------------------------------------------
import { AuthService } from '../../service/auth.service';

export type UserRole = 'admin' | 'company' | 'student';

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  registerNumber?: string; // present for student accounts
  companyName?: string;    // present for company accounts
}

type SortDirection = 'asc' | 'desc' | null;

// =========================================================================
// Confirm dialog — generic yes/no confirmation used for delete / mark-selected
// =========================================================================
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close(false)">Cancel</button>
      <button
        mat-flat-button
        [color]="data.danger ? 'warn' : 'primary'"
        (click)="ref.close(true)">
        {{ data.confirmLabel || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  ref = inject(MatDialogRef<ConfirmDialogComponent>);
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}
}

// =========================================================================
// Placement details dialog — read-only view (all roles)
// =========================================================================
@Component({
  selector: 'app-placement-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <h2 mat-dialog-title>Placement Details</h2>
    <mat-dialog-content class="details-grid">
      <div class="detail-row"><span>Student Name</span><strong>{{ data.studentName }}</strong></div>
      <div class="detail-row"><span>Register Number</span><strong>{{ data.registerNumber }}</strong></div>
      <div class="detail-row"><span>Department</span><strong>{{ data.department }}</strong></div>
      <div class="detail-row"><span>Batch</span><strong>{{ data.batch }}</strong></div>
      <div class="detail-row"><span>Company</span><strong>{{ data.companyName }}</strong></div>
      <div class="detail-row"><span>Job Role</span><strong>{{ data.jobRole }}</strong></div>
      <div class="detail-row"><span>Package</span><strong>{{ data.packageLPA }} LPA</strong></div>
      <div class="detail-row"><span>Placement Date</span><strong>{{ data.placementDate | date:'mediumDate' }}</strong></div>
      <div class="detail-row">
        <span>Status</span>
        <mat-chip [class]="'status-' + data.status.toLowerCase()">{{ data.status }}</mat-chip>
      </div>
      <div class="detail-row" *ngIf="data.offerLetterName">
        <span>Offer Letter</span>
        <strong><mat-icon inline="true">description</mat-icon> {{ data.offerLetterName }}</strong>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./placement.component.scss']
})
export class PlacementDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Placement) {}
}

// =========================================================================
// Add / Edit placement dialog (Admin)
// =========================================================================
export interface PlacementFormDialogData {
  mode: 'add' | 'edit';
  placement?: Placement;
}

@Component({
  selector: 'app-placement-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? 'Add Placement' : 'Edit Placement' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="placement-form">
        <mat-form-field appearance="outline">
          <mat-label>Student Name</mat-label>
          <input matInput formControlName="studentName" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Register Number</mat-label>
          <input matInput formControlName="registerNumber" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Department</mat-label>
          <input matInput formControlName="department" required placeholder="e.g. CSE">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Batch</mat-label>
          <input matInput formControlName="batch" required placeholder="e.g. 2022-2026">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Company Name</mat-label>
          <input matInput formControlName="companyName" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Job Role</mat-label>
          <input matInput formControlName="jobRole" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Package (LPA)</mat-label>
          <input matInput type="number" step="0.1" min="0" formControlName="packageLPA" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Placement Date</mat-label>
          <input matInput type="date" formControlName="placementDate" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status" required>
            <mat-option value="Pending">Pending</mat-option>
            <mat-option value="Selected">Selected</mat-option>
            <mat-option value="Joined">Joined</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">
        {{ data.mode === 'add' ? 'Add Placement' : 'Save Changes' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .placement-form { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; min-width: 420px; }
    mat-form-field { width: 100%; }
    @media (max-width: 599px) {
      .placement-form { grid-template-columns: 1fr; min-width: 0; }
    }
  `]
})
export class PlacementFormDialogComponent {
  ref = inject(MatDialogRef<PlacementFormDialogComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    studentName: ['', Validators.required],
    registerNumber: ['', Validators.required],
    department: ['', Validators.required],
    batch: ['', Validators.required],
    companyName: ['', Validators.required],
    jobRole: ['', Validators.required],
    packageLPA: [0, [Validators.required, Validators.min(0)]],
    placementDate: ['', Validators.required],
    status: ['Pending' as PlacementStatus, Validators.required]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: PlacementFormDialogData) {
    if (data.mode === 'edit' && data.placement) {
      this.form.patchValue(data.placement);
    }
  }

  save(): void {
    if (this.form.invalid) return;
    this.ref.close(this.form.getRawValue() as PlacementInput);
  }
}

// =========================================================================
// Offer letter upload dialog (Company)
// =========================================================================
@Component({
  selector: 'app-offer-letter-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Upload Offer Letter</h2>
    <mat-dialog-content>
      <p class="hint">For <strong>{{ data.studentName }}</strong> ({{ data.registerNumber }})</p>
      <label class="upload-drop">
        <input type="file" hidden accept=".pdf,.png,.jpg,.jpeg" (change)="onFileSelected($event)">
        <mat-icon>upload_file</mat-icon>
        <span *ngIf="!fileName">Click to choose a file (PDF / image)</span>
        <span *ngIf="fileName" class="chosen">{{ fileName }}</span>
      </label>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!fileName" (click)="save()">Upload</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .hint { color: rgba(0,0,0,0.6); margin-bottom: 12px; }
    .upload-drop {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 8px; padding: 28px; border: 2px dashed #c7c7c7; border-radius: 12px;
      cursor: pointer; min-width: 320px; text-align: center; transition: border-color .2s ease;
    }
    .upload-drop:hover { border-color: #6a4cff; }
    .chosen { font-weight: 600; }
  `]
})
export class OfferLetterDialogComponent {
  ref = inject(MatDialogRef<OfferLetterDialogComponent>);
  fileName = '';
  private dataUrl = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: Placement) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = () => (this.dataUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  save(): void {
    if (!this.fileName || !this.dataUrl) return;
    this.ref.close({ fileName: this.fileName, dataUrl: this.dataUrl });
  }
}

// =========================================================================
// Joining status update dialog (Company)
// =========================================================================
@Component({
  selector: 'app-status-update-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatSelectModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Update Joining Status</h2>
    <mat-dialog-content>
      <p class="hint">{{ data.studentName }} — {{ data.companyName }}</p>
      <mat-form-field appearance="outline" style="width: 100%;">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="selected">
          <mat-option value="Selected">Selected</mat-option>
          <mat-option value="Joined">Joined</mat-option>
          <mat-option value="Pending">Pending</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="ref.close(selected)">Update</button>
    </mat-dialog-actions>
  `,
  styles: [`.hint { color: rgba(0,0,0,0.6); margin-bottom: 8px; }`]
})
export class StatusUpdateDialogComponent {
  ref = inject(MatDialogRef<StatusUpdateDialogComponent>);
  selected: PlacementStatus;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Placement) {
    this.selected = data.status;
  }
}

// =========================================================================
// Main Placement Management Component
// =========================================================================
@Component({
  selector: 'app-placement',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatTableModule, MatChipsModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule,
    MatDividerModule, MatProgressBarModule, MatDialogModule, MatSnackBarModule
  ],
  templateUrl: './placement.component.html',
  styleUrl: './placement.component.scss'
})
export class PlacementComponent {
  private placementService = inject(PlacementService);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // ----- current user / role flags -----
  currentUser = signal<CurrentUser | null>(this.auth.getCurrentUser?.() ?? null);
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  isCompany = computed(() => this.currentUser()?.role === 'company');
  isStudent = computed(() => this.currentUser()?.role === 'student');

  displayedColumns = computed(() => {
    const base = [
      'studentName', 'registerNumber', 'department', 'companyName',
      'jobRole', 'packageLPA', 'placementDate', 'status', 'actions'
    ];
    return base;
  });

  // ----- data -----
  allPlacements = this.placementService.placements;

  // ----- dashboard stats -----
  totalPlacements = this.placementService.totalPlacements;
  highestPackage = this.placementService.highestPackage;
  averagePackage = this.placementService.averagePackage;
  companiesVisited = this.placementService.companiesVisited;

  // ----- filter/search state -----
  searchText = signal('');
  companyFilter = signal('all');
  departmentFilter = signal('all');
  batchFilter = signal('all');
  sortDirection = signal<SortDirection>(null);

  companyOptions = computed(() => this.placementService.getUniqueCompanies());
  departmentOptions = computed(() => this.placementService.getUniqueDepartments());
  batchOptions = computed(() => this.placementService.getUniqueBatches());

  // ----- role-scoped + filtered + sorted view -----
  filteredPlacements = computed(() => {
    const user = this.currentUser();
    let list = this.allPlacements();

    // Role scoping
    if (user?.role === 'student' && user.registerNumber) {
      list = list.filter(p => p.registerNumber === user.registerNumber);
    } else if (user?.role === 'company' && user.companyName) {
      list = list.filter(p => p.companyName === user.companyName);
    }

    // Search
    const query = this.searchText().trim().toLowerCase();
    if (query) {
      list = list.filter(p =>
        p.studentName.toLowerCase().includes(query) ||
        p.registerNumber.toLowerCase().includes(query)
      );
    }

    // Filters
    if (this.companyFilter() !== 'all') {
      list = list.filter(p => p.companyName === this.companyFilter());
    }
    if (this.departmentFilter() !== 'all') {
      list = list.filter(p => p.department === this.departmentFilter());
    }
    if (this.batchFilter() !== 'all') {
      list = list.filter(p => p.batch === this.batchFilter());
    }

    // Sort by package
    const dir = this.sortDirection();
    if (dir) {
      list = [...list].sort((a, b) =>
        dir === 'asc' ? a.packageLPA - b.packageLPA : b.packageLPA - a.packageLPA
      );
    }

    return list;
  });

  // ---------------------------------------------------------------------
  // UI actions — filters
  // ---------------------------------------------------------------------
  onSearchChange(value: string): void {
    this.searchText.set(value);
  }

  toggleSort(): void {
    const dir = this.sortDirection();
    this.sortDirection.set(dir === null ? 'desc' : dir === 'desc' ? 'asc' : null);
  }

  resetFilters(): void {
    this.searchText.set('');
    this.companyFilter.set('all');
    this.departmentFilter.set('all');
    this.batchFilter.set('all');
    this.sortDirection.set(null);
  }

  // ---------------------------------------------------------------------
  // Admin actions
  // ---------------------------------------------------------------------
  openAddDialog(): void {

  const ref = this.dialog.open(PlacementFormDialogComponent, {

    data: {
      mode: 'add'
    } as PlacementFormDialogData,

    // Outside click பண்ணினாலும் close ஆகாது
    disableClose: true

  });

  ref.afterClosed().subscribe((result: PlacementInput | undefined) => {

    if (result) {

      this.placementService.addPlacement(result);

      this.snackBar.open(
        'Placement added',
        'Close',
        { duration: 2500 }
      );

    }

  });

}

 openEditDialog(placement: Placement): void {

  const ref = this.dialog.open(PlacementFormDialogComponent, {

    data: {
      mode: 'edit',
      placement
    } as PlacementFormDialogData,

    // IMPORTANT:
    // Outside click / backdrop click மூலம் dialog close ஆகாது
    disableClose: true

  });

  ref.afterClosed().subscribe((result: PlacementInput | undefined) => {

    if (result) {

      this.placementService.updatePlacement(
        placement.id,
        result
      );

      this.snackBar.open(
        'Placement updated',
        'Close',
        { duration: 2500 }
      );

    }

  });

}

  deletePlacement(placement: Placement): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Placement',
        message: `Remove the placement record for ${placement.studentName}? This cannot be undone.`,
        confirmLabel: 'Delete',
      } as ConfirmDialogData,
      disableClose: true
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.placementService.deletePlacement(placement.id);
        this.snackBar.open('Placement deleted', 'Close', { duration: 2500 });
      }
    });
  }

  // ---------------------------------------------------------------------
  // Company actions
  // ---------------------------------------------------------------------
  markSelected(placement: Placement): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Mark as Selected',
        message: `Mark ${placement.studentName} as Selected for ${placement.companyName}?`,
        confirmLabel: 'Mark Selected'
      } as ConfirmDialogData
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.placementService.markSelected(placement.id);
        this.snackBar.open('Student marked as Selected', 'Close', { duration: 2500 });
      }
    });
  }

  updateJoiningStatus(placement: Placement): void {
    const ref = this.dialog.open(StatusUpdateDialogComponent, { data: placement });
    ref.afterClosed().subscribe((status: PlacementStatus | undefined) => {
      if (status) {
        this.placementService.updateJoiningStatus(placement.id, status);
        this.snackBar.open(`Status updated to ${status}`, 'Close', { duration: 2500 });
      }
    });
  }

  uploadOfferLetter(placement: Placement): void {
    const ref = this.dialog.open(OfferLetterDialogComponent, { data: placement });
    ref.afterClosed().subscribe((result: { fileName: string; dataUrl: string } | undefined) => {
      if (result) {
        this.placementService.uploadOfferLetter(placement.id, result.fileName, result.dataUrl);
        this.snackBar.open('Offer letter uploaded', 'Close', { duration: 2500 });
      }
    });
  }

  // ---------------------------------------------------------------------
  // Student / shared actions
  // ---------------------------------------------------------------------
  viewDetails(placement: Placement): void {
    this.dialog.open(PlacementDetailsDialogComponent, { data: placement , disableClose:true});
  }

  canDownloadOfferLetter(placement: Placement): boolean {
    return !!placement.offerLetterData;
  }

  downloadOfferLetter(placement: Placement): void {
    if (!placement.offerLetterData) return;
    const link = document.createElement('a');
    link.href = placement.offerLetterData;
    link.download = placement.offerLetterName || `offer-letter-${placement.registerNumber}`;
    link.click();
  }

  // ---------------------------------------------------------------------
  // Template helpers
  // ---------------------------------------------------------------------
  statusChipClass(status: PlacementStatus): string {
    return 'status-' + status.toLowerCase();
  }

  trackById(_index: number, item: Placement): string {
    return item.id;
  }
}