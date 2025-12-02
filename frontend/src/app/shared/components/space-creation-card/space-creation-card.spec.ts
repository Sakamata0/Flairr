import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceCreationCard } from './space-creation-card';

describe('SpaceCreationCard', () => {
  let component: SpaceCreationCard;
  let fixture: ComponentFixture<SpaceCreationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceCreationCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceCreationCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
