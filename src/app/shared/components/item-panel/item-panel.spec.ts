import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemPanel } from './item-panel';

describe('ItemPanel', () => {
  let component: ItemPanel;
  let fixture: ComponentFixture<ItemPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
