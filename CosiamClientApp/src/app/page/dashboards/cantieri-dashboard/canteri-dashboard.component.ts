import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CantieriService } from "app/shared/services/data/cantieri.service";
import {
  AvanzamentoTemporaleCantiere,
  Cantiere,
  DatiFinanziari,
} from "app/models/cantiere.model";
import {
  LoggingService,
  LogLevel,
} from "app/shared/services/logging/logging.service";
import { TaggedNota } from "app/models/taggednota.model";
import { _File } from "app/models/file.model";
import { Cliente } from "app/models/cliente.model";
import { ClientiService } from "app/shared/services/data/clienti.service";
import { Personale } from "app/models/personale.model";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ContrattoService } from "app/shared/services/data/contratti.service";
import { Contratto } from "app/models/contratto.model";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PersonaleService } from "app/shared/services/data/personale.service";
import swal from "sweetalert2";
import { FinancialCardService } from "app/shared/services/data/financialCard.service";
import {
  TableColumn,
  TableDataRow,
} from "app/shared/components/editable-grid-mini/editable-grid-mini.component";
import {
  addValoriAggiuntivi,
  dataToStringValue,
  removeValoriAggiuntivi,
} from "../../../models/valoriaggiuntivi.model";

declare var require: any;

const data: any = require("../../../shared/data/chartist.json");

const budgetColumns: TableColumn[] = [
  { name: "COSTI", cellStyle: "color: red" },
  { name: "RICAVI", cellStyle: "color: red" },
  { name: "UTILE", cellStyle: "color: red" },
  { name: "colonna4", cellStyle: "color: red" },
];

const dataArray: TableDataRow[] = [
  {
    COSTI: {
      title: "titolo1.1",
      value: "1.11",
      format: "number",
      titleClasses: "text-success",
    },
    RICAVI: {
      title: "titolo1.2",
      value: "1,24",
      format: "string",
      titleClasses: "text-primary",
    },
    UTILE: {
      title: "titolo1.3",
      value: "2,10",
      format: "currency",
      titleClasses: "text-primary",
    },
  },
  {
    COSTI: {
      title: "titolo2.1",
      value: "2,10",
      format: "currency",
      readonly: true,
    },
    RICAVI: {
      title: "titolo2.2",
      value: "2.2",
      format: "string",
      titleClasses: "text-danger",
    },
    UTILE: {
      title: "titolo2.2",
      value: "2.2",
      format: "string",
      titleClasses: "text-danger",
    },
  },
  {
    colonna1: {
      title: "titolo3.1",
      value: new Date(Date.now()).toISOString(),
      format: "datetime",
      titleClasses: "text-primary",
    },
  },
];

@Component({
  selector: "app-canteri-dashboard",
  templateUrl: "./canteri-dashboard.component.html",
  styleUrls: ["./canteri-dashboard.component.scss"],
})
export class CanteriDashboardComponent implements OnInit {
  // @ViewChild("svg")
  // svgRef: ElementRef;
  dataArray = dataArray;
  budgetColumns = budgetColumns;

  model: Cantiere;
  releated = [
    { id: 1, desc: "desc1" },
    { id: 2, desc: "desc2" },
    { id: 3, desc: "desc3" },
  ];
  relatedNotes: TaggedNota[] = [];
  // variabile usata dal popover descrizione nella card nomecliente
  descrizionebella = "Hello, i need <br/> to break line.<b>BOLD HERE</b>";
  dettaglioimporto = "Ciao";
  infoaggiuntive = "Prova";
  descrizionelavori = "";
  html = '<span class="btn btn-danger waves-light">Your HTML here</span>';
  meteo = {
    today: "/",
    tomorrow: "/",
    dayaftertomor: "/",
    weather1: "",
    weather2: "",
    weather3: "",
  };
  avanzamentoTemporale = new AvanzamentoTemporaleCantiere();
  // usati per la tabella in dati finanziari
  avanzamentoProduzione = 0;
  avanzamentoProduzionePerc = 0;
  ////////////////////////////////////////
  // galleria immagini
  relatedImages: String[] = [];
  // array che contiene le ultime 5 note del cantiere
  lastFiveNotes: TaggedNota[] = [];
  // cliente cantiere
  clienteCantiere: Cliente;
  // pm cantiere
  pmsCantiere: Personale[];
  // capocantiente
  capoCantieri: Personale[];
  // variabile che conterrà l'id del cantiere attuale
  idCantiere: number;
  // variabile che conterrà il contratto da cui dipende il cantiere
  contrattoCantiere: Contratto;
  // variabile usata quando si modifica il cantiere
  nuovocant = new Cantiere();
  // elenco contratti
  contrattiget: Contratto[] = [];
  // contiene la lista di tutto il personale
  personale_get: Personale[];
  // contiene i pm selezionati nel crea cantiere
  pm_selezionati: number[];
  // contiene i capocantieri selezionati nel crea cantieri
  capocantieri_selezionati: number[];
  // flag usata per la card dati finanziari. Cambia quando si clicca sul tasto modifica
  mod = false;
  // variabile usata sempre per la card dati finanziari che poi non servirà più
  datiFinanziariCantiere = new DatiFinanziari();
  nuoviDatiFinanziariCantiere = new DatiFinanziari();

