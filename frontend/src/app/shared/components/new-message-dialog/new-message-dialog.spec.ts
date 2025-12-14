import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMessageDialog } from './new-message-dialog';

describe('NewMessageDialog', () => {
  let component: NewMessageDialog;
  let fixture: ComponentFixture<NewMessageDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewMessageDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewMessageDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
