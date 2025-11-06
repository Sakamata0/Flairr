import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentPopUp } from './comment-pop-up';

describe('CommentPopUp', () => {
  let component: CommentPopUp;
  let fixture: ComponentFixture<CommentPopUp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentPopUp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentPopUp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