  // variabile usata per l'elenco delle categorie SOA nel crea cantiere
  soa = [];
  // roba per il form dati finanziari
  fff = false;
  // roba per il form di modifica del cantiere
  cantiereFormIsValid = false;
  // variabile utilizzata per creare una stringa di categorie SOA quando si crae un cantiere
  SOA = "";
  // variabile usata SOLO per fare il binding con le categorie soa nell'ng-select del popup di modifica
  soaInModify = [];
  // variabile usata per il logo visualizzato all'inizio della dashboard
  imageSource: SafeResourceUrl | null = null; // URL dell'immagine reale o null se non disponibile
  placeholderImage = "./assets/img/elements/Placeholder.jpg"; // URL dell'immagine placeholder
  // variabili usate per modificare il proxSal nella card dei dati finanziari

  valoreDellaProduzione = 0;
  mancanti = 0;
  modifyProxSal = false;

  // attributo per le tabs
  active = 1;
  active2 = 1;

  //cashflow
  editCashFlow: boolean = false;

  avatar: string;

  constructor(
    private contrattoservice: ContrattoService,
    private _servicepersonale: PersonaleService,
    private _modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private cantieriserv: CantieriService,
    private clientiservice: ClientiService,
    private _datiFinanziariService: FinancialCardService
  ) {
    const target = activatedRoute.snapshot.paramMap.get("id");
    this.idCantiere = Number.parseInt(target);

    // // scarico le immagini da passare alla galleria
    // cantieriserv.getImmaginiCantiere(this.idCantiere)
    //   .subscribe(
    //     (res) => {

    //       this.relatedImages = [...res];
    //     },
    //     (err) => {
    //       LoggingService.log('errore nel recupero delle immagini', LogLevel.warn, err)
    //     },
    //     () => { LoggingService.log('immagini estratte', LogLevel.debug, this.relatedImages) }
    //   );
  }

