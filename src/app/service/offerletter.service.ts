import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { OfferLetter } from '../models/spms';
import { NotificationService } from './notification.service';

const K = StorageService.KEYS;

@Injectable({
  providedIn: 'root'
})
export class OfferLetterService {

  constructor(
    private storage: StorageService,
    private notificationService: NotificationService
  ) {}

  getAll(): OfferLetter[] {
    return this.storage.get<OfferLetter[]>(K.OFFERS) ?? [];
  }
add(data: Omit<OfferLetter, 'id' | 'sentAt'>): void {

  const offers = this.getAll();

  // Check if same offer already exists
  const alreadyExists = offers.some(
    offer =>
      offer.studentId === data.studentId &&
      offer.companyId === data.companyId &&
      offer.jobTitle === data.jobTitle
  );

  // Prevent duplicate offer
  if (alreadyExists) {

    console.log('Offer Letter already sent for this student.');

    return;
  }

  // Save new offer
  offers.push({
    ...data,
    id: 'offer-' + Date.now(),
    sentAt: new Date().toISOString()
  });

  this.storage.set(K.OFFERS, offers);

  // Send notification to student
  this.notificationService.addNotification({

    studentId: data.studentId,

    companyName: data.companyName,

    subject: 'Offer Letter',

    message:
      `Congratulations! ${data.companyName} has sent you an Offer Letter for ${data.jobTitle}.`,

    type: 'offer'

  });

}

  getByStudent(studentId: string): OfferLetter[] {

    return this.getAll().filter(x => x.studentId === studentId);

  }

}