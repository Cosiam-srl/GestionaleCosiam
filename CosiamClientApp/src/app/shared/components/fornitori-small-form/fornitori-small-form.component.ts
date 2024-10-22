import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Supplier } from 'app/models/supplier.model';
import { CantieriService } from 'app/shared/services/data/cantieri.service';
import { SupplierService } from 'app/shared/services/data/supplier.service';
import { LogLevel, LoggingService } from 'app/shared/services/logging/logging.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'fornitori-small-form',
  templateUrl: './fornitori-small-form.component.html',
  styleUrls: ['./fornitori-small-form.component.scss']
})
export class FornitoriSmallFormComponent implements OnInit {

  @Input('idCantiere') idCantiere: number;
  @Output() fornitoreAdded: EventEmitter<boolean> = new EventEmitter<boolean>();
  nuovofornitore = new Supplier();
  constructor(
    private _cantieriService: CantieriService,
    private _spinner: NgxSpinnerService,
    private _fornitoriservice: SupplierService) { }

  ngOnInit(): void {
  }

  creaFornitore() {
    LoggingService.log('il nuovofornitore è', LogLevel.debug, this.nuovofornitore);
    this._spinner.show("spinnerFornitoreQuick",
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',//colore sfondo
        color: '#fcfc03',//colore icona che si muove
        fullScreen: false
      });
    this._fornitoriservice.postFornitore(this.nuovofornitore)
      .subscribe(
        (res) => {
          LoggingService.log('nuovo fornitore postato con successo', LogLevel.debug, res);
          this.nuovofornitore.id = res.id;
          this.addFornitoreToCantiere();
        },
        (err) => {
          LoggingService.log('ERRORE post nuovofornitore', LogLevel.debug, err);
        },
     
      )

  }
  addFornitoreToCantiere() {
    this._cantieriService.postFornitoriCantiere(this.idCantiere, [this.nuovofornitore.id]).subscribe(
      (res) => {
        this.fornitoreAdded.emit(true);
        setTimeout(() => {
          this._spinner.hide("spinnerFornitoreQuick")
        }, 200);
       },
      (err) => {
        LoggingService.log('errore nel post personale cantiere', LogLevel.warn, err);
          this._spinner.hide("spinnerFornitoreQuick")
       },
    )
  }

}