  ngOnInit(): void {
    // Estraggo l'id dall'url
    const target = this.activatedRoute.snapshot.paramMap.get("id");
    this.idCantiere = Number.parseInt(target);

    this.cantieriserv.getCantiereFullSpecification(this.idCantiere).subscribe(
      (res) => {
        this.model = res;

        this.riempiSoaCantiere();

        LoggingService.log("cantiere estratto", LogLevel.debug, this.model);
      },
      (err) => {
        LoggingService.log(
          "errore nel recupero del cantiere",
          LogLevel.error,
          err
        );
      },
      () => {
        this.descrizionelavori = this.model.description;

        this.contrattoservice.getContratto(this.model.idContratto).subscribe(
          (res) => {
            LoggingService.log(
              "contratto relativo al cantiere ottenuto",
              LogLevel.debug,
              res
            );
            this.contrattoCantiere = res;

            // riempio il menu a tendina delle categorie soa nel popup di modifica

            // if (this.contrattoCantiere.soa && this.contrattoCantiere.soa.length > 0) {
            //   this.contrattoCantiere.soa.forEach((element) => {
            //     this.soa.push({ name: element.toString() });
            //   })
            // }
            this.model.idClienti = this.contrattoCantiere.idCliente;

            this.clientiservice
              .getCliente(this.contrattoCantiere.idCliente)
              .subscribe(
                (res) => {
                  LoggingService.log("cliente estratto", LogLevel.debug, res);
                  this.clienteCantiere = res;
                },
                (err) => {
                  LoggingService.log(
                    "errore get clienti ",
                    LogLevel.error,
                    err
                  );
                },
                () => {
                  // imposto il logo sulla dashboard, preso dal cliente
                  LoggingService.log(
                    "il logo del cliente è ",
                    LogLevel.warn,
                    this.clienteCantiere
                  );
                  if (this.clienteCantiere.file)
                    this.imageSource =
                      this.sanitizer.bypassSecurityTrustResourceUrl(
                        this.clienteCantiere.file as string
                      );
                  document.getElementById("cardPrincipale").click();
                }
              );
          },
          (err) => {
            LoggingService.log("ERRORE get contratto ", LogLevel.error, err);
          },
          () => {}
        );

        this.cantieriserv.getPMsCantiere(this.idCantiere).subscribe(
          (res: Personale[]) => {
            LoggingService.log("pm cantiere ottenuto", LogLevel.debug, res);
            if (res.length > 0) {
              this.pmsCantiere = res;
              this.pmsCantiere.forEach((element) => {
                if (element.name && element.surname)
                  element.fullName = element.name + " " + element.surname;
              });
            }
          },
          (err) => {
            LoggingService.log("errore get pm cantiere ", LogLevel.debug, err);
          },
          () => {}
        );
        this.cantieriserv.getForemenCantiere(this.idCantiere).subscribe(
          (res) => {
            LoggingService.log("cc cantiere ottenuto", LogLevel.debug, res);
            if (res?.length > 0) {
              this.capoCantieri = res;
              this.capoCantieri.forEach((el) => {
                if (el.name != undefined && el.surname != undefined) {
                  el.fullName = el.name + " " + el.surname;
                }
              });
            }
          },
          (err) => {
            LoggingService.log("errore get cc cantiere ", LogLevel.debug, err);
          },
          () => {}
        );

        this._datiFinanziariService.getAllFinancialCards().subscribe(
          (res) => {
            console.log("Scaricati tutti i dati finanziari", res);
            res.forEach((dati) => {
              if (dati.idCantiere.toString() == target) {
                this.datiFinanziariCantiere = dati;
                if (this.valoreDellaProduzione) {
                  this.mancanti =
                    Number.parseFloat(this.datiFinanziariCantiere.proxSal) -
                    Number.parseFloat(this.valoreDellaProduzione.toString());
                }
              }
            });
          },
          (err) => {
            console.error("Errore get tutti i dati finanziari", err);
          }
        );

        // if (this.model.cap != undefined && this.model.cap != null) {
        //   this.scaricameteo(this.model.cap);

        // this.cantieriserv.getLatLongMeteo(this.model.cap).subscribe(
        //   (res: { name: string, lat: number, lon: number, country: string }) => {

        //     LoggingService.log('latitudine e longitudine ottenute tramite cap ', LogLevel.debug, res);
        //     LoggingService.log('latitudine e longitudine ottenute tramite cap ', LogLevel.debug, [res[0].lat, res[0].lon]);
        //     this.cantieriserv.getmeteo(res[0].lat, res[0].lon)
        //       .subscribe(
        //         (res) => {
        //           this.meteo.today = Math.round(((res.daily[0].temp.min) + (res.daily[0].temp.max)) / 2);
        //           this.meteo.tomorrow = Math.round(((res.daily[1].temp.min) + (res.daily[1].temp.max)) / 2);
        //           this.meteo.dayaftertomor = Math.round(((res.daily[2].temp.min) + (res.daily[2].temp.max)) / 2);
        //           this.meteo.weather1 = res.daily[0].weather[0].main
        //           this.meteo.weather2 = res.daily[1].weather[0].main
        //           this.meteo.weather3 = res.daily[2].weather[0].main
        //           LoggingService.log("meteo estratto", LogLevel.debug, this.meteo);
        //         },
        //         (err) => {
        //           LoggingService.log("errore meteo ", LogLevel.debug, err);
        //         },
        //         () => {
        //         }
        //       )
        //   },
        //   (err) => {
        //     LoggingService.log('errore get latitudine e longitudine ', LogLevel.debug, err);
        //   },
        //   () => { },
        // )
        // }
      }
    );

    this.cantieriserv.getNoteDiCantiere(this.idCantiere).subscribe(
      (res) => {
        LoggingService.log("note per questo cantiere", LogLevel.debug, res);
        this.relatedNotes = res;
        for (const n of this.relatedNotes) {
          n.nota.creationDate = new Date(
            Date.parse(n.nota.creationDate.toString())
          );
        }
        if (this.relatedNotes.length > 5) {
          for (let i = 0, v = this.relatedNotes.length - 1; i < 5; i++, v--) {
            LoggingService.log("v è", LogLevel.debug, v);
            this.lastFiveNotes[i] = this.relatedNotes[v];
          }
        } else {
          this.lastFiveNotes = this.relatedNotes;
          // inverto l'array in modo da avere le note piu recenti come primi elementi
          this.lastFiveNotes.reverse();
        }
      },
      (err) => {
        LoggingService.log(
          "errore nella get delle note per questo cantiere",
          LogLevel.debug,
          err
        );
      }
    );

    this.contrattoservice.getAllContratti().subscribe(
      (res) => {
        this.contrattiget = res;
      },
      (err) => {
        LoggingService.log(
          "errore nel recupero dei contratti",
          LogLevel.error,
          err
        );
      },
      () => {
        LoggingService.log(
          "array contratti estratto",
          LogLevel.debug,
          this.contrattiget
        );
      }
    );
    // popolo l'array personale_get in modo da poter usare il personale nel form del crea cantiere
    this._servicepersonale.getAllPersonale().subscribe(
      (res) => {
        this.personale_get = res;
      },
      (err) => {
        LoggingService.log(
          "errore nel recupero del personale",
          LogLevel.warn,
          err
        );
      },
      () => {
        LoggingService.log(
          "array personale estratto",
          LogLevel.debug,
          this.personale_get
        );
        // popolo il campo fullname con una semplice concatenazione di due stringhe
        this.personale_get.forEach((i) => {
          i.fullName = i.name + " " + i.surname;
        });
      }
    );

    // this.cantieriserv.getImmaginiCantiere(this.idCantiere)
    //   .subscribe(
    //     (res) => {
    //       this.relatedImages = [...res];
    //     },
    //     (err) => {
    //       LoggingService.log('errore nel recupero delle immagini', LogLevel.warn, err)
    //     },
    //     () => { LoggingService.log('immagini estratte', LogLevel.debug, this.relatedImages) }
    //   );

    // scarico l'avanzamento temporale in modo da inserirlo nella card dei dati finanziari
    // this.cantieriserv.getAvanzamentoTemporale(this.idCantiere).subscribe(
    //   (res) => {
    //     LoggingService.log('avanzamento temporale ottenuto', LogLevel.debug, res);
    //     this.avanzamentoTemporale = res;
    //   },
    //   (err) => {

    //     LoggingService.log('ERRORE avanzamento temporale ', LogLevel.error, err);
    //   },
    //   () => { },
    // )

    // // scarico l'avanzamento produzione
    // this.cantieriserv.getAvanzamentoProduzione(this.idCantiere).subscribe(
    //   (res) => {
    //     console.log('avanzamento produzione ottenuto', res);
    //     this.avanzamentoProduzione = res;
    //     if (this.model.finalAmount) {
    //       this.avanzamentoProduzionePerc = Number.parseFloat(((this.avanzamentoProduzione / this.model.finalAmount) * 100).toFixed(2));
    //     }

    //   },
    //   (err) => {
    //     console.error('ERRORE get avanzamento produzione', err);
    //   },
    // )
    // // scarico il VALORE DELLA PRODUZIONE
    // this.cantieriserv.getAvanzamentoProduzione(this.idCantiere, true).subscribe(
    //   (res) => {
    //     console.log('valore della produzione ottenuto', res);
    //     this.valoreDellaProduzione = res;
    //     if (this.datiFinanziariCantiere.proxSal) {
    //       this.mancanti = Number.parseFloat(this.datiFinanziariCantiere.proxSal) - Number.parseFloat(this.valoreDellaProduzione.toString());
    //     }
    //   },
    //   (err) => {
    //     console.error('ERRORE get valore della produzione', err);
    //   },
    // )
  }

