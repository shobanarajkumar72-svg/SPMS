// features/applications/applications.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApplicationService } from '../../service/application.service';
import { CompanyService } from '../../service/company.service';
import { Application, Job } from '../../models/spms';
import { AuthService } from '../../service/auth.service';
import { PlacementService } from '../../service/placement.service';
import { StudentService } from '../../service/student.service';
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {

  applications: Application[] = [];
  jobs: Job[] = [];

  searchTerm = '';
  statusFilter: Application['status'] | 'all' = 'all';
  jobFilter = 'all';

  // ============================================================
  // DETAIL MODAL
  // ============================================================

  showDetailModal = false;
  selectedApp: Application | null = null;

  // ============================================================
  // DELETE CONFIRM
  // ============================================================

  showDeleteConfirm = false;
  deleteTargetId: string | null = null;

  // ============================================================
  // RESUME VIEWER
  // ============================================================

  showResumeModal = false;
  resumeApp: Application | null = null;

  // ============================================================
  // TOAST
  // ============================================================

  toastMsg = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  // Admin OR Company
  isAdmin = false;

isStudent = false;
isCompany = false;

currentUser: any = null;
currentRole: 'admin' | 'student' | 'company' | null = null;

  // ============================================================
  // STATUS OPTIONS
  // ============================================================

  statusOptions: {
    value: Application['status'] | 'all';
    label: string;
  }[] = [
    { value: 'all', label: 'All' },
    { value: 'applied', label: 'Applied' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'selected', label: 'Selected' },
    { value: 'rejected', label: 'Rejected' }
  ];

  statusFlow: Application['status'][] = [
    'applied',
    'shortlisted',
    'selected'
  ];

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private companyService: CompanyService,
    private applicationService: ApplicationService,
    private authService: AuthService,
    private placementService: PlacementService,
    private studentService: StudentService,
    private notificationService: NotificationService
  ) {}

  // ============================================================
  // INIT
  // ============================================================

ngOnInit(): void {

  // Logged-in user
  this.currentUser = this.authService.getCurrentUser();

  // Logged-in role
  this.currentRole = this.authService.getRole();

  // Role flags
  this.isStudent = this.currentRole === 'student';
  this.isCompany = this.currentRole === 'company';

  // Admin + Company can manage applications
  this.isAdmin =
    this.currentRole === 'admin' ||
    this.currentRole === 'company';

  // ============================================================
  // JOB LIST
  // ============================================================

  const allJobs = this.companyService.getAllJobs();

  if (this.currentRole === 'admin') {

    // Admin -> all jobs
    this.jobs = allJobs;

  } else if (this.currentRole === 'company') {

    // Company -> only that company's jobs
    const companyName =
      this.currentUser?.companyName ||
      this.currentUser?.name ||
      '';

    this.jobs = allJobs.filter(job =>
      job.companyName?.trim().toLowerCase() ===
      companyName.trim().toLowerCase()
    );

  } else {

    // Student -> all jobs
    this.jobs = allJobs;
  }

  console.log('Current User:', this.currentUser);
  console.log('Current Role:', this.currentRole);

  // Load applications
  this.refresh();
}

  // ============================================================
  // REFRESH APPLICATIONS
  // ============================================================
