import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Cantiere} from 'app/models/cantiere.model';
import {CantieriService} from 'app/shared/services/data/cantieri.service';
import {LoggingService, LogLevel} from 'app/shared/services/logging/logging.service';
import {AttivitaBudgetModel, BudgetModel, CapitoloModel} from 'app/models/budget.model';
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {BudgetService} from 'app/shared/services/data/budget.service';
import {forkJoin, lastValueFrom} from 'rxjs';
import {SupplierService} from 'app/shared/services/data/supplier.service';
import {Supplier} from 'app/models/supplier.model';
import {ColumnMode} from "@swimlane/ngx-datatable";
import Swal from "sweetalert2";
import swal from "sweetalert2";
import {_File} from "../../../models/file.model";
import {FileService} from "../../services/data/file.service";

//Nella ngx-datatable ogni riga deve avere lo stesso formato, quindi devo unire capitoli e attività in un'unica struttura
interface BudgetRow {
  add?: string,
  capitolo: string,
  id: number,
  attivita: string,
  ricavi: number,
  costi: number,
  margine: number,
  percentualeRicavi: number,
  idFornitore: string,
  allegato: _File[],
  linkTo?: number,
  treeStatus: string,
}

@Component({
  selector: 'app-budget-cantiere',
  templateUrl: './budget-cantiere.component.html',
  styleUrls: ['./budget-cantiere.component.scss']
})

export class BudgetCantiereComponent implements OnInit {
  budget: BudgetModel;

  //da usare quando si modifica/aggiunge un capitolo
  editingCapitolo: CapitoloModel;

  addingAttivita: AttivitaBudgetModel;

  //id del capitolo selezionato
  selectedCapitolo: number;

  //dice se qualcosa è stato modificato
  edited: boolean;

  idCantiere: number;
  cantiere: Cantiere;
  fornitori: Map<number, Supplier>;
  fornitoriList: Supplier[] = [];

  //usato per la visualizzazione della tabella, visto che Capitoli e Attività devono avere lo stesso formato e vengono visualizzati insieme, potrebbero avere lo stesso ID
  virtualID: number = 1;

  rows: BudgetRow[] = [];

  constructor(
    private _cantieriService: CantieriService,
    private _budgetService: BudgetService,
    private _fornitoriService: SupplierService,
    private _router: ActivatedRoute,
    private _fileService: FileService,
    private modalService: NgbModal,) {
  }

  ngOnInit(): void {
    const target = this._router.snapshot.paramMap.get('id');
    this.idCantiere = Number.parseInt(target);

    this.getFornitori().then(() => this.refreshTable(true));

    this.budget = {
      id: 0,
      idCantiere: this.idCantiere,
      capitoli: [],
      totaleRicavi: 0,
      totaleCosti: 0,
      totaleMargine: 0,
      percentualeRicavi: 0,
    };

    this.budget.idCantiere = this.idCantiere;
    this._cantieriService.getCantiereFullSpecification(this.idCantiere)
      .subscribe(
        {
          next: (res) => {
            LoggingService.log("cantiere relativo ottenuto", LogLevel.debug, res);
            this.cantiere = res;
          },
          error: (err) => {

            LoggingService.log("ERRORE get cantiere", LogLevel.error, err);
          },
          complete: () => {
          }
        }
      )
  }

  async getFornitori() {
    let s = await lastValueFrom(this._fornitoriService.getAllFornitori())

    this.fornitoriList = [...s]

    this.fornitori = new Map(this.fornitoriList.map((obj) => [obj.id, obj]))

  }

  async saveBudget(b: BudgetModel, onOk?: Function) {

    this._budgetService.postBudget(b).subscribe(
      {
        next: (res) => {
          this.sendToast("Budget salvato", "Il budget è stato salvato con successo", true)
          this.budget = res.body;
          this.refreshTable()

          if (onOk)
            onOk(this.budget)
        },
        error: (err) => {
          this.sendToast("Budget NON salvato", "Il budget non è stato salvato con successo", false)

        },
        complete: () => {
        }
      }
    )

  }

