import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StudentService } from '../../service/student.service';
import { AuthService } from '../../service/auth.service';
import { Student } from '../../models/spms';

interface ProfileSettings {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  rollNumber: string;
}

interface NotificationPrefs {
  emailAlerts: boolean;
  interviewReminders: boolean;
  offerAlerts: boolean;
  generalUpdates: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  currentStudent!: Student;

  activeTab: 'profile' | 'security' | 'notifications' = 'profile';

  profile: ProfileSettings = {
    fullName: '',
    email: '',
    phone: '',
    department: '',
    rollNumber: ''
  };

  passwords = {
    current: '',
    newPassword: '',
    confirm: ''
  };

  prefs: NotificationPrefs = {
    emailAlerts: true,
    interviewReminders: true,
    offerAlerts: true,
    generalUpdates: false
  };

  saveMessage = '';

  ngOnInit(): void {

    const student = this.studentService.getCurrentStudent();

    if (student) {

      this.currentStudent = student;

      this.profile = {
        fullName: student.name,
        email: student.email,
        phone: student.phone,
        department: student.department,
        rollNumber: student.rollNo
      };

    }

  }

  setTab(tab: 'profile' | 'security' | 'notifications'): void {
    this.activeTab = tab;
    this.saveMessage = '';
  }

  saveProfile(): void {

    if (!this.currentStudent) return;

    this.studentService.update(this.currentStudent.id, {
      name: this.profile.fullName,
      email: this.profile.email,
      phone: this.profile.phone,
      department: this.profile.department,
      rollNo: this.profile.rollNumber
    });

    this.saveMessage = 'Profile updated successfully.';
  }

  changePassword(): void {

    if (!this.passwords.current || !this.passwords.newPassword) {
      this.saveMessage = 'Please fill all password fields.';
      return;
    }

    if (this.passwords.newPassword !== this.passwords.confirm) {
      this.saveMessage = 'Passwords do not match.';
      return;
    }

    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.saveMessage = 'User not found.';
      return;
    }

    const users = JSON.parse(localStorage.getItem('spms_users') || '[]');

    const index = users.findIndex((u: any) => u.id === currentUser.id);

    if (index === -1) {
      this.saveMessage = 'User not found.';
      return;
    }

    if (users[index].password !== this.passwords.current) {
      this.saveMessage = 'Current password is incorrect.';
      return;
    }

    users[index].password = this.passwords.newPassword;

    localStorage.setItem('spms_users', JSON.stringify(users));

    this.passwords = {
      current: '',
      newPassword: '',
      confirm: ''
    };

    this.saveMessage = 'Password changed successfully.';
  }

  savePreferences(): void {

    localStorage.setItem(
      'notificationPrefs',
      JSON.stringify(this.prefs)
    );

    this.saveMessage = 'Notification preferences saved.';
  }

}