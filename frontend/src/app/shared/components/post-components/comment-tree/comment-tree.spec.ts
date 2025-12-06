import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentTree } from './comment-tree';

describe('CommentTree', () => {
  let component: CommentTree;
  let fixture: ComponentFixture<CommentTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentTree]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
