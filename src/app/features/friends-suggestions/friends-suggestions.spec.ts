import { ComponentFixture, TestBed } from '@angular/core/testing';

import { friendsSuggestions } from './friends-suggestions';

describe('Friends', () => {
  let component: friendsSuggestions;
  let fixture: ComponentFixture<friendsSuggestions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [friendsSuggestions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(friendsSuggestions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
