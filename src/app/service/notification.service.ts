import { Injectable, signal } from '@angular/core';
import { Notification } from '../models/spms';

const STORAGE_KEY = 'spms_notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  notifications = signal<Notification[]>(this.load());

  constructor() {}

  // -------------------------
  // LocalStorage
  // -------------------------

  private load(): Notification[] {

    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    );

  }

  private save(data: Notification[]): void {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );

    this.notifications.set(data);

  }

  // -------------------------
  // Get All
  // -------------------------

  getAll(): Notification[] {

    return this.notifications();

  }

  // -------------------------
  // Student Notifications
  // -------------------------

  getStudentNotifications(studentId: string): Notification[] {

    return this.notifications()

      .filter(x => x.studentId === studentId)

      .sort((a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
      );

  }

  // -------------------------
  // Add
  // -------------------------

  addNotification(data: {

    studentId: string;

    companyName: string;

    subject: string;

    message: string;

    type: 'offer' | 'interview' | 'shortlist' | 'rejection';

  }): void {

    const list = this.notifications();

    const notification: Notification = {

      id: 'NOTI-' + Date.now(),

      studentId: data.studentId,

      companyName: data.companyName,

      subject: data.subject,

      message: data.message,

      type: data.type,

      date: new Date().toISOString(),

      isRead: false

    };

    list.unshift(notification);

    this.save(list);

  }

  // -------------------------
  // Read
  // -------------------------

  markAsRead(id: string): void {

    const list = this.notifications();

    const index = list.findIndex(x => x.id === id);

    if (index !== -1) {

      list[index].isRead = true;

      this.save(list);

    }

  }

  // -------------------------
  // Read All
  // -------------------------

  markAllAsRead(studentId: string): void {

    const list = this.notifications();

    list.forEach(x => {

      if (x.studentId === studentId) {

        x.isRead = true;

      }

    });

    this.save(list);

  }

  // -------------------------
  // Delete
  // -------------------------

  delete(id: string): void {

    const list =
      this.notifications()
      .filter(x => x.id !== id);

    this.save(list);

  }

  // -------------------------
  // Unread Count
  // -------------------------

  unreadCount(studentId: string): number {

    return this.notifications()

      .filter(x =>
        x.studentId === studentId &&
        !x.isRead
      )

      .length;

  }

}