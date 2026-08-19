import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Notification, OfferLetter } from '../../models/spms';
import { NotificationService } from '../../service/notification.service';
import { AuthService } from '../../service/auth.service';
import { StudentService } from '../../service/student.service';
import { OfferLetterService } from '../../service/offerletter.service';
import jsPDF from 'jspdf';
@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  notifications: Notification[] = [];
  offers: OfferLetter[] = [];

  currentStudentId = '';

  unreadCount = 0;

  showDeleteConfirm = false;
deleteNotificationId: string | null = null;

showToast = false;
toastMessage = '';
toastType: 'success' | 'error' = 'success';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private studentService: StudentService,
    private offerLetterService: OfferLetterService
  ) { }

  ngOnInit(): void {

    const user = this.authService.getCurrentUser();

    if (!user) return;

    if (user.role === 'student') {

      const student = this.studentService.getByUserId(user.id);

      if (!student) return;

      this.currentStudentId = student.id;

    } else {

      // Company & Admin
      this.currentStudentId = user.id;

    }

    this.loadNotifications();

  }
  loadNotifications(): void {

    this.notifications =
      this.notificationService.getStudentNotifications(
        this.currentStudentId
      );

    this.unreadCount =
      this.notificationService.unreadCount(
        this.currentStudentId
      );
    this.offers = [];

    const user = this.authService.getCurrentUser();

    if (user?.role === 'student') {

      this.offers = this.offerLetterService.getByStudent(
        this.currentStudentId
      );

    }


  }
  downloadOfferLetter(offer: OfferLetter): void {

  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFER LETTER', 105, 30, { align: 'center' });

  doc.line(20, 38, 190, 38);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(offer.companyName, 20, 55);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  doc.text('Dear Student,', 20, 75);

  const message =
    offer.message ||
    `We are pleased to offer you the position of ${offer.jobTitle} at ${offer.companyName}.`;

  const messageLines = doc.splitTextToSize(message, 170);

  doc.text(messageLines, 20, 90);

  let y = 125;

  doc.setFont('helvetica', 'bold');
  doc.text('Offer Details', 20, y);

  y += 15;

  doc.setFont('helvetica', 'normal');

  doc.text(`Company Name : ${offer.companyName}`, 25, y);
  y += 10;

  doc.text(`Job Title     : ${offer.jobTitle}`, 25, y);
  y += 10;

  doc.text(`Salary        : ${offer.salary}`, 25, y);
  y += 10;

  doc.text(`Joining Date  : ${offer.joiningDate}`, 25, y);

  y += 25;

  doc.text(
    'We look forward to having you join our organization.',
    20,
    y
  );

  y += 30;

  doc.text('Authorized Signatory', 20, y);
  doc.text(offer.companyName, 20, y + 8);

  doc.setFontSize(9);
  doc.setTextColor(100);

  doc.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    20,
    285
  );

  const fileName =
    `Offer-Letter-${offer.companyName}-${offer.jobTitle}.pdf`
      .replace(/[^a-zA-Z0-9.-]/g, '_');

  doc.save(fileName);
}

  markAsRead(notification: Notification): void {

    if (notification.isRead) {
      return;
    }

    this.notificationService.markAsRead(notification.id);

    this.loadNotifications();

  }

  markAllAsRead(): void {

    this.notificationService.markAllAsRead(
      this.currentStudentId
    );

    this.loadNotifications();

  }

 deleteNotification(id: string): void {

  this.deleteNotificationId = id;

  this.showDeleteConfirm = true;

}
confirmDeleteNotification(): void {

  if (!this.deleteNotificationId) {
    return;
  }

  this.notificationService.delete(
    this.deleteNotificationId
  );

  this.loadNotifications();

  this.showToastMessage(
    'Notification deleted successfully!',
    'success'
  );

  this.cancelDeleteNotification();

}


cancelDeleteNotification(): void {

  this.showDeleteConfirm = false;

  this.deleteNotificationId = null;

}


showToastMessage(
  message: string,
  type: 'success' | 'error'
): void {

  this.toastMessage = message;

  this.toastType = type;

  this.showToast = true;

  setTimeout(() => {

    this.showToast = false;

  }, 3000);

}

  getIcon(type: string): string {

    switch (type) {

      case 'offer':
        return '🎉';

      case 'shortlist':
        return '✅';

      case 'interview':
        return '📅';

      case 'rejection':
        return '❌';


      case 'application':
        return '📩';

      default:
        return '🔔';

    }

  }

  formatDate(date: string): string {

    return new Date(date).toLocaleString();

  }

}