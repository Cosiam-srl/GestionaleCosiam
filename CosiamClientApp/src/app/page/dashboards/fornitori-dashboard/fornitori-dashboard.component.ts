import { registerLocaleData } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Cantiere } from 'app/models/cantiere.model';
import { ScadenzeFornitore, Supplier } from 'app/models/supplier.model';
import { SupplierService } from 'app/shared/services/data/supplier.service';
import localeIt from '@angular/common/locales/it';
import swal from 'sweetalert2';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-fornitori-dashboard',
  templateUrl: './fornitori-dashboard.component.html',
  styleUrls: ['./fornitori-dashboard.component.scss']
})
export class FornitoriDashboardComponent implements OnInit {

  // attributo per le tabs
  active = 1;
  // variabile che conterrà l'id del fornitore
  idFornitore;
  fornitore: Supplier = new Supplier();
  nuovofornitore: Supplier = new Supplier();
  // variabile che contiene tutte le scadenze insieme
  scadenzeFornitore: ScadenzeFornitore[] = [];
  // variabile che contiene la lista dei cantieri in cui questo mezzo è attualmente occupato(NON CONTIENE I CANTIERI TERMINATI)
  cantieriFornitore: Cantiere[] = [];

  // roba per il form di modifica
  fff = false;
  // variabili usata quando viene aggiunto un file alla creazione di una cliente
  fileName = '';
  formData = new FormData();
  // variabile usata per il logo del fornitore, visualizzato all'inizio della dashboard
  imageSource: SafeResourceUrl;
  constructor(private sanitizer: DomSanitizer, private _modalService: NgbModal, private _fornitoriservice: SupplierService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    registerLocaleData(localeIt, 'it-IT');
    // Estraggo l'id dall'url
    const target = this.activatedRoute.snapshot.paramMap.get('id');
    this.idFornitore = Number.parseInt(target);
    this._fornitoriservice.getFornitore(this.idFornitore)
      .subscribe(
        (res) => {
          LoggingService.log('Fornitore scaricato', LogLevel.debug, res);
          this.fornitore = res;
          this.nuovofornitore = res;
        },
        (err) => {
          LoggingService.log('ERRORE get Fornitore ', LogLevel.error, err);
        },
        () => {
          document.getElementById('cards').click();
          this.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(this.fornitore.file as string);
        },
      )
    this._fornitoriservice.getCantieriFornitore(this.idFornitore)
      .subscribe(
        (res) => {
          LoggingService.log('get cantieri in cui il fornitore è impiegato', LogLevel.debug, res);
          this.cantieriFornitore = res;
        },
        (err) => {
          LoggingService.log('ERRORE get cantieri in cui il fornitore è impiegato ', LogLevel.error, err);
        },
        () => {
          // elimino dalla lista i cantieri che sono terminati
          const cantieriCorretti = [];
          this.cantieriFornitore.forEach(cantiere => {
            if (cantiere.state != 'Terminato') {
              cantieriCorretti.push(cantiere);
            }
          });
          this.cantieriFornitore = cantieriCorretti;
          LoggingService.log('cantieri in cui il mezzo lavora', LogLevel.debug, this.cantieriFornitore);
        },
      )
    this._fornitoriservice.getScadenzeFornitoreFiltered(this.idFornitore, false, null, 30)
      .subscribe(
        (res: ScadenzeFornitore[]) => {
          LoggingService.log('Scadenze filtrate 30 giorni ottenute', LogLevel.debug, res);
          this.scadenzeFornitore = res;
        },
        (err) => {
          LoggingService.log('ERRORE get scadenze filtrate 30 giorni', LogLevel.error, err);
        },
        () => {
          document.getElementById('cards').click();
        }
      )
  }
  // metodo utilizzato per aprire un popup di modifica
  openLg(content) {
    this._modalService.open(content, {
      size: 'xl', backdrop: 'static',
      keyboard: false
    });

  }
  updateFornitore() {
    this._fornitoriservice.updateFornitore(this.nuovofornitore)
      .subscribe(
        (res) => {
          LoggingService.log('fornitore aggiornato', LogLevel.debug, res);
          this.fornitore = res;
          swal.fire({
            icon: 'success',
            title: 'Fatto!',
            text: 'Il fornitore è stato modificato. La pagina verrà ricaricata.',
            customClass: {
              confirmButton: 'btn btn-success'
            },
          }).then(() => {
            location.reload();
          });
        },
        (err) => {
          LoggingService.log('fornitore NON aggiornato', LogLevel.error, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il fornitore non è stato modificato.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {

        },
      )
  }
  // funzione chiamata quando si chiude il popup di modifica del mezzo
  cleanNuovoFornitore() {
    this.nuovofornitore = new Supplier();
  }

   // funzione chiamata quando nel form di creazione viene aggiunto un allegato(una foto)
   addImageToFornitore(event) {
    this.fileName = '';
    LoggingService.log('file caricato', LogLevel.debug, event);
    const files = event.target.files;
    LoggingService.log('filexxx', LogLevel.debug, files);
    // this.formData.append("formFiles", files);
    if (files) {
      // this.formData = new FormData();
      for (const file of files) {
        this.fileName = this.fileName.concat(file.name) + '; ';
        this.formData.append('formFiles', file);
      }
      LoggingService.log('formdata', LogLevel.debug, this.formData.getAll('formFiles'));
    }
    // formdata satà sempre costituito da un unico file in questo caso
    // const file=this.formData.get("formFiles");
    const file = event.target.files[0] as File
    LoggingService.log('file è', LogLevel.warn, file);
    if (file.size > 1000000) {
      swal.fire({
        icon: 'error',
        title: 'C\'è stato un problema!',
        text: 'Il file caricato supera le dimensioni di 1MB. Riprova con uno piu leggero.',
        customClass: {
          confirmButton: 'btn btn-danger'
        }
      });
      this.deleteImageFornitore();
      return;
    }
    if (file.type.substring(0, 5) != 'image') {
      swal.fire({
        icon: 'error',
        title: 'C\'è stato un problema!',
        text: 'Il file caricato non è una immagine. Riprova',
        customClass: {
          confirmButton: 'btn btn-danger'
        }
      });
      this.deleteImageFornitore();
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log(reader.result);
      this.nuovofornitore.file = reader.result;
    };
    this.fff = true;
  };
  // funzione chiamata quando nel form di creazione si eliminano gli allegati aggiunti
  deleteImageFornitore() {
    // svuoto effetticamente l'input file per evitare che non mi carichi lo stesso file selezionato in precedenza
    (document.getElementById('inputGroupFile01') as HTMLInputElement).value = null;

    this.fileName = '';
    this.formData = new FormData();
  }
  // chiamata quando si vuol rimuovere il logo senza sovrascriverlo con un altro
  removeLogoFornitore() {
    this.nuovofornitore.file = null;
    swal.fire({
      icon: 'warning',
      title: 'Importante!',
      text: 'Il logo verrà rimosso solo se confermi le modifiche. Se non lo fai, al ricaricamento della pagina troverai il logo precedente',
      customClass: {
        confirmButton: 'btn btn-success'
      },
    });
    this.fff = true;
  }

  validationForm(form) {

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
  };

}
