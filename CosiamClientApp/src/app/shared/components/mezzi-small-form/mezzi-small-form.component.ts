import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Mezzo } from 'app/models/mezzo.model';
import { CantieriService } from 'app/shared/services/data/cantieri.service';
import { MezziService } from 'app/shared/services/data/mezzi.service';
import { LogLevel, LoggingService } from 'app/shared/services/logging/logging.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'mezzi-small-form',
  templateUrl: './mezzi-small-form.component.html',
  styleUrls: ['./mezzi-small-form.component.scss']
})
export class MezziSmallFormComponent implements OnInit {

  @Input('idCantiere') idCantiere: number;
  @Output() mezzoAdded: EventEmitter<boolean> = new EventEmitter<boolean>();

  // mezzo che si popolerà con le nuove informazioni inserite nel form
  nuovomezzo = new Mezzo();
  constructor(
    private _mezziService: MezziService,
    private _cantieriService: CantieriService,
    private _spinner: NgxSpinnerService) { }

  ngOnInit(): void {
  }

  creaMezzo() {
    this._spinner.show("spinnerMezziQuick",
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',//colore sfondo
        color: '#fcfc03',//colore icona che si muove
        fullScreen: false
      });
    LoggingService.log('il nuovomezzo è', LogLevel.debug, this.nuovomezzo);
    this._mezziService.postMezzo(this.nuovomezzo)
      .subscribe(
        (res) => {
          this.nuovomezzo.id = res.id;
          this.addMezzoToCantiere();
        },
        (err) => {
          LoggingService.log('ERRORE post nuovomezzo', LogLevel.debug, err);
        }
      )
  }

  addMezzoToCantiere() {
    this._cantieriService.postMezziCantiere(this.idCantiere, [this.nuovomezzo.id], new Date().toISOString().substring(0,10), '0001-01-01').subscribe(
      (res) => {
        this.mezzoAdded.emit(true);
      },
      (err) => {
        LoggingService.log("Errore aggiunta mezzo al cantiere", LogLevel.debug, err);
      },
      () => {
        setTimeout(() => {
          this._spinner.hide("spinnerMezziQuick")
        }, 200);
      }
    )
  }
}