  // raccoglie l'evento di caricamento di un file e serve per aggiornare la galleria delle immagini
  onFileSelected(event: _File) {
    LoggingService.log(
      "File recuperato dal componente di upload:",
      LogLevel.debug,
      event
    );
    if (event.type.includes("image")) {
      this.cantieriserv
        .getSingleImmagineCantiere(this.idCantiere, event.id)
        .subscribe(
          (res) => {
            this.relatedImages.unshift(res);
          },
          (err) => {
            LoggingService.log(
              "errore nel recupero delle immagini",
              LogLevel.warn,
              err
            );
          },
          () => {
            LoggingService.log(
              "immagini estratte",
              LogLevel.debug,
              this.relatedImages
            );
          }
        );

      this.relatedImages = [...this.relatedImages];
    }
  }

  // chiamato una volta chiuso il popup di modifica
  initialize() {
    this.nuovocant = new Cantiere();
    this.pm_selezionati = [];
    this.capocantieri_selezionati = [];
    this.soa = [];
    this.soaInModify = [];
    this.riempiSoaCantiere();
    LoggingService.log("nuovocantiere inizializzato", LogLevel.debug);
  }

  // chiamata nell'onInit per scaricare le info sul meteo
  async scaricameteo(cap: number) {
    try {
      const x = await this.cantieriserv.getLatLongMeteo(cap).toPromise();

      console.log("CAP OK", x);
      if (x) {
        const y = await this.cantieriserv.getmeteo(x.lat, x.lon).toPromise();

        console.log("Meteo OK", y);

        (this.meteo.today as unknown as Number) = Math.round(
          (y.daily[0].temp.min + y.daily[0].temp.max) / 2
        );
        (this.meteo.tomorrow as unknown as Number) = Math.round(
          (y.daily[1].temp.min + y.daily[1].temp.max) / 2
        );
        (this.meteo.dayaftertomor as unknown as Number) = Math.round(
          (y.daily[2].temp.min + y.daily[2].temp.max) / 2
        );
        this.meteo.weather1 = y.daily[0].weather[0].main;
        this.meteo.weather2 = y.daily[1].weather[0].main;
        this.meteo.weather3 = y.daily[2].weather[0].main;
        document.getElementById("cardPrincipale").click();
        LoggingService.log("meteo estratto", LogLevel.debug, this.meteo);
      } else {
        console.error("Previsioni no perchè la risposta era vuota");
      }
    } catch (error) {
      console.error(error);
    }
  }