  async getBudget() {
    const res = await lastValueFrom(this._budgetService.getBudgetByCantiereId(this.idCantiere))
    if (res.ok) {
      this.budget = res.body;

      this._budgetService.getAttachment(this.budget.id).subscribe(
        {
          next: (res) => {

            let attachments = res.body;

            for (let c of this.budget.capitoli) {
              for (let att of c.attivita) {
                att.allegato = attachments.filter(a => a.idAttivitaBudget === att.id).map(a => a.file)
              }

            }
            this.refreshTable()

          },
          error: (err) => {
            console.log(err)

          },
          complete: () => {
          }
        }
      )
    }

  }

  aggiornaTotali() {

    let b = this.budget;
    b.totaleRicavi = 0;
    b.totaleCosti = 0;
    b.totaleMargine = 0;
    b.percentualeRicavi = 0;

    for (let capitolo of this.budget.capitoli) {
      capitolo.totaleRicavi = 0;
      capitolo.totaleCosti = 0;
      capitolo.totaleMargine = 0;
      for (let attivita of capitolo.attivita) {

        attivita.margine = attivita.ricavi - attivita.costi;
        attivita.percentualeRicavi = this.round2Figures((attivita.margine / attivita.ricavi) * 100);

        if (isNaN(attivita.percentualeRicavi)) attivita.percentualeRicavi = 0;
        capitolo.totaleRicavi += attivita.ricavi;
        capitolo.totaleCosti += attivita.costi;
        capitolo.totaleMargine += attivita.margine;
      }

      b.totaleRicavi += capitolo.totaleRicavi;
      b.totaleCosti += capitolo.totaleCosti;

    }

    b.totaleMargine = b.totaleRicavi - b.totaleCosti;
    b.percentualeRicavi = this.round2Figures((b.totaleMargine / b.totaleRicavi) * 100);
    if (isNaN(b.percentualeRicavi)) b.percentualeRicavi = 0;

  }

  modificaCapitolo(modale, row: BudgetRow) {

    let capitolo = this.budget.capitoli.find(c => c.virtualID === row.id);

    this.edited = false
    this.selectedCapitolo = capitolo.id;
    this.editingCapitolo = structuredClone(capitolo);

    this.modalService.open(modale, {
      size: 'xl', backdrop: 'static',
      scrollable: true,
      keyboard: false
    });

  }

  editedChange() {

    this.edited = true;

  }

  openAddAttvitaModel(modale, row: BudgetRow) {

    this.selectedCapitolo = this.budget.capitoli.find(c => c.virtualID === row.id).id;

    this.addingAttivita = {
      attivita: "Attività",
      costi: 0,
      id: 0,
      margine: 0,
      percentualeRicavi: 0,
      ricavi: 0,
      allegato: [],
      allegatiDaEliminare: []
    };

    this.modalService.open(modale, {
      size: 'xl', backdrop: 'static',
      scrollable: true,
      keyboard: false
    });

  }

  openAddCapitoloModel(modale) {

    this.editingCapitolo = {
      attivita: [], capitolo: "Capitolo", id: 0, totaleCosti: 0, totaleMargine: 0, totaleRicavi: 0

    };

    this.modalService.open(modale, {
      size: 'xl', backdrop: 'static',
      scrollable: true,
      keyboard: false
    });

  }

  openEditConfirm(modal) {

    this.sendConfirmation('Vuoi salvare le modifiche?', "L'azione non sarà reversibile", () => {
      this.editConfirm();
      modal.close('Close click');
    })
  }

