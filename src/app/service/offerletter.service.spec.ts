import { TestBed } from '@angular/core/testing';

import { OfferletterService } from './offerletter.service';

describe('OfferletterService', () => {
  let service: OfferletterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfferletterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
