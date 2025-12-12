import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneysSelector } from './journeys-selector';

describe('JourneysSelector', () => {
  let component: JourneysSelector;
  let fixture: ComponentFixture<JourneysSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JourneysSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JourneysSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
