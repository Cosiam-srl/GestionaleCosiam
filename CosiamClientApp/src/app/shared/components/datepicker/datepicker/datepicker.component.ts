import { Component, Input, OnInit } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss']
})
export class DatepickerComponent implements OnInit {

  hoveredDate: NgbDate | null = null;

  @Input() numeroMesi;

  fromDate: NgbDate | null;
  toDate: NgbDate | null;

  constructor(private calendar: NgbCalendar, public formatter: NgbDateParserFormatter) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 0);
  }


  ngOnInit(): void {
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    // stampo le date cliccate su console
    this.getDate();
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }
  /**
   * Stampa la data di partenza e quella di fine
   */
  getDate() {
    if (this.toDate != null) {
      LoggingService.log('date cliccate', LogLevel.debug, [this.fromDate.day, this.fromDate.month, this.fromDate.year, this.toDate.day, this.toDate.month, this.toDate.year])
    }
  }
  clearDate() {
    LoggingService.log('clear data', LogLevel.debug, [this.fromDate.day, this.fromDate.month, this.fromDate.year, this.toDate.day, this.toDate.month, this.toDate.year])
    this.fromDate = null;
    this.toDate = null;
  }
}
