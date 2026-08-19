// features/jobs/jobs.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CompanyService } from '../../service/company.service';
import { Job, Company } from '../../models/spms';
import { ApplicationService } from '../../service/application.service';
import { AuthService } from '../../service/auth.service';
import { StudentService } from '../../service/student.service';
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {

  // ============================================================
  // JOB DATA
  // ============================================================

  jobs: Job[] = [];
  companies: Company[] = [];

  searchTerm = '';

  statusFilter: Job['status'] | 'all' = 'all';


  // ============================================================
  // JOB ADD / EDIT MODAL
  // ============================================================

  showModal = false;
  isEditMode = false;

  formData: Partial<Job> = {};


  // ============================================================
  // SKILLS / BATCHES
  // ============================================================

  skillsInput = '';
  batchesInput = '';


  // ============================================================
  // DELETE CONFIRM
  // ============================================================

  showDeleteConfirm = false;
  deleteTargetId: string | null = null;


  // ============================================================
  // TOAST
  // ============================================================

  toastMsg = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;


  // ============================================================
  // APPLY JOB MODAL
  // ============================================================

  showApplyModal = false;

  selectedJob: Job | null = null;

  isSubmittingApplication = false;


  // ============================================================
  // APPLICATION FORM
  // ============================================================

  applicationForm = {
    studentName: '',
    registerNumber: '',
    email: '',
    phone: '',
    department: '',
    jobId: '',
    jobTitle: '',
    companyName: '',
    coverLetter: '',
    resumeName: '',
    resumeData: ''
  };


  // Resume preview
  resumePreviewUrl = '';
  resumePreviewType = '';



  // ============================================================
  // JOB OPTIONS
  // ============================================================

  jobTypes: Job['type'][] = [
    'fulltime',
    'internship',
    'parttime'
  ];

  statusOptions: {
    value: Job['status'] | 'all';
    label: string;
  }[] = [
    {
      value: 'all',
      label: 'All'
    },
    {
      value: 'open',
      label: 'Open'
    },
    {
      value: 'closed',
      label: 'Closed'
    }
  ];


  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private companyService: CompanyService,
    private applicationService: ApplicationService,
    private studentService: StudentService,
    private notificationService: NotificationService,
    public auth: AuthService
  ) { }


  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {

    this.companies =
      this.companyService.getAllCompanies();

    this.refresh();
  }


  // ============================================================
  // LOAD / REFRESH JOBS
  // ============================================================

  refresh(): void {

    let result: Job[] = [];


    // ----------------------------------------------------------
    // COMPANY LOGIN
    // ----------------------------------------------------------

    if (this.auth.isCompany()) {

      const user = this.auth.getCurrentUser();

      if (user) {

        const company =
          this.companyService.getCompanyByUserId(user.id);

        if (company) {

          result =
            this.companyService.getJobsByCompany(company.id);

        }
      }

    }

    // ----------------------------------------------------------
    // ADMIN / STUDENT
    // ----------------------------------------------------------

    else {

      result =
        this.companyService.getAllJobs();

    }


    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    const t =
      this.searchTerm
        .toLowerCase()
        .trim();

    if (t) {

      result = result.filter(j =>
        j.title.toLowerCase().includes(t) ||
        j.companyName.toLowerCase().includes(t) ||
        j.location.toLowerCase().includes(t)
      );

    }


    // ----------------------------------------------------------
    // STATUS FILTER
    // ----------------------------------------------------------

    if (this.statusFilter !== 'all') {

      result =
        result.filter(
          j => j.status === this.statusFilter
        );

    }


    this.jobs = result;
  }


  // ============================================================
  // SEARCH
  // ============================================================

  onSearchChange(): void {
    this.refresh();
  }


  // ============================================================
  // STATUS FILTER
  // ============================================================

  onStatusFilterChange(): void {
    this.refresh();
  }


  // ============================================================
  // ADD JOB
  // ============================================================

  openAddModal(): void {

    this.isEditMode = false;

    let companyId = '';
    let companyName = '';


    if (this.auth.isCompany()) {

      const user =
        this.auth.getCurrentUser();

      if (user) {

        const company =
          this.companyService.getCompanyByUserId(user.id);

        if (company) {

          companyId = company.id;
          companyName = company.name;

        }
      }
    }


    this.formData = {

      companyId,
      companyName,

      title: '',
      description: '',

      skills: [],

      salary: '',

      location: '',

      type: 'fulltime',

      minCgpa: 0,

      eligibleBatches: [],

      deadline: '',

      status: 'open'

    };


    this.skillsInput = '';
    this.batchesInput = '';

    this.showModal = true;
  }


  // ============================================================
  // EDIT JOB
  // ============================================================

  openEditModal(job: Job): void {

    this.isEditMode = true;

    this.formData = {
      ...job,

      skills: [
        ...(job.skills ?? [])
      ],

      eligibleBatches: [
        ...(job.eligibleBatches ?? [])
      ]
    };


    this.skillsInput =
      (job.skills ?? []).join(', ');

    this.batchesInput =
      (job.eligibleBatches ?? []).join(', ');


    this.showModal = true;
  }


  // ============================================================
  // CLOSE JOB MODAL
  // ============================================================

  closeModal(): void {

    this.showModal = false;

    this.formData = {};

  }


  // ============================================================
  // COMPANY CHANGE
  // ============================================================

  onCompanyChange(): void {

    const company =
      this.companies.find(
        c => c.id === this.formData.companyId
      );

    this.formData.companyName =
      company?.name ?? '';
  }


  // ============================================================
  // SYNC SKILLS / BATCHES
  // ============================================================

  private syncArraysFromInputs(): void {

    this.formData.skills =
      this.skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(
          s => s.length > 0
        );


    this.formData.eligibleBatches =
      this.batchesInput
        .split(',')
        .map(b => b.trim())
        .filter(
          b => b.length > 0
        );

  }


  // ============================================================
  // SAVE JOB
  // ============================================================

  saveJob(): void {

    this.syncArraysFromInputs();


    if (
      !this.formData.title ||
      !this.formData.companyId ||
      !this.formData.deadline
    ) {

      this.fireToast(
        'Please fill all required fields.',
        'error'
      );

      return;
    }


    // EDIT
    if (
      this.isEditMode &&
      this.formData.id
    ) {

      this.companyService.updateJob(
        this.formData.id,
        this.formData
      );

      this.fireToast(
        'Job updated successfully!',
        'success'
      );

    }

    // ADD
    else {

      this.companyService.createJob(
        this.formData as Omit<
          Job,
          'id' | 'createdAt'
        >
      );

      this.fireToast(
        'Job posted successfully!',
        'success'
      );

    }


    this.closeModal();

    this.refresh();
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

      this.companyService.deleteJob(
        this.deleteTargetId
      );

      this.fireToast(
        'Job deleted.',
        'success'
      );

      this.refresh();
    }

    this.cancelDelete();
  }


  // ============================================================
  // STATUS
  // ============================================================

  toggleStatus(job: Job): void {

    const next: Job['status'] =
      job.status === 'open'
        ? 'closed'
        : 'open';


    this.companyService.updateJob(
      job.id,
      {
        status: next
      }
    );


    this.fireToast(
      `Job marked as ${next}.`,
      'success'
    );


    this.refresh();
  }


  // ============================================================
  // CHECK EXPIRED
  // ============================================================

  isExpired(job: Job): boolean {

    return (
      new Date(job.deadline) <
      new Date(
        new Date().toDateString()
      )
    );

  }


  // ============================================================
  // INITIALS
  // ============================================================

  getInitials(name: string): string {

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
  // ============================================================
  // STUDENT JOB APPLICATION
  // ============================================================
  // ============================================================


  openApplyModal(job: Job): void {

    // ----------------------------------------------------------
    // Only Student can apply
    // ----------------------------------------------------------

    if (!this.auth.isStudent()) {

      this.fireToast(
        'Only students can apply for jobs.',
        'error'
      );

      return;
    }


    // ----------------------------------------------------------
    // Job status
    // ----------------------------------------------------------

    if (job.status !== 'open') {

      this.fireToast(
        'This job is closed.',
        'error'
      );

      return;
    }


    // ----------------------------------------------------------
    // Deadline
    // ----------------------------------------------------------

    if (this.isExpired(job)) {

      this.fireToast(
        'Application deadline has expired.',
        'error'
      );

      return;
    }


    // ----------------------------------------------------------
    // Current student
    // ----------------------------------------------------------

    const student =
      this.studentService.getCurrentStudent();


    if (!student) {

      this.fireToast(
        'Student details not found.',
        'error'
      );

      return;
    }


    // ----------------------------------------------------------
    // Already applied
    // ----------------------------------------------------------

    if (
      this.applicationService.hasApplied(
        student.id,
        job.id
      )
    ) {

      this.fireToast(
        'You have already applied for this job.',
        'error'
      );

      return;
    }


    // ----------------------------------------------------------
    // Store selected job
    // ----------------------------------------------------------

    this.selectedJob = job;


    // ----------------------------------------------------------
    // Fill student details
    // ----------------------------------------------------------

    this.applicationForm = {

      studentName:
        student.name ?? '',

      registerNumber:
        student.id ?? '',

      email:
        student.email ?? '',

      phone:
        student.phone ?? '',

      department:
        student.department ?? '',

      jobId:
        job.id,

      jobTitle:
        job.title,

      companyName:
        job.companyName ?? '',

      coverLetter:
        '',

      resumeName:
        '',

      resumeData:
        ''

    };


    // Clear previous resume

    this.resumePreviewUrl = '';

    this.resumePreviewType = '';


    // Open modal

    this.showApplyModal = true;
  }


  // ============================================================
  // CLOSE APPLY MODAL
  // ============================================================

  closeApplyModal(): void {

    if (this.isSubmittingApplication) {
      return;
    }

    this.showApplyModal = false;

    this.selectedJob = null;

    this.applicationForm = {

      studentName: '',
      registerNumber: '',
      email: '',
      phone: '',
      department: '',
      jobId: '',
      jobTitle: '',
      companyName: '',
      coverLetter: '',
      resumeName: '',
      resumeData: ''

    };

    this.resumePreviewUrl = '';
    this.resumePreviewType = '';
  }
onApplyOverlayClick(event: MouseEvent): void {

  if (event.target === event.currentTarget) {
    this.closeApplyModal();
  }

}

  // ============================================================
  // RESUME UPLOAD
  // ============================================================

  onResumeSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;


    const file =
      input.files?.[0];


    if (!file) {
      return;
    }


    // ----------------------------------------------------------
    // Allowed file types
    // ----------------------------------------------------------

    const allowedTypes = [

      'application/pdf',

      'application/msword',

      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    ];


    if (!allowedTypes.includes(file.type)) {

      this.fireToast(
        'Please upload PDF or Word document only.',
        'error'
      );

      input.value = '';

      return;
    }


    // ----------------------------------------------------------
    // File size - maximum 5MB
    // ----------------------------------------------------------

    const maxSize =
      5 * 1024 * 1024;


    if (file.size > maxSize) {

      this.fireToast(
        'Resume size must be less than 5MB.',
        'error'
      );

      input.value = '';

      return;
    }


    // ----------------------------------------------------------
    // FileReader
    // ----------------------------------------------------------

    const reader =
      new FileReader();


    reader.onload = () => {

      const result =
        reader.result as string;


      this.applicationForm.resumeName =
        file.name;


      this.applicationForm.resumeData =
        result;


      this.resumePreviewUrl =
        result;


      this.resumePreviewType =
        file.type;

    };


    reader.readAsDataURL(file);
  }


  // ============================================================
  // REMOVE RESUME
  // ============================================================

  removeResume(): void {

    this.applicationForm.resumeName = '';

    this.applicationForm.resumeData = '';

    this.resumePreviewUrl = '';

    this.resumePreviewType = '';
  }


  // ============================================================
  // CHECK APPLICATION FORM
  // ============================================================

  isApplicationFormValid(): boolean {

    const form =
      this.applicationForm;


    return !!(

      form.studentName.trim() &&

      form.registerNumber.trim() &&

      form.email.trim() &&

      form.phone.trim() &&

      form.department.trim() &&

      form.resumeData

    );
  }


  // ============================================================
  // SUBMIT APPLICATION
  // ============================================================

  submitApplication(): void {

    // ----------------------------------------------------------
    // Prevent double click
    // ----------------------------------------------------------

    if (this.isSubmittingApplication) {
      return;
    }


    // ----------------------------------------------------------
    // Selected job check
    // ----------------------------------------------------------

    if (!this.selectedJob) {

      this.fireToast(
        'Job information not found.',
        'error'
      );

      return;
    }


    // ----------------------------------------------------------
    // Validate form
    // ----------------------------------------------------------

    if (!this.isApplicationFormValid()) {

      this.fireToast(
        'Please fill all required fields and upload your resume.',
        'error'
      );

      return;
    }


    // ----------------------------------------------------------
    // Student
    // ----------------------------------------------------------

    const student =
      this.studentService.getCurrentStudent();


    if (!student) {

      this.fireToast(
        'Student details not found.',
        'error'
      );

      return;
    }


    // ----------------------------------------------------------
    // Final duplicate check
    // ----------------------------------------------------------

    if (
      this.applicationService.hasApplied(
        student.id,
        this.selectedJob.id
      )
    ) {

      this.fireToast(
        'You have already applied for this job.',
        'error'
      );

      this.closeApplyModal();

      return;
    }


    this.isSubmittingApplication = true;


    // ----------------------------------------------------------
    // CREATE APPLICATION
    // ----------------------------------------------------------

    this.applicationService.createApplication({

      studentId:
        student.id,

      studentName:
        this.applicationForm.studentName,

      jobId:
        this.selectedJob.id,

      jobTitle:
        this.selectedJob.title,

      companyName:
        this.selectedJob.companyName ?? '',

      // Additional application information
      registerNumber:
        this.applicationForm.registerNumber,

      email:
        this.applicationForm.email,

      phone:
        this.applicationForm.phone,

      department:
        this.applicationForm.department,

      coverLetter:
        this.applicationForm.coverLetter,

      resumeName:
        this.applicationForm.resumeName,

      resumeData:
        this.applicationForm.resumeData

    } as any);


    // ----------------------------------------------------------
    // COMPANY NOTIFICATION
    // ----------------------------------------------------------

    const company =
      this.companyService.getCompanyById(
        this.selectedJob.companyId
      );


    if (company) {

      this.notificationService.addNotification({

        studentId:
          company.userId,

        companyName:
          company.name,

        subject:
          'New Job Application',

        message:
          `${student.name} applied for ${this.selectedJob.title}`,

        type:
          'shortlist'

      });

    }


    // ----------------------------------------------------------
    // ADMIN NOTIFICATION
    // ----------------------------------------------------------

    this.notificationService.addNotification({

      studentId:
        'admin-001',

      companyName:
        this.selectedJob.companyName,

      subject:
        'New Job Application',

      message:
        `${student.name} applied for ${this.selectedJob.title}`,

      type:
        'shortlist'

    });


    // ----------------------------------------------------------
    // SUCCESS
    // ----------------------------------------------------------

    this.isSubmittingApplication = false;

    this.closeApplyModal();

    this.fireToast(
      'Application submitted successfully!',
      'success'
    );
  }


  // ============================================================
  // OLD applyJob()
  // ============================================================
  // Existing HTML-la applyJob() use pannirundhaalum work aagum.
  // Ithu direct submit pannaama modal open pannum.
  // ============================================================

  applyJob(job: Job): void {

    this.openApplyModal(job);

  }


  // ============================================================
  // DOWNLOAD / PREVIEW RESUME
  // ============================================================

  previewResume(): void {

    if (!this.applicationForm.resumeData) {
      return;
    }


    const newWindow =
      window.open('', '_blank');


    if (!newWindow) {

      this.fireToast(
        'Please allow popups to preview the resume.',
        'error'
      );

      return;
    }


    // PDF preview

    if (
      this.resumePreviewType ===
      'application/pdf'
    ) {

      newWindow.document.write(`
        <html>
          <head>
            <title>${this.applicationForm.resumeName}</title>
          </head>

          <body style="margin:0">

            <iframe
              src="${this.applicationForm.resumeData}"
              style="
                width:100%;
                height:100vh;
                border:none;
              ">
            </iframe>

          </body>
        </html>
      `);

    }

    // Word document

    else {

      newWindow.document.write(`
        <html>
          <head>
            <title>Resume Preview</title>
          </head>

          <body
            style="
              font-family:Arial;
              padding:30px;
              text-align:center;
            "
          >

            <h2>Resume Uploaded</h2>

            <p>
              ${this.applicationForm.resumeName}
            </p>

            <p>
              Word document preview is not available
              directly in the browser.
            </p>

            <a
              href="${this.applicationForm.resumeData}"
              download="${this.applicationForm.resumeName}"
            >
              Download Resume
            </a>

          </body>
        </html>
      `);

    }


    newWindow.document.close();
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