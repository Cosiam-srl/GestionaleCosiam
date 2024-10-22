import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ServizioFornitore } from 'app/models/benieservizi.model';
import { SupplierService } from 'app/shared/services/data/supplier.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { lastValueFrom } from 'rxjs';
import swal from 'sweetalert2';
import { BeniEServiziComponent } from '../beni-e-servizi/beni-e-servizi.component';

@Component({
  selector: 'beni-servizi-small-form',
  templateUrl: './beni-e-servizi-small-form.component.html',
  styleUrl: './beni-e-servizi-small-form.component.scss'
})
export class BeniEServiziSmallFormComponent {

  @Input('idFornitore') idFornitore: number;
  @Output() servizioFornitoreAdded: EventEmitter<boolean> = new EventEmitter<boolean>();
  nuovoServizio = new ServizioFornitore();

  // unità di misura prestabilite, prese dal componente beniEServiziComponent
  ums = BeniEServiziComponent.ums
  /**
   *
   */
  constructor(
    private _spinner: NgxSpinnerService,
    private _servizifornitore: SupplierService
  ) { }

  async creaServizio() {
    this.nuovoServizio.idFornitore = this.idFornitore.toString();
    var res = await lastValueFrom(this._servizifornitore.postServizioFornitore(this.nuovoServizio))
      .catch((err) => {
        swal.fire({
          icon: 'error',
          title: 'C\'è stato un problema!',
          text: 'L\'elemento NON è stato creato.',
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        });
      });

    if (res) {
      swal.fire({
        title: 'Elemento Aggiunto!',
        text: 'L\'elemento è stato aggiunto tra i servizi del fornitore',
        icon: 'success',
        customClass: {
          confirmButton: 'btn btn-primary'

        },
        buttonsStyling: false,
        confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
      });

      this.servizioFornitoreAdded.emit(true);

    }

  }


}
