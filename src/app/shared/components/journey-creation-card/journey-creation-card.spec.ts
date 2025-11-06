import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyCreationCard } from './journey-creation-card';

describe('JourneyCreationCard', () => {
  let component: JourneyCreationCard;
  let fixture: ComponentFixture<JourneyCreationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JourneyCreationCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JourneyCreationCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
