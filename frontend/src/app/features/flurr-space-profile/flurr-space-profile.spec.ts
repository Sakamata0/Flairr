import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlurrSpaceProfile } from './flurr-space-profile';

describe('FlurrSpaceProfile', () => {
  let component: FlurrSpaceProfile;
  let fixture: ComponentFixture<FlurrSpaceProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlurrSpaceProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlurrSpaceProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
