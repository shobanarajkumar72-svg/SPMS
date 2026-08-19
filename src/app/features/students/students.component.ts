import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import Swal from "sweetalert2";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";

import { Student } from "../../models/spms";
import { AuthService } from "../../service/auth.service";
import { StudentService } from "../../service/student.service";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: "app-students",

  standalone: true,

  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],

  templateUrl: "./students.component.html",

  styleUrls: ["./students.component.scss"],
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];

  filtered: Student[] = [];

  searchQuery = "";

  filterStatus = "";

  filterDept = "";

  departments: string[] = [];

  constructor(
    private studentService: StudentService,

    public auth: AuthService,

    private toastr: ToastrService,

    private router: Router
  ) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.students = this.studentService.getAll();

    this.departments = [
      ...new Set(this.students.map((x) => x.department).filter(Boolean)),
    ];
    this.applyFilters();
  }

  applyFilters() {
    const q = this.searchQuery.toLowerCase();

    this.filtered = this.students.filter((s) => {
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q);

      const status = !this.filterStatus || s.status === this.filterStatus;

      const dept = !this.filterDept || s.department === this.filterDept;

      return matchQ && status && dept;
    });
  }

  openAdd() {
    this.router.navigate(["/students/create"]);
  }

  openEdit(s: Student) {
    this.router.navigate(["/students/edit", s.id]);
  }

 delete(id: string) {
  Swal.fire({
    title: "Delete student?",
    text: "This action cannot be undone",
    icon: "warning",

    showCancelButton: true,

    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",

    // Outside click pannina popup close aagaathu
    allowOutsideClick: false,

    // ESC press pannalum close aagaathu
    allowEscapeKey: false,

    // Delete button mattum click pannina action nadakkum
    focusCancel: true

  }).then((result) => {

    if (result.isConfirmed) {

      this.studentService.delete(id);

      this.toastr.success(
        "Student deleted successfully"
      );

      this.load();
    }

  });
}

  getStatusClass(status: string) {
    return status === "placed"
      ? "badge-green"
      : status === "available"
        ? "badge-blue"
        : "badge-red";
  }
}
