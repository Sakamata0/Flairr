import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPanel } from './card-panel';

describe('CardPanel', () => {
  let component: CardPanel;
  let fixture: ComponentFixture<CardPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