refresh(): void {

  // First get all applications based on search
  let result =
    this.applicationService.searchApplications(
      this.searchTerm
    );

  // ============================================================
  // ROLE BASED FILTER
  // ============================================================

  // ADMIN
  // Admin can see ALL applications
  if (this.currentRole === 'admin') {

    // No filtering
    result = result;

  }

  // STUDENT
  // Student can see ONLY his/her own applications
  else if (this.currentRole === 'student') {

    const currentUserId =
      this.currentUser?.id;

    const currentStudent =
      currentUserId
        ? this.studentService.getByUserId(currentUserId)
        : null;

    if (currentStudent) {

      result = result.filter(app =>
        app.studentId === currentStudent.id
      );

    } else {

      // Student record not found
      result = [];

    }
  }

  // COMPANY
  // Company can see ONLY applications
  // received for that company
  else if (this.currentRole === 'company') {

    const loggedInCompanyName =
      this.currentUser?.companyName ||
      this.currentUser?.name ||
      '';

    if (loggedInCompanyName) {

      result = result.filter(app =>
        app.companyName?.trim().toLowerCase() ===
        loggedInCompanyName.trim().toLowerCase()
      );

    } else {

      // Company identity not found
      result = [];

    }
  }

  // ============================================================
  // STATUS FILTER
  // ============================================================

  if (this.statusFilter !== 'all') {

    result = result.filter(app =>
      app.status === this.statusFilter
    );

  }

  // ============================================================
  // JOB FILTER
  // ============================================================

  if (this.jobFilter !== 'all') {

    result = result.filter(app =>
      app.jobId === this.jobFilter
    );

  }

  // ============================================================
  // NEWEST FIRST
  // ============================================================

  this.applications = result.sort(
    (a, b) =>
      new Date(b.appliedAt).getTime() -
      new Date(a.appliedAt).getTime()
  );

  console.log(
    'Visible Applications:',
    this.applications
  );
}
  // ============================================================
  // SEARCH / FILTER
  // ============================================================

  onSearchChange(): void {
    this.refresh();
  }

  onStatusFilterChange(): void {
    this.refresh();
  }

  onJobFilterChange(): void {
    this.refresh();
  }

  // ============================================================
  // STATS
  // ============================================================

  get totalCount(): number {

  return this.getVisibleApplications().length;

}

get shortlistedCount(): number {

  return this.getVisibleApplications()
    .filter(app => app.status === 'shortlisted')
    .length;

}

get selectedCount(): number {

  return this.getVisibleApplications()
    .filter(app => app.status === 'selected')
    .length;

}

get rejectedCount(): number {

  return this.getVisibleApplications()
    .filter(app => app.status === 'rejected')
    .length;

}
// ============================================================
// GET ROLE BASED APPLICATIONS
// ============================================================

