import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniProfileCard } from './mini-profile-card';

describe('MiniProfileCard', () => {
  let component: MiniProfileCard;
  let fixture: ComponentFixture<MiniProfileCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniProfileCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniProfileCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
