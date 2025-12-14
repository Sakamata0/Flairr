import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlurrDetail } from './flurr-detail';

describe('FlurrDetail', () => {
  let component: FlurrDetail;
  let fixture: ComponentFixture<FlurrDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlurrDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlurrDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