  editConfirm() {

    let tempB = structuredClone(this.budget);

    tempB.capitoli[tempB.capitoli.indexOf(tempB.capitoli.find(c => c.id === this.selectedCapitolo))] = this.editingCapitolo;

    let tempFiles: Map<number, _File[]> = new Map();

    for (let c of this.editingCapitolo.attivita) {

      if (c && c.allegato && c.allegato.length > 0)
        for (let f of c.allegato) {
          if (!f.id) {

            tempFiles.get(c.id) ? tempFiles.get(c.id).push(f) : tempFiles.set(c.id, [f]);

          }

        }

    }

    if (this.edited)
      this.saveBudget(tempB, (nB: BudgetModel) => {

        let observables = [];

        //aggiunge i file in più
        for (let e of tempFiles.entries()) {
          let formData = new FormData();

          for (let allegato of (e[1])) {

            formData.append("formFiles", allegato as any);

          }

          let t = this._budgetService.postAttachment(e[0], formData)

          observables.push(t)

        }

        //rimuove i file selezionati da eliminare

        //la riga corrispondere AttachmentBudget viene elminata in automatico ON CASCADE

        let cap = tempB.capitoli.find(c => c.id === this.selectedCapitolo)
        for (let a of cap.attivita) {

          if (a.allegatiDaEliminare && a.allegatiDaEliminare.length > 0) {

            let t = this._fileService.deleteFiles(a.allegatiDaEliminare.map((a) => a.id))

            observables.push(t)
          }

        }

        //elimina le attività selezionate da eliminare
        if (cap.attivitaDaEliminare)
          for (let a of cap.attivitaDaEliminare) {

            let t = this._budgetService.deleteAttivita(a)

            observables.push(t)
          }

        if (observables && observables.length > 0) {

          forkJoin(observables).subscribe({
            next: (res) => {
              this.refreshTable(true);
            },
            error: (err) => {
              console.log(err)
              this.sendToast("Errore", "Il budget non è stato salvato con successo", false)
            },
            complete: () => {

            }
          });
        } else {

          this.refreshTable(true);

        }

      });

  }

  addCapitoloConfirm() {

    if (this.editingCapitolo.attivita.length > 0) {
      this.editingCapitolo.attivita = [];
    }

    let temp = structuredClone(this.budget);
    temp.capitoli.push(this.editingCapitolo);

    this.saveBudget(temp);

  }

  addAttivitaConfirm() {

    let tempFiles = this.addingAttivita.allegato

    let capitolo = this.budget.capitoli.find(c => c.id === this.selectedCapitolo)

    let tempB = structuredClone(this.budget)

    let temp = tempB.capitoli.find(c => c.id === capitolo.id)

    temp.attivita.push(this.addingAttivita);

    this.saveBudget(tempB, (nB: BudgetModel) => {

      let attivitaId = 0;

      for (let c of nB.capitoli) {

        if (c.id === temp.id) {
          for (let a of c.attivita) {
            if (!this.contains(temp.attivita, a.id)) {
              attivitaId = a.id;
            }
          }
        }
      }

      if (attivitaId !== 0) {

        let formData = new FormData();

        for (let allegato of tempFiles) {

          formData.append("formFiles", allegato as any);

        }

        this._budgetService.postAttachment(attivitaId, formData).subscribe({
          next: (res) => {

            this.refreshTable(true);
          },
          error: (err) => {
            console.log(err)

          },
          complete: () => {
          }
        });

      }

    });

  }

  contains(list: AttivitaBudgetModel[], id: number) {
    for (let a of list) {
      if (a.id === id) {
        return true;
      }
    }
    return false;

  }

  downloadFile(file: _File) {
    this._fileService.downloadFile(file);

  }

  onFileChange(event, a: AttivitaBudgetModel) {
    a.allegato = Array.from(event.target.files);
  }

  onFileChangeEdit(event, a: AttivitaBudgetModel) {

    if (!a.allegato) {
      a.allegato = []

    }

    for (let f of Array.from(event.target.files)) {

      // @ts-ignore
      f.fileName = f.name
      a.allegato.push(f as any);

    }

  }

  deleteCapitoloConfirm(modal: NgbActiveModal) {
    this.sendConfirmation('Vuoi eliminare il capitolo?', "L'azione non sarà reversibile", () => {
      this.deleteCapitolo();
      modal.dismiss('Cross click');
    })

  }

