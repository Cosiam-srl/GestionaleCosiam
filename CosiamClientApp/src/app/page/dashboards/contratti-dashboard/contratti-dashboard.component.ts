import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PrezziarioGenerale } from 'app/models/benieservizi.model';
import { Cliente } from 'app/models/cliente.model';
import { Contratto } from 'app/models/contratto.model';
import { Personale } from 'app/models/personale.model';
import { ClientiService } from 'app/shared/services/data/clienti.service';
import { ContrattoService } from 'app/shared/services/data/contratti.service';
import { PersonaleService } from 'app/shared/services/data/personale.service';
import { PrezziarioGeneraleService } from 'app/shared/services/data/prezziariogenerale.service';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-contratti-dashboard',
  templateUrl: './contratti-dashboard.component.html',
  styleUrls: ['./contratti-dashboard.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ContrattiDashboardComponent implements OnInit {

  idContratto: number;
  // variabile che contiene il contratto della dashboard
  nuovocontratto = new Contratto();
  // variabile che contiene il pm del contratto della dashboard
  pmContratto = new Personale();
  // contiene la lista di tutto il personale
  personale_get: Personale[] = [];
  // array di tutti i clienti
  clientiget: Cliente[] = [];
  // variabile che contiene tutti i prezziari generali
  prezziariget: PrezziarioGenerale[] = [];
  // variabile utilizzata per la validazione del form
  fff = true;

  constructor(private router: ActivatedRoute, private modalService: NgbModal, private contrattoservice: ContrattoService, private personaleservice: PersonaleService, private clientiservice: ClientiService, private prezziariogeneraleservice: PrezziarioGeneraleService) { }

  ngOnInit(): void {
    this.idContratto = Number.parseInt(this.router.snapshot.paramMap.get('id') ?? '0');
    this.contrattoservice.getContratto(this.idContratto)
      .subscribe(
        (res) => {
          LoggingService.log('contratto ottenuto', LogLevel.debug, res);
          this.nuovocontratto = res;
        },
        (err) => {
          LoggingService.log('Errore get contratto', LogLevel.debug, err);
        },
        () => {

          this.personaleservice.getAllPersonale()
            .subscribe(
              (res) => {
                LoggingService.log('contratto ottenuto', LogLevel.debug, res);
                this.personale_get = res;
                this.personale_get.forEach((i) => {
                  i.fullName = i.name + ' ' + i.surname;
                })
              },
              (err) => {
                LoggingService.log('Errore get personale', LogLevel.debug, err);
              },
              () => {
                document.getElementById('contrattocard').click();
                this.pmContratto = this.personale_get.find(i => i.id == this.nuovocontratto.idPm);
                LoggingService.log('pm contratto è', LogLevel.debug, this.pmContratto);
                document.getElementById('contrattocard').click();
              },
            )

        },
      );

    // popolo l'array clientiget in modo da poter usare i clienti nel form del crea cantiere
    this.clientiservice.getAllClienti()
      .subscribe(
        (res) => { this.clientiget = res },
        (err) => {
          LoggingService.log('errore nel recupero dei clienti', LogLevel.warn, err)
        },
        () => { LoggingService.log('array cienti estratti', LogLevel.debug, this.clientiget) }
      );
    this.prezziariogeneraleservice.getAllPrezziariGenerali()
      .subscribe(
        (res) => {
          LoggingService.log('Scaricata lista prezziari generali ', LogLevel.debug, res);
          this.prezziariget = res;
        },
        (err) => {
          LoggingService.log('Errore get prezziari generali ', LogLevel.error, err)
        },
        () => { },
      )

  }
  // metodo utilizzato per aprire un popup di modifica
  openLg(content) {
    this.modalService.open(content, {
      size: 'xl', backdrop: 'static',
      keyboard: false
    });
  }
  // funzione chiamata quando si vuol chiudere il popup di modifica, senza quindi effetivamente aver modificato il contratto
  restoreData() {
    this.contrattoservice.getContratto(this.idContratto)
      .subscribe(
        (res) => {
          LoggingService.log('contratto riottenuto', LogLevel.debug, res);
          this.nuovocontratto = res;
        },
        (err) => {
          LoggingService.log('Errore riget contratto', LogLevel.debug, err);
        },
        () => {
          document.getElementById('contrattocard').click();
        }
      )
  }
  // funzione chiamata alla modifica del contratto, dopo aver confermato
  updateContratto() {
    this.contrattoservice.updateContratto(this.nuovocontratto.id, this.nuovocontratto)
      .subscribe(
        (res) => {
          LoggingService.log('ok update andato', LogLevel.debug, res);
          this.clientiget.forEach(i => {
            if (i.id == this.nuovocontratto.idCliente) {
              this.nuovocontratto.cliente = i;
            }
          })

          this.personale_get.forEach(i => {
            if (i.id == this.nuovocontratto.idPm) {
              this.nuovocontratto.pm = i;
            }
          })
          swal.fire({
            icon: 'success',
            title: 'Fatto!',
            text: 'Il contrattp è stato modificato',
            customClass: {
              confirmButton: 'btn btn-success'
            },
          });
        },
        (err) => {
          LoggingService.log('errore update', LogLevel.debug, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il contratto NON è stato modificato',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {
          this.pmContratto = this.personale_get.find(i => i.id == this.nuovocontratto.idPm);
        },
      )
  }
  // funzione chiamata alla modifica dei dettagli del contratto, dopo aver confermato
  updateDettagliContratto() {

  }
  // funzione utilizzata per convalidare o meno il form di modifica del contratto
  validationForm(form) {
    LoggingService.log('form', LogLevel.debug, form)
    if (form.status == 'VALID') {
      this.fff = true;
      return;
    } else {
      this.fff = false
      return;
    }
  }
  onResized(event: any) {
    setTimeout(() => {
      this.fireRefreshEventOnWindow();
    }, 300);
  }
  fireRefreshEventOnWindow = function () {
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('resize', true, false);
    window.dispatchEvent(evt);
  }
}
