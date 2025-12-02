import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpacesCard } from './spaces-card';

describe('SpacesCard', () => {
  let component: SpacesCard;
  let fixture: ComponentFixture<SpacesCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpacesCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpacesCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
