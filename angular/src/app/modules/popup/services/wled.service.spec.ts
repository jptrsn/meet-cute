import { TestBed } from '@angular/core/testing';

import { WledService } from './wled.service';

describe('WledService', () => {
  let service: WledService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WledService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
