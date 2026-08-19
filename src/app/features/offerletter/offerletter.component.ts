import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StudentService } from '../../service/student.service';
import { CompanyService } from '../../service/company.service';
import { AuthService } from '../../service/auth.service';
import { Student, Company } from '../../models/spms';
import { OfferLetterService } from '../../service/offerletter.service';

@Component({
  selector: 'app-offer-letter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offerletter.component.html',
  styleUrls: ['./offerletter.component.scss']
})
export class OfferletterComponent implements OnInit {

  students: Student[] = [];

  company!: Company;

  selectedCompanyId = '';
  companies: Company[] = [];

  selectedStudentId = '';
  jobTitle = '';
  salary = '';
  joiningDate = '';
  message = '';

  // Toast
  toasterMessage = '';
  toasterType: 'success' | 'error' = 'success';
  showToaster = false;

  constructor(
    private studentService: StudentService,
    private companyService: CompanyService,
    public auth: AuthService,
    private offerService: OfferLetterService
  ) {}

  ngOnInit(): void {

    // Load students
    this.students = this.studentService.getAll();

    // Load companies
    this.companies = this.companyService.getAllCompanies();

    // Current logged-in user
    const user = this.auth.getCurrentUser();

    if (!user) {
      return;
    }

    // Company login
    if (this.auth.isCompany()) {

      const company = this.companyService.getCompanyByUserId(user.id);

      if (company) {
        this.company = company;
        this.selectedCompanyId = company.id;
      }

    }

  }

  sendOffer(): void {

    // Validate required fields
    if (
      !this.selectedStudentId ||
      !this.jobTitle ||
      !this.salary ||
      !this.joiningDate
    ) {

      this.showToasterMessage(
        'Please fill all required fields.',
        'error'
      );

      return;
    }

    let companyId = '';
    let companyName = '';

    // =========================
    // COMPANY LOGIN
    // =========================

    if (this.auth.isCompany()) {

      if (!this.company) {

        this.showToasterMessage(
          'Company details not found.',
          'error'
        );

        return;
      }

      companyId = this.company.id;
      companyName = this.company.name;

    }

    // =========================
    // ADMIN LOGIN
    // =========================

    else {

      if (!this.selectedCompanyId) {

        this.showToasterMessage(
          'Please select a company.',
          'error'
        );

        return;
      }

      const company =
        this.companyService.getCompanyById(
          this.selectedCompanyId
        );

      if (!company) {

        this.showToasterMessage(
          'Company details not found.',
          'error'
        );

        return;
      }

      companyId = company.id;
      companyName = company.name;

    }

    // =========================
    // SAVE OFFER LETTER
    // =========================

    this.offerService.add({

      studentId: this.selectedStudentId,

      companyId: companyId,

      companyName: companyName,

      jobTitle: this.jobTitle,

      salary: this.salary,

      joiningDate: this.joiningDate,

      message: this.message

    });

    // Success toaster
    this.showToasterMessage(
      'Offer Letter Sent Successfully! 🎉',
      'success'
    );

    // Clear form
    this.selectedStudentId = '';
    this.jobTitle = '';
    this.salary = '';
    this.joiningDate = '';
    this.message = '';

    // Clear company selection only for admin
    if (this.auth.isAdmin()) {
      this.selectedCompanyId = '';
    }

  }

  // =========================
  // TOASTER
  // =========================

  showToasterMessage(
    message: string,
    type: 'success' | 'error' = 'success'
  ): void {

    this.toasterMessage = message;
    this.toasterType = type;
    this.showToaster = true;

    setTimeout(() => {

      this.showToaster = false;

    }, 3000);

  }

}