  // chiamata quando nel crea cantiere viene selezionato un contratto
  riempiSoa(event: Contratto) {
    console.log("contratto selezionato", event);
    this.soa = [];
    this.soaInModify = [];
    if (event != undefined && event.soa && event.soa.length > 0) {
      console.log("SOAAA", event.soa);

      let index = 0;
      for (let i = 0; i < event.soa.length; i++) {
        const char = event.soa.charAt(i);
        if (char == "$" && event.soa.charAt(i + 1) == "%") {
          this.soa.push({ name: event.soa.substring(index, i) });

          index = i + 2;
        }
      }
      console.log("SOAAA", this.soa);
      this.soa = [...this.soa];
      return;
    } else {
      this.soa = [];
    }
  }

  // chiamata quando si modifica il proxSal
  updateProxSal() {
    console.log("Update prox sal", this.nuoviDatiFinanziariCantiere.proxSal);

    if (this.nuoviDatiFinanziariCantiere.proxSal.toString().includes(",")) {
      this.nuoviDatiFinanziariCantiere.proxSal =
        this.nuoviDatiFinanziariCantiere.proxSal.toString().replace(",", ".");
    }

    let proxSal = this.nuoviDatiFinanziariCantiere.proxSal.toString();
    proxSal = Number.parseFloat(proxSal).toFixed(2);

    this.nuoviDatiFinanziariCantiere = JSON.parse(
      JSON.stringify(this.datiFinanziariCantiere)
    );
    this.nuoviDatiFinanziariCantiere.proxSal = proxSal;

    this._datiFinanziariService
      .postFinancialCard(this.nuoviDatiFinanziariCantiere)
      .subscribe(
        (res) => {
          console.log("aggiornato proxSal", res);
          this.datiFinanziariCantiere = JSON.parse(
            JSON.stringify(this.nuoviDatiFinanziariCantiere)
          );
          this.datiFinanziariCantiere = { ...this.datiFinanziariCantiere };

          if (this.valoreDellaProduzione.toString().includes(",")) {
            (this.valoreDellaProduzione as unknown as string) =
              this.valoreDellaProduzione.toString().replace(",", ".");
          }
          this.mancanti =
            Number.parseFloat(this.datiFinanziariCantiere.proxSal) -
            Number.parseFloat(this.valoreDellaProduzione.toString());

          swal.fire({
            icon: "success",
            title: "Fatto!",
            text: "ProxSal aggiornato correttamente.",
            customClass: {
              confirmButton: "btn btn-success",
            },
          });
        },
        (err) => {
          console.error("Errore update proxSal", err);
          swal.fire({
            icon: "error",
            title: "C'è stato un problema!",
            text: "Il ProxSal NON è stato aggiornato.",
            customClass: {
              confirmButton: "btn btn-danger",
            },
          });
        },
        () => {
          this.clearNuoviDatiFinanziari();
        }
      );
  }

  // usata per fare il binding nella tendina
  riempiSoaCantiere() {
    console.log("contratto selezionato soa", this.model.soa);
    if (this.model.soa && this.model.soa.length > 0) {
      let index = 0;
      for (let i = 0; i < this.model.soa.length; i++) {
        const char = this.model.soa.charAt(i);
        if (char == "$" && this.model.soa.charAt(i + 1) == "%") {
          this.soaInModify.push(this.model.soa.substring(index, i));
          index = i + 2;
        }
      }
      console.log("SOAAA in modify", this.soaInModify);
      this.soaInModify = [...this.soaInModify];
      return;
    } else {
      this.soaInModify = [];
    }
  }

  // chiamata ogni volta che viene cambiata la categoria SOA
  categoriaSOA(event) {
    console.log(event);
    this.SOA = "";

    event.forEach((element) => {
      this.SOA = this.SOA.concat(element.name + "$%");
    });
  }

  // metodo utilizzato dal tasto "crea cantiere" per aprire un popup
  openLg(modify) {
    // per forza così per evitare la copia del riferimento. In questo modo clono l'oggetto
    this.nuovocant = JSON.parse(JSON.stringify(this.model));

    this.pm_selezionati = this.pmsCantiere.map((x) => x.id);

    this.capocantieri_selezionati = this.capoCantieri.map((x) => x.id);
    this._modalService.open(modify, { size: "xl", scrollable: true });

    // riempio la tendina delle categorie soa
    this.riempiSoa(this.contrattoCantiere);
    this.riempiSoaCantiere();
    this.validationModifyForm(null); //questo fixa che Importo Lavori Totale Lordo e Importo Oneri Totale potrebbero non esser settati visto che sono stati aggiunti dopo
  }

