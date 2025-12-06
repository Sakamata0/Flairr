import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsSelector } from './notifications-selector';

describe('NotificationsSelector', () => {
  let component: NotificationsSelector;
  let fixture: ComponentFixture<NotificationsSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
