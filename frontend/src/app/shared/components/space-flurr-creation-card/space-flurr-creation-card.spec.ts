import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceFlurrCreationCard } from './space-flurr-creation-card';

describe('SpaceFlurrCreationCard', () => {
  let component: SpaceFlurrCreationCard;
  let fixture: ComponentFixture<SpaceFlurrCreationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceFlurrCreationCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceFlurrCreationCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
