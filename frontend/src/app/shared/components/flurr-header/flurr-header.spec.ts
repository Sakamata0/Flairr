import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlurrHeader } from './flurr-header';

describe('FlurrHeader', () => {
  let component: FlurrHeader;
  let fixture: ComponentFixture<FlurrHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlurrHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlurrHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
