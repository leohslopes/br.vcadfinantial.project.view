import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportLog } from './report-log';

describe('ReportLog', () => {
  let component: ReportLog;
  let fixture: ComponentFixture<ReportLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportLog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportLog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
