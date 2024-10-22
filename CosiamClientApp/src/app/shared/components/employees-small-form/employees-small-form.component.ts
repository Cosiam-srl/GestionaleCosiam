import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { Personale } from 'app/models/personale.model';
import { CantieriService } from 'app/shared/services/data/cantieri.service';
import { PersonaleService } from 'app/shared/services/data/personale.service';
import { LogLevel, LoggingService } from 'app/shared/services/logging/logging.service';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'employees-small-form',
  templateUrl: './employees-small-form.component.html',
  styleUrls: ['./employees-small-form.component.scss']
})
export class EmployeesSmallFormComponent implements OnInit {

  @Input('idCantiere') idCantiere: number;
  @Output() personaleAdded: EventEmitter<boolean> = new EventEmitter<boolean>();

  // personale che si popolerà con le nuove informazioni inserite nel form
  nuovopersonale = new Personale();
  disableConfirm: boolean = true;
  constructor(
    private _personaleservice: PersonaleService,
    private _cantieriService: CantieriService,
    private _spinner: NgxSpinnerService) { }

  ngOnInit(): void {

  }

  // funzione utilizzata dal datepicker
  cambia(event: NgbDate, binding: string) {
    LoggingService.log('cambia è', LogLevel.debug, event);
    switch (binding) {
      case 'datanascita': {
        if (event.month != 9 && event.month != 10 && event.month != 11 && event.month != 12) {
          this.nuovopersonale.birthday = event.year + '/' + '0' + (event.month + 1).toString() + '/' + event.day;
        } else {
          this.nuovopersonale.birthday = event.year + '/' + (event.month + 1).toString() + '/' + event.day;
        }
        LoggingService.log('la data di nascita del nuovo personale è', LogLevel.debug, this.nuovopersonale.birthday);
        break;
      }
      default: {
        LoggingService.log('problemino col datepicker', LogLevel.debug);
        // statements;
        break;
      }
    }
  }

  creaPersonale() {
    this.nuovopersonale.fullName = this.nuovopersonale.name + ' ' + this.nuovopersonale.surname;
    if (this.nuovopersonale.cf)
      this.nuovopersonale.cf = this.nuovopersonale.cf.toUpperCase();

    LoggingService.log('il nuovopersonale è', LogLevel.debug, this.nuovopersonale);
    this._spinner.show("spinnerPersonaleQuick",
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',//colore sfondo
        color: '#fcfc03',//colore icona che si muove
        fullScreen: false
      });
    this._personaleservice.postPersonale(this.nuovopersonale)
      .subscribe(
        (res) => {
          LoggingService.log('nuovopersonale postato con successo', LogLevel.debug, res);
          this.addPersonaleToCantiere(res.id);
        },
        (err: HttpErrorResponse) => {
          this._spinner.hide("spinnerPersonaleQuick")
          LoggingService.log('ERRORE post nuovopersonale', LogLevel.debug, err);
          // this._spinner.hide();
          var t = 'La persona NON è stata creata.';
          if (err.status == 409) {
            t = 'L\'email inserita è già correlata ad un personale o ad un utente esistente';
          }
        }
      );

  }
  addPersonaleToCantiere(idPersonale: number) {
    this._cantieriService.postPersonaleCantiere(this.idCantiere, [idPersonale], null, null)
      .subscribe(
        (res) => {
          this.personaleAdded.emit(true);
          //emetto l'evento e aggiungo 200ms per dare piu tempo al report di cantiere di riscaricare la lista di tutto il personale
          setTimeout(() => {
            this._spinner.hide("spinnerPersonaleQuick")
          }, 200);
        },
        (err) => {
          LoggingService.log('errore nel post personale cantiere', LogLevel.warn, err);
          this._spinner.hide("spinnerPersonaleQuick")
        }
      );

  }
}
