// pages/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserRole } from '../../models/spms';
import { AuthService } from '../../service/auth.service';
import { CompanyService } from '../../service/company.service';
import { StudentService } from '../../service/student.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  step = 1; // 1: account details, 2: profile details
  role: UserRole = 'student';

  // Step 1
  name = ''; email = ''; password = ''; confirmPassword = '';
  showPassword = false; showConfirm = false;

  // Step 2 - Student
  phone = ''; department = ''; batch = ''; cgpa: number | null = null; skills = '';
  // New Fields
  rollNo = '';
  gender = '';
  dob = '';
  city = '';
  tenthPercent: number | null = null;
  twelthPercent: number | null = null;
  backlogs: number | null = null;
  resumeUrl = '';
  placementStatus = 'Not Placed';

  // Step 2 - Company
  companyPhone = ''; industry = ''; website = ''; description = '';

  errorMsg = ''; successMsg = ''; isLoading = false;


  constructor(
    private auth: AuthService,
    private router: Router,
    private studentService: StudentService,
    private companyService: CompanyService
  ) { }

  nextStep() {
    this.errorMsg = '';
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMsg = 'All fields are required.'; return;
    }
    if (this.password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters.'; return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match.'; return;
    }
    this.step = 2;
  }

  onRegister() {
    this.errorMsg = '';
    this.isLoading = true;

    setTimeout(() => {
      const result = this.auth.register(this.name, this.email, this.password, this.role);
      if (!result.success) {
        this.errorMsg = result.message;
        this.isLoading = false;
        return;
      }

      // Get the newly created user
      const users: any[] = JSON.parse(localStorage.getItem('spms_users') || '[]');
      const user = users.find((u: any) => u.email === this.email);

      if (this.role === 'student' && user) {
        this.studentService.create({
          userId: user.id,
          name: this.name,
          email: this.email,
          phone: this.phone,
          department: this.department,
          batch: this.batch,
          cgpa: this.cgpa ?? 0,
          skills: this.skills.split(',').map(s => s.trim()).filter(Boolean),
          resumeUrl: '',
          status: 'available',
          appliedJobs: [],
          rollNo: this.rollNo,
          placementStatus: this.placementStatus,
          gender: this.gender,
          tenthPercent: this.tenthPercent ?? 0,
          twelthPercent: this.twelthPercent ?? 0
        });
      }

      if (this.role === 'company' && user) {
        this.companyService.createCompany({
          userId: user.id,
          name: this.name,
          email: this.email,
          phone: this.companyPhone,
          industry: this.industry,
          website: this.website,
          description: this.description,
          logoUrl: '',
          contactPerson: undefined
        });
      }

      this.successMsg = 'Registered successfully! Redirecting to login...';
      this.isLoading = false;
      setTimeout(() => this.router.navigate(['/login']), 1500);
    }, 800);
  }
}