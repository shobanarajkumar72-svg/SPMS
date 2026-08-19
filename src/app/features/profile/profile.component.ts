import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { StudentService } from '../../service/student.service';
import { CompanyService } from '../../service/company.service';
import { ApplicationService } from '../../service/application.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  user: any;
  student: any = null;
  company: any = null;
  latestApplication: any = null;
  placement: any = null;
   applications: any[] = []; 

  constructor(
    private auth: AuthService,
    private studentService: StudentService,
    private companyService: CompanyService,
    private applicationService: ApplicationService
  ) {

    this.user = this.auth.getCurrentUser();

  if (this.user?.role === 'student') {

    this.student = this.studentService.getCurrentStudent();

   if (this.student) {

        this.applications =
          this.applicationService.getApplicationsByStudent(this.student.id);

        this.latestApplication =
          this.applicationService.getLatestApplication(this.student.id);

        this.placement =
          this.applicationService.getPlacementByStudent(this.student.id);
      }
  }

  if (this.user?.role === 'company') {
    this.company =
      this.companyService.getCompanyByUserId(this.user.id);
  }
  console.log("Current User:", this.user);

if (this.user?.role === 'company') {

  console.log("User ID:", this.user.id);

  this.company = this.companyService.getCompanyByUserId(this.user.id);

  console.log("Company Data:", this.company);

}
}
  }