import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationService } from '../../service/application.service';
import { AuthService } from '../../service/auth.service';
import { CompanyService } from '../../service/company.service';
import { StudentService } from '../../service/student.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user: any = null;
  studentStats: any = {};
  appStats: any = {};
  recentDrives: any[] = [];
  recentApps: any[] = [];
  companies: any[] = [];
  openJobs: any[] = [];

  constructor(
    public auth: AuthService,
    private studentService: StudentService,
    private companyService: CompanyService,
    private applicationService: ApplicationService,
    // private driveService: DriveService
  ) { }

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.studentStats = this.studentService.getStats();
    this.appStats = this.applicationService.getStats();
    // this.recentDrives = this.driveService.getAll().slice(0, 3);
   this.companies = this.companyService.getAllCompanies();

if (this.auth.isCompany()) {

  const company = this.companyService.getCompanyByUserId(this.user.id);

  if (company) {
    this.openJobs = this.companyService.getJobsByCompany(company.id);
  }

} else {

  this.openJobs = this.companyService.getOpenJobs();

};

    if (this.auth.isStudent()) {
      const student = this.studentService.getByUserId(this.user.id);
      if (student) this.recentApps = this.applicationService.getByStudent(student.id);
    } else if (this.auth.isCompany()) {
      const company = this.companyService.getCompanyByUserId(this.user.id);
      if (company) this.recentApps = this.applicationService.getByCompany(company.name);
    } else {
      this.recentApps = this.applicationService.getAll().slice(0, 5);
    }
  }

  getPlacementPercent(): number {
    if (!this.studentStats.total) return 0;
    return Math.round((this.studentStats.placed / this.studentStats.total) * 100);
  }

  statusClass(s: string): string {
    const map: any = { applied: 'badge-blue', shortlisted: 'badge-yellow', interview: 'badge-purple', selected: 'badge-green', rejected: 'badge-red' };
    return map[s] ?? 'badge-gray';
  }

  driveClass(s: string): string {
    const map: any = { upcoming: 'badge-blue', ongoing: 'badge-yellow', completed: 'badge-green' };
    return map[s] ?? 'badge-gray';
  }
}