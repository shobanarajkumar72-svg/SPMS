// pages/companies/companies.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Company } from '../../models/spms';
import { CompanyService } from '../../service/company.service';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit {
  companies: Company[] = [];
  searchTerm = '';

  // modal state
  showModal = false;
  isEditMode = false;
  formData: Partial<Company> = {};

  // delete confirm state
  showDeleteConfirm = false;
  deleteTargetId: string | null = null;

  // toast
  toastMsg = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  industries = ['IT / Software', 'Finance', 'Core Engineering', 'Consulting', 'Healthcare', 'E-commerce', 'Manufacturing', 'Other'];

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.companies = this.companyService.searchCompanies(this.searchTerm);
  }

  onSearchChange(): void {
    this.refresh();
  }

  // ── Modal: Add ─────────────────────────────────────────
  openAddModal(): void {
    this.isEditMode = false;
    this.formData = {
      userId: '',
      name: '', industry: '', website: '',
      email: '', phone: '', description: '', logoUrl: ''
    };
    this.showModal = true;
  }

  // ── Modal: Edit ────────────────────────────────────────
  openEditModal(company: Company): void {
    this.isEditMode = true;
    this.formData = { ...company };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.formData = {};
  }

  // ── Save (Add or Update) ───────────────────────────────
  saveCompany(): void {
    if (!this.formData.name || !this.formData.industry || !this.formData.email) {
      this.fireToast('Please fill all required fields.', 'error');
      return;
    }

    if (this.isEditMode && this.formData.id) {
      this.companyService.updateCompany(this.formData.id, this.formData);
      this.fireToast('Company updated successfully!', 'success');
    } else {
      this.companyService.createCompany(this.formData as Omit<Company, 'id' | 'createdAt' | 'verified'>);
      this.fireToast('Company added successfully!', 'success');
    }

    this.closeModal();
    this.refresh();
  }

  // ── Delete ──────────────────────────────────────────────
  confirmDelete(id: string): void {
    this.deleteTargetId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.deleteTargetId = null;
    this.showDeleteConfirm = false;
  }

  performDelete(): void {
    if (this.deleteTargetId) {
      this.companyService.deleteCompany(this.deleteTargetId);
      this.fireToast('Company deleted.', 'success');
      this.refresh();
    }
    this.cancelDelete();
  }

  // ── Verify toggle ───────────────────────────────────────
  toggleVerify(company: Company): void {
    this.companyService.updateCompany(company.id, { verified: !company.verified });
    this.fireToast(company.verified ? 'Company unverified.' : 'Company verified!', 'success');
    this.refresh();
  }

  // ── Logo upload (base64) ───────────────────────────────
  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.formData.logoUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  getInitials(name: string): string {
    return name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  }

  // ── Toast helper ────────────────────────────────────────
  private fireToast(msg: string, type: 'success' | 'error'): void {
    this.toastMsg = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 2500);
  }
}