  // chiamata quando si modifica il cantiere e lo si salva come bozza
  updateCantiereBozza() {
    this.nuovocant.state = "Bozza";
    this.updateCantiere();
  }

  // funzione chiamata quando si conferma la modifica del cantiere nel popup di modifica
  updateCantiere() {
    this.nuovocant.cap = Number.parseInt(this.nuovocant.cap.toString());
    this.nuovocant.soa = this.SOA;
    console.log(this.nuovocant);

    LoggingService.log(
      "Sto per fare l'update del cantiere inserendo questi dati ",
      LogLevel.debug,
      this.nuovocant
    );
    this.cantieriserv.updateCantiere(this.nuovocant).subscribe(
      (res) => {
        LoggingService.log("update cantiere andato", LogLevel.debug, res);
        swal
          .fire({
            icon: "success",
            title: "Fatto!",
            text: "Il cantiere selezionato è stato aggiornato. La pagina verrà ricaricata",
            customClass: {
              confirmButton: "btn btn-success",
            },
          })
          .then(() => {
            location.reload();
          });
        this.model = { ...this.nuovocant };
      },
      (err) => {
        LoggingService.log("Erorre update ", LogLevel.error, err);
        swal.fire({
          icon: "error",
          title: "C'è stato un problema!",
          text: "Il cantiere selezionato NON è stato aggiornato con le nuove modifiche",
          customClass: {
            confirmButton: "btn btn-danger",
          },
        });
      },
      () => {
        this.cantieriserv
          .updateForemenCantiere(
            this.nuovocant.id,
            this.capocantieri_selezionati
          )
          .subscribe(
            (res) => {
              LoggingService.log(
                "update capocantiere andato",
                LogLevel.debug,
                res
              );
              this.capoCantieri = this.personale_get.filter((x) =>
                this.capocantieri_selezionati.includes(x.id)
              );
            },
            (err) => {
              LoggingService.log(
                "errore update capocantiere ",
                LogLevel.error,
                err
              );
            },
            () => {
              this.capocantieri_selezionati = null;
            }
          );
        this.cantieriserv
          .updatePMCantiere(this.nuovocant.id, this.pm_selezionati)
          .subscribe(
            (res) => {
              LoggingService.log(
                "update PM cantiere andato",
                LogLevel.debug,
                res
              );
              this.pmsCantiere = this.personale_get.filter((x) =>
                this.pm_selezionati.includes(x.id)
              );
            },
            (err) => {
              LoggingService.log(
                "errore update PM cantiere ",
                LogLevel.error,
                err
              );
            },
            () => {
              this.pm_selezionati = [];
            }
          );
      }
    );
  }

  // funzione utilizzata dai datepicker
  cambia(event, binding: string, otherData: any = null) {
    LoggingService.log("cambia è", LogLevel.debug, event);
    const millisec = Date.now();
    const date = new Date(millisec);
    const ore = Number.parseInt(date.toTimeString().substring(0, 2));
    const minuti = Number.parseInt(date.toTimeString().substring(3, 5));
    const secondi = Number.parseInt(date.toTimeString().substring(6, 8));
    switch (binding) {
      case "datainizio": {
        this.nuovocant.start = new Date(
          event.year,
          event.month,
          event.day,
          ore,
          minuti,
          secondi
        );
        LoggingService.log(
          "la data di inizio del nuovo cantiere è",
          LogLevel.debug,
          this.nuovocant.start
        );
        break;
      }
      case "dataFineStimata": {
        this.nuovocant.estimatedEnding = new Date(
          event.year,
          event.month,
          event.day,
          ore,
          minuti,
          secondi
        );
        LoggingService.log(
          "la data di fine del nuovo cantiere è",
          LogLevel.debug,
          this.nuovocant.estimatedEnding
        );
        break;
      }
      case "budgetdatainizio": {
        LoggingService.log(
          "la data di inizio del nuovo cantiere è",
          LogLevel.debug,
          event
        );
        break;
      }
      case "budgetdatafine": {
        LoggingService.log(
          "la data di fine impostata nel budget è",
          LogLevel.debug,
          event
        );
        break;
      }
      case "produzionemensiledatainizio": {
        LoggingService.log(
          "la data di inizio impostata nel dettaglio produzione mensile è",
          LogLevel.debug,
          event
        );
        break;
      }
      case "produzionemensiledatafine": {
        LoggingService.log(
          "la data di fine impostata nel dettaglio produzione mensile è",
          LogLevel.debug,
          event
        );
        break;
      }
      case "datacantiere": {
        if (event.year == null && event.month == null && event.day == null) {
          otherData.data = null;
          return;
        }
        otherData.data = new Date(
          event.year,
          event.month,
          event.day,
          ore,
          minuti,
          secondi
        );
        break;
      }
      default: {
        // statements;
        break;
      }
    }
  }