private getVisibleApplications(): Application[] {

  const result =
    this.applicationService.getAllApplications();

  // ============================================================
  // ADMIN
  // ============================================================

  if (this.currentRole === 'admin') {

    return result;

  }

  // ============================================================
  // STUDENT
  // ============================================================

  if (this.currentRole === 'student') {

    const currentUserId =
      this.currentUser?.id;

    const currentStudent =
      currentUserId
        ? this.studentService.getByUserId(currentUserId)
        : null;

    if (!currentStudent) {
      return [];
    }

    return result.filter(app =>
      app.studentId === currentStudent.id
    );
  }

  // ============================================================
  // COMPANY
  // ============================================================

  if (this.currentRole === 'company') {

    const loggedInCompanyName =
      this.currentUser?.companyName ||
      this.currentUser?.name ||
      '';

    if (!loggedInCompanyName) {
      return [];
    }

    return result.filter(app =>
      app.companyName?.trim().toLowerCase() ===
      loggedInCompanyName.trim().toLowerCase()
    );
  }

  return [];
}

  // ============================================================
  // DETAIL MODAL
  // ============================================================

  openDetail(app: Application): void {

    this.selectedApp = {
      ...app
    };

    this.showDetailModal = true;
  }

  closeDetail(): void {

    this.showDetailModal = false;

    this.selectedApp = null;
  }

  // ============================================================
  // RESUME VIEW
  // ============================================================

  viewResume(app: Application): void {

    if (!app.resumeData) {

      this.fireToast(
        'Resume not available.',
        'error'
      );

      return;
    }

    this.resumeApp = app;

    this.showResumeModal = true;
  }

  // ============================================================
  // CLOSE RESUME
  // ============================================================

  closeResume(): void {

    this.showResumeModal = false;

    this.resumeApp = null;
  }

  // ============================================================
  // DOWNLOAD RESUME
  // ============================================================

  downloadResume(app: Application): void {

    if (!app.resumeData) {

      this.fireToast(
        'Resume not available.',
        'error'
      );

      return;
    }

    const link =
      document.createElement('a');

    link.href = app.resumeData;

    link.download =
      app.resumeName || 'resume';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  // ============================================================
  // CHECK PDF
  // ============================================================

  isPdfResume(app: Application): boolean {

    return !!(
      app.resumeData &&
      (
        app.resumeName
          ?.toLowerCase()
          .endsWith('.pdf') ||

        app.resumeData.startsWith(
          'data:application/pdf'
        )
      )
    );
  }

  // ============================================================
  // STATUS CHANGE
  // ============================================================

  setStatus(
    app: Application,
    status: Application['status']
  ): void {

    // Update application status
    this.applicationService.updateStatus(
      app.id,
      status
    );

    const student =
      this.studentService.getById(
        app.studentId
      );

    const job =
      this.companyService.getJobById(
        app.jobId
      );

    if (!student || !job) {

      this.refresh();

      return;
    }

    // ==========================================================
    // SHORTLIST
    // ==========================================================

    if (status === 'shortlisted') {

      this.notificationService.addNotification({

        studentId: student.userId,

        companyName: app.companyName,

        subject:
          'Application Shortlisted',

        message:
          `Congratulations ${student.name}! You have been shortlisted for ${app.jobTitle} at ${app.companyName}.`,

        type: 'shortlist'

      });
    }

    // ==========================================================
    // SELECTED
    // ==========================================================

    if (status === 'selected') {

      // Placement Entry

      this.placementService.addPlacement({

        studentName: student.name,

        registerNumber:
          student.rollNo,

        department:
          student.department,

        batch:
          student.batch,

        email:
          student.email,

        phone:
          student.phone,

        cgpa:
          student.cgpa,

        companyName:
          app.companyName,

        jobRole:
          app.jobTitle,

        packageLPA:
          parseFloat(job.salary) || 0,

        appliedDate:
          app.appliedAt,

        placementDate:
          new Date().toISOString(),

        applicationStatus:
          'Selected',

        status:
          'Selected'

      });

      // Student Status Update

      this.studentService.update(
        student.id,
        {
          status: 'placed',
          placedCompany:
            app.companyName
        }
      );

      // Notification

      this.notificationService.addNotification({

        studentId:
          student.userId,

        companyName:
          app.companyName,

        subject:
          'Congratulations!',

        message:
          `Congratulations ${student.name}! You have been selected for ${app.jobTitle} at ${app.companyName}.`,

        type: 'offer'

      });
    }

    // ==========================================================
    // REJECTED
    // ==========================================================

    if (status === 'rejected') {

      this.notificationService.addNotification({

        studentId:
          student.userId,

        companyName:
          app.companyName,

        subject:
          'Application Rejected',

        message:
          `Your application for ${app.jobTitle} at ${app.companyName} has been rejected.`,

        type: 'rejection'

      });
    }

    this.fireToast(
      `Marked as ${status}`,
      'success'
    );

    this.refresh();
  }

  // ============================================================
  // NEXT STATUS
  // ============================================================

  canAdvance(
    app: Application
  ): boolean {

    return (
      app.status === 'applied' ||
      app.status === 'shortlisted'
    );
  }

  nextStatusLabel(
    app: Application
  ): string {

    if (app.status === 'applied') {

      return 'Shortlist';

    }

    if (app.status === 'shortlisted') {

      return 'Select';

    }

    return '';
  }

  advanceStatus(
    app: Application
  ): void {

    if (app.status === 'applied') {

      this.setStatus(
        app,
        'shortlisted'
      );

      return;
    }

    if (app.status === 'shortlisted') {

      this.setStatus(
        app,
        'selected'
      );

      return;
    }
  }

  // ============================================================
  // DELETE
  // ============================================================

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

      this.applicationService
        .deleteApplication(
          this.deleteTargetId
        );

      this.fireToast(
        'Application deleted.',
        'success'
      );

      this.refresh();

      this.closeDetail();
    }

    this.cancelDelete();
  }

  // ============================================================
  // INITIALS
  // ============================================================

  getInitials(
    name: string
  ): string {

    return (
      name
        ?.split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
      || '?'
    );
  }

  // ============================================================
  // TOAST
  // ============================================================

  private fireToast(
    msg: string,
    type: 'success' | 'error'
  ): void {

    this.toastMsg = msg;

    this.toastType = type;

    this.showToast = true;

    setTimeout(() => {

      this.showToast = false;

    }, 2500);
  }
}