import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators,AbstractControl } from "@angular/forms";

import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "../../../service/auth.service";

import { StudentService } from "../../../service/student.service";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule, MatOption } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-student-create",

  standalone: true,

  imports: [
    CommonModule, ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatOption,
    MatIconModule,
  ],

  templateUrl: "./student-create.component.html",

  styleUrls: ["./student-create.component.scss"],
})
export class StudentCreateComponent implements OnInit {
  fb = inject(FormBuilder);

  editId: string | null = null;

  isSaving = false;
    hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private router: Router,

    private studentService: StudentService,

     private authService: AuthService,

    private toastr: ToastrService,

    private route: ActivatedRoute
  ) { }

  studentForm = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(3)]],

    email: ["", [Validators.required, Validators.email]],

    phone: ["", [Validators.required, Validators.pattern("^[0-9]{10}$")]],

    department: ["", Validators.required],

    batch: ["", Validators.required],

    cgpa: ['', [Validators.required, Validators.min(0), Validators.max(10)]],

    skillsText: ["", Validators.required],

    status: ["available", Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
  confirmPassword: ['', Validators.required]
  },{
    validators: this.passwordMatchValidator
  });
   passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return password === confirmPassword
      ? null
      : { passwordMismatch: true };
  }

  ngOnInit(): void {
    this.editId = this.route.snapshot.paramMap.get("id");

    if (this.editId) {
      this.studentForm.get('password')?.clearValidators();
  this.studentForm.get('confirmPassword')?.clearValidators();

  this.studentForm.get('password')?.updateValueAndValidity();
  this.studentForm.get('confirmPassword')?.updateValueAndValidity();

      const student = this.studentService
        .getAll()
        .find((x) => x.id === this.editId);

      if (student) {
        this.studentForm.patchValue({
          name: student.name,

          email: student.email,

          phone: student.phone,

          department: student.department,

          batch: student.batch,

          cgpa: String(student.cgpa),

          skillsText: student.skills?.join(", ") || "",

          status: student.status,
        });
      }
    }
  }

  save() {

    debugger
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const value = this.studentForm.value;

    const skills = (value.skillsText ?? "")

      .split(",")

      .map((skill) => skill.trim())

      .filter(Boolean);

    const student: any = {
      ...value,

      skills,

      appliedJobs: [],
    };

    delete student.skillsText;
    delete student.confirmPassword;

    if (this.editId) {
      
      // UPDATE

      this.studentService.update(
        this.editId,

        student
      );

      this.toastr.success(
        "Student updated successfully",

        "Success"
      );
    } else {

  const result = this.authService.register(
    student.name,
    student.email,
    student.password,
    "student"
  );

  if (!result.success) {
    this.toastr.error(result.message, "Error");
    this.isSaving = false;
    return;
  }

  this.studentService.create({
    ...student,
    userId: result.user!.id
  });

  this.toastr.success(
    "Student added successfully",
    "Success"
  );
}

    this.isSaving = false;

    this.router.navigate(["/students"]);
  }

  cancel() {
    this.router.navigate(["/students"]);
  }

  get f() {
    return this.studentForm.controls;
  }
}