  // valida il form di modifica del cantiere
  validationModifyForm(form) {
    // calcolo importo commessa
    if (
      this.nuovocant.workBudget == null &&
      this.nuovocant.chargesBudget == null
    ) {
      this.nuovocant.orderAmount = null;
    }
    this.nuovocant.orderAmount =
      (this.nuovocant.workBudget ?? 0) + (this.nuovocant.chargesBudget ?? 0);

    // 2 cifre decimali
    if (this.nuovocant.orderAmount)
      this.nuovocant.orderAmount = Number.parseFloat(
        this.nuovocant.orderAmount.toFixed(2)
      );

    // calcolo importo finale

    this.nuovocant.totalGrossWorkAmount = this.nuovocant.workBudget ?? 0;
    this.nuovocant.totalChargesAmount = this.nuovocant.chargesBudget ?? 0;

    this.nuovocant.finalAmount =
      this.nuovocant.totalGrossWorkAmount + this.nuovocant.totalChargesAmount;

    for (let valAgg of this.nuovocant.valoriAggiuntivi) {
      valAgg.additionalNetAmount =
        valAgg.additionalChargesAmount + valAgg.additionalGrossWorkAmount;

      this.nuovocant.totalGrossWorkAmount += valAgg.additionalGrossWorkAmount;
      this.nuovocant.finalAmount += valAgg.additionalNetAmount;
      this.nuovocant.totalChargesAmount += valAgg.additionalChargesAmount;
    }

    // 2 cifre decimali
    if (this.nuovocant.finalAmount)
      this.nuovocant.finalAmount = Number.parseFloat(
        this.nuovocant.finalAmount.toFixed(2)
      );

    LoggingService.log("form", LogLevel.debug, form);
    if (form && form.status == "VALID") {
      this.cantiereFormIsValid = true;
      return;
    } else {
      this.cantiereFormIsValid = false;
      return;
    }
  }

  // chiamata quando si clicca il tasto di modifica della card dati finanziari
  nuoviDatiFinanziari() {
    console.log("modifica dati finanziari");
    this.nuoviDatiFinanziariCantiere = JSON.parse(
      JSON.stringify(this.datiFinanziariCantiere)
    );
  }

  // chiamata quando si annulla la modifica dei dati finanziari
  clearNuoviDatiFinanziari() {
    this.nuoviDatiFinanziariCantiere = new DatiFinanziari();
    console.log("nuovi dati finanziari annullati ");
  }

  //chiamata quando si modifica il campo cashflow
  onModifyCashFlow() {
    this.nuoviDatiFinanziari();
    this.editCashFlow = !this.editCashFlow;
  }

  // chiamata quando si decide di confermare i dati finanziari
  confermaDatiFinanziari() {
    console.log("dati finanziari confermati");

    (this.nuoviDatiFinanziariCantiere.creditiVsClienti as unknown as string) =
      this.nuoviDatiFinanziariCantiere?.creditiVsClienti?.toString() ??
      this.datiFinanziariCantiere?.creditiVsClienti.toString();
    (this.nuoviDatiFinanziariCantiere.debitiVsFornitori as unknown as string) =
      this.nuoviDatiFinanziariCantiere?.debitiVsFornitori?.toString() ??
      this.datiFinanziariCantiere?.debitiVsFornitori.toString();
    (this.nuoviDatiFinanziariCantiere.saldo as unknown as string) =
      this.nuoviDatiFinanziariCantiere?.saldo?.toString() ??
      this.datiFinanziariCantiere?.saldo.toString();
    if (this.nuoviDatiFinanziariCantiere.cashflow)
      this.nuoviDatiFinanziariCantiere.cashflow =
        Math.round(this.nuoviDatiFinanziariCantiere.cashflow * 100) / 100; //arrotondo a due cifre decimali
    this._datiFinanziariService
      .postFinancialCard(this.nuoviDatiFinanziariCantiere)
      .subscribe(
        (res) => {
          console.log("aggiornati dati finanziari", res);
          this.datiFinanziariCantiere = JSON.parse(
            JSON.stringify(this.nuoviDatiFinanziariCantiere)
          );
          this.datiFinanziariCantiere = { ...this.datiFinanziariCantiere };
          swal.fire({
            icon: "success",
            title: "Fatto!",
            text: "Dati Finanziari aggiornati correttamente.",
            customClass: {
              confirmButton: "btn btn-success",
            },
          });
        },
        (err) => {
          console.error("Errore update dati finanziari", err);
          swal.fire({
            icon: "error",
            title: "C'è stato un problema!",
            text: "I Dati Finanziari NON sono stati aggiornati.",
            customClass: {
              confirmButton: "btn btn-danger",
            },
          });
        },
        () => {
          if (this.editCashFlow) this.editCashFlow = !this.editCashFlow;
          // this.clearNuoviDatiFinanziari();
        }
      );
    // faccio l'update dei dati
  }

