import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlurrCreationCard } from './flurr-creation-card';

describe('FlurrCreationCard', () => {
  let component: FlurrCreationCard;
  let fixture: ComponentFixture<FlurrCreationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlurrCreationCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlurrCreationCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