  deleteCapitolo() {

    this._budgetService.deleteCapitolo(this.budget.capitoli.find(c => c.id === this.selectedCapitolo)).subscribe(
      {
        next: (res) => {
          this.sendToast("Budget salvato", "Il capitolo è stato eliminato con successo", true)
          this.arrayRemove(this.budget.capitoli, this.selectedCapitolo);
          this.refreshTable(true);
        },
        error: (err) => {
          this.sendToast("Budget NON salvato", "Il capitolo non è stato eliminato con successo", false)

        },
        complete: () => {
        }
      }
    )

  }

  refreshTable(getDataFromServer = false) {
    if (getDataFromServer) {

      this.getBudget().then(() => {

        this.aggiornaTotali();
        this.translateBudgetToRows()

      })

    } else {
      this.aggiornaTotali();
      this.translateBudgetToRows()
    }

  }

  deleteAllegato(att: AttivitaBudgetModel, file: _File) {

    this.arrayRemove(att.allegato, file);
    if (!att.allegatiDaEliminare) {
      att.allegatiDaEliminare = [];
    }
    att.allegatiDaEliminare.push(file);

  }

  deleteAttivita(a: AttivitaBudgetModel) {

    this.arrayRemove(this.editingCapitolo.attivita, a);

    if (!this.editingCapitolo.attivitaDaEliminare) {

      this.editingCapitolo.attivitaDaEliminare = [];
      this.editingCapitolo.attivitaDaEliminare.push(a);
    }

    this.arrayRemove(this.editingCapitolo.attivita, a);

  }

  arrayRemove(arr, value) {
    const index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
  }

  round2Figures(val: number) {

    return Math.round(val * 100) / 100;

  }

  onTreeAction(event: any) {
    const index = event.rowIndex;
    const row = event.row;
    if (row.treeStatus === 'collapsed') {
      row.treeStatus = 'expanded';
    } else {
      row.treeStatus = 'collapsed';
    }
    this.rows = [...this.rows];
  }

  translateBudgetToRows() {

    let ret: BudgetRow[] = [];

    this.virtualID = 1;

    for (let capitolo of this.budget.capitoli) {

      capitolo.virtualID = this.virtualID;

      let c = {
        capitolo: capitolo.capitolo,
        id: this.virtualID,
        attivita: "",
        ricavi: capitolo.totaleRicavi,
        costi: capitolo.totaleCosti,
        margine: capitolo.totaleMargine,
        percentualeRicavi: 0,
        idFornitore: "",
        allegato: [],
        "treeStatus": "collapsed"

      }
      this.virtualID++;
      ret.push(c);
      for (let attivita of capitolo.attivita) {
        if (attivita) {
          attivita.virtualID = this.virtualID;

          let f = this.fornitori.get(attivita.idFornitore)

          let a: BudgetRow = {
            capitolo: capitolo.capitolo,
            id: this.virtualID,
            attivita: attivita.attivita,
            ricavi: attivita.ricavi,
            costi: attivita.costi,
            margine: attivita.margine,
            percentualeRicavi: attivita.percentualeRicavi,
            idFornitore: f ? f.name : "Nessun fornitore",
            allegato: attivita.allegato as any,
            linkTo: c.id,
            "treeStatus": "disabled"

          }
          this.virtualID++;

          ret.push(a);
        }

      }

    }

    this.rows = [...ret]

  }

  sendConfirmation(title: string, description: string, onConfirmFn: Function) {
    swal.fire({
      title: title ? title : 'Sei sicuro?',
      text: description ? description : '',
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonColor: '#2F8BE6',
      cancelButtonColor: '#F55252',
      cancelButtonText: 'Annulla',
      confirmButtonText: 'Si',
      customClass: {
        confirmButton: 'btn btn-danger ',
        cancelButton: 'btn btn-info ms-1'
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.value) {
        onConfirmFn();
      }
    });
  }

  sendToast(title: string, description: string, success: boolean) {

    this.Toast.fire({
      title: title,
      text: description,
      icon: (success ? 'success' : "error"),
    });

  }

  Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });
  protected readonly columnMode = ColumnMode;
}
