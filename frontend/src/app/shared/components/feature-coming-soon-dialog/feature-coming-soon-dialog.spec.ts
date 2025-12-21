import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureComingSoonDialog } from './feature-coming-soon-dialog';

describe('FeatureComingSoonDialog', () => {
  let component: FeatureComingSoonDialog;
  let fixture: ComponentFixture<FeatureComingSoonDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureComingSoonDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureComingSoonDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
