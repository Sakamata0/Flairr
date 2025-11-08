import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsOptions } from './friends-options';

describe('FriendsOptions', () => {
  let component: FriendsOptions;
  let fixture: ComponentFixture<FriendsOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendsOptions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendsOptions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
