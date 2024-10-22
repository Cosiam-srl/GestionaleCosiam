import {DatePipe, registerLocaleData} from '@angular/common';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgbDate, NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {LoggingService, LogLevel} from 'app/shared/services/logging/logging.service';
import localeIt from '@angular/common/locales/it';
import * as moment from 'moment';

@Component({
  selector: 'app-datepicker-single',
  templateUrl: './datepicker-single.component.html',
  styleUrls: ['./datepicker-single.component.scss']
})
export class DatepickerSingleComponent extends NgbDateParserFormatter implements OnInit {
  // inutilizzato
  readonly DT_FORMAT = 'dd/MM/yyyy';

  date;
  // input property:stringa utilizzata come placeholder
  @Input() ph = '';
  // input property:stringa utilizzata come placeholder
  @Input() pos = '';
  // output property: alla selezione della data emette l'evento
  @Output() cambiadata = new EventEmitter<NgbDate>()
  @Input() disabled = false;
  @Input() value: string;
  @Input() initialValue: string;

  // variabile che binda la data scelta nel datepicker
  fromDate: NgbDate | null;

  // inutilizzato
  parse(value: string): NgbDateStruct {

    if (value) {
      value = value.trim();
      const mdt = moment(value, this.DT_FORMAT)
    }
    return this.date;
  }

  // inutilizzato
  format(date: NgbDateStruct): string {
    if (!date) {
      return '';
    }
    const mdt = moment([date.year, date.month - 1, date.day]);
    if (!mdt.isValid()) {
      return '';
    }
    return mdt.format(this.DT_FORMAT);
  }

  constructor(private datePipe: DatePipe) {
    super();

  }

  ngOnInit(): void {
    registerLocaleData(localeIt, 'it-IT');

    if (this.initialValue)
      this.value = this.initialValue
  }

  getData(event) {
    // event è un date. devo convertirlo in ngbdate prima
    // i mesi partono da 0 e arrivano fino a 11
    LoggingService.log('event', LogLevel.log, event.target.value);
    // LoggingService.log("event anno", LogLevel.error, event.target.valueAsDate);
    const eventToNgbDate = new NgbDate(Number.parseFloat(event.target.value.substring(0, 4)), Number.parseFloat(event.target.value.substring(5, 7)) - 1, Number.parseFloat(event.target.value.substring(8, 10)));
    console.warn(eventToNgbDate, 'RICORDA: i mesi partono da 0 fino a 11');
    this.fromDate = eventToNgbDate;
    this.onChange();
    ///
    // const data = new Date();
    // data.setFullYear(eventToNgbDate.year, eventToNgbDate.month + 1, eventToNgbDate.day);
    // LoggingService.log("data settata", LogLevel.error, data);
    // this.date = data;
    // this.date = this.datePipe.transform(this.date, 'dd-MM-yyyy');
    // this.fromDate=new NgbDate(data.getFullYear(),data.getMonth(), data.getDate());

    // LoggingService.log("data aggiuntaxxxxxxx", LogLevel.debug, this.date);
    // LoggingService.log("fromdate è", LogLevel.debug, this.fromDate);
    // this.onChange();
  }

  clearDate() {
    this.date = null;
    this.fromDate = null;
  }

  // funzione chiamata quando si sceglie la data nel datepicker
  onChange() {
    // quì non è utile ottenere la data e l'ora all'istante//
    const millisec = Date.now();
    const date = new Date(millisec);
    const ore = Number.parseInt(date.toTimeString().substring(0, 2));
    const minuti = Number.parseInt(date.toTimeString().substring(3, 5));
    const secondi = Number.parseInt(date.toTimeString().substring(6, 8))
    LoggingService.log('fromdate nell\'onchange è', LogLevel.debug, this.fromDate);

    // const date= new Date(this.fromDate.year, this.fromDate.month, this.fromDate.day);
    this.cambiadata.emit(this.fromDate);
  }
}