  // valida il form dei dati finanziari
  validationForm(form) {
    this.nuoviDatiFinanziariCantiere.saldo = 0;
    this.nuoviDatiFinanziariCantiere.creditiVsClienti = 0;
    this.nuoviDatiFinanziariCantiere.debitiVsFornitori = 0;
    console.warn(this.nuoviDatiFinanziariCantiere);

    // calcolo dei crediti vs cliente
    for (const [key, value] of Object.entries(
      this.nuoviDatiFinanziariCantiere
    )) {
      console.log(key, value);
      if (
        (key == "daContabilizzare" ||
          key == "daFatturare" ||
          key == "daIncassare") &&
        parseFloat(value)
      ) {
        this.nuoviDatiFinanziariCantiere.creditiVsClienti += parseFloat(value);
        this.nuoviDatiFinanziariCantiere.creditiVsClienti = parseFloat(
          this.nuoviDatiFinanziariCantiere.creditiVsClienti.toFixed(3)
        ); // 3 cifre decimali
        console.log(this.nuoviDatiFinanziariCantiere.creditiVsClienti);
      }
    }
    // calcolo dei debiti vs fornitori
    for (const [key, value] of Object.entries(
      this.nuoviDatiFinanziariCantiere
    )) {
      console.log(key, value);
      if (
        (key == "paghe" ||
          key == "fattureRicevute" ||
          key == "fattureDaRicevere") &&
        parseFloat(value)
      ) {
        this.nuoviDatiFinanziariCantiere.debitiVsFornitori += parseFloat(value);
        this.nuoviDatiFinanziariCantiere.debitiVsFornitori = parseFloat(
          this.nuoviDatiFinanziariCantiere.debitiVsFornitori.toFixed(3)
        ); // 3 cifre decimali
        console.log(this.nuoviDatiFinanziariCantiere.debitiVsFornitori);
      }
    }

    // calcolo del saldo
    for (const [key, value] of Object.entries(
      this.nuoviDatiFinanziariCantiere
    )) {
      console.log(key, value);
      if (
        (key == "debitiABreve" || key == "anticipazioniDaRestituire") &&
        parseFloat(value)
      ) {
        this.nuoviDatiFinanziariCantiere.saldo -= parseFloat(value);
        console.log(this.nuoviDatiFinanziariCantiere.saldo);
      }
    }
    this.nuoviDatiFinanziariCantiere.saldo +=
      this.nuoviDatiFinanziariCantiere.creditiVsClienti;
    this.nuoviDatiFinanziariCantiere.saldo -=
      this.nuoviDatiFinanziariCantiere.debitiVsFornitori;
    this.nuoviDatiFinanziariCantiere.saldo = parseFloat(
      this.nuoviDatiFinanziariCantiere.saldo.toFixed(3)
    ); // 3 cifre decimali

    // this.datiFinanziariCantiere.creditiVsClienti = (parseFloat(this.datiFinanziariCantiere.daContabilizzare) + parseFloat(this.datiFinanziariCantiere.daFatturare) + parseFloat(this.datiFinanziariCantiere.daIncassare));
    // this.datiFinanziariCantiere.debitiVsFornitori = (parseFloat(this.datiFinanziariCantiere.paghe) + parseFloat(this.datiFinanziariCantiere.fattureRicevute) + parseFloat(this.datiFinanziariCantiere.fattureDaRicevere));

    LoggingService.log("form", LogLevel.debug, form);
    if (form.status == "VALID") {
      this.fff = true;
      return;
    } else {
      this.fff = false;
      return;
    }
  }

  onValueChange(event: any) {
    LoggingService.log("onValueChange", LogLevel.debug, event);
  }

  onResized(event: any) {
    setTimeout(() => {
      this.fireRefreshEventOnWindow();
    }, 300);
  }

  fireRefreshEventOnWindow = function () {
    const evt = document.createEvent("HTMLEvents");
    evt.initEvent("resize", true, false);
    window.dispatchEvent(evt);
  };

  scaricaImmagini() {
    this.cantieriserv.getImmaginiCantiere(this.idCantiere).subscribe(
      (res) => {
        this.relatedImages = [...res];
      },
      (err) => {
        LoggingService.log(
          "errore nel recupero delle immagini",
          LogLevel.warn,
          err
        );
      },
      () => {
        LoggingService.log(
          "immagini estratte",
          LogLevel.debug,
          this.relatedImages
        );
      }
    );
  }

  protected readonly removeValoriAggiuntivi = removeValoriAggiuntivi;
  protected readonly addValoriAggiuntivi = addValoriAggiuntivi;
  protected readonly dataToStringValue = dataToStringValue;

  isLastIndex(i: number): boolean {
    return (
      this.nuovocant.valoriAggiuntivi.length === 0 ||
      i === this.nuovocant.valoriAggiuntivi.length - 1
    );
  }
}
