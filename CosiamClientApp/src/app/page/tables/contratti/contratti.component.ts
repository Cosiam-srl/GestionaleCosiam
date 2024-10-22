import {registerLocaleData} from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {NgbDate, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ColumnMode, SelectionType} from '@swimlane/ngx-datatable';
import {PrezziarioGenerale} from 'app/models/benieservizi.model';
import {Cliente} from 'app/models/cliente.model';
import {Contratto} from 'app/models/contratto.model';
import {Personale} from 'app/models/personale.model';
import {ClientiService} from 'app/shared/services/data/clienti.service';
import {ContrattoService} from 'app/shared/services/data/contratti.service';
import {PersonaleService} from 'app/shared/services/data/personale.service';
import {PrezziarioGeneraleService} from 'app/shared/services/data/prezziariogenerale.service';
import {LoggingService, LogLevel} from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';
import {addValoriAggiuntivi, dataToStringValue, removeValoriAggiuntivi} from '../../../models/valoriaggiuntivi.model';
import {PdfService} from '../../../shared/services/pdf.service';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-contratti',
  templateUrl: './contratti.component.html',
  styleUrls: ['./contratti.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContrattiComponent implements OnInit {
  // variabile che contiene il numero di cantiere
  // @Input() targetCantiereId: number;
  // variabile necessaria per l'ngx-datatable
  columnMode = ColumnMode;
  // array per il filtro di ricerca
  private tempData = [];
  // altra variabile per le checkbox
  public SelectionType = SelectionType;

  // array che contiene tutti i contratti
  contratti: Contratto[];
  // elenco clienti
  clientiget: Cliente[] = []
  // contiene la lista di tutto il personale
  personale_get: Personale[] = [];
  // contiene la lista dei prezziari
  prezziariget: PrezziarioGenerale[] = [];
  // array che contiene gli id dei servizi selezionati usando le checkbox
  checked: number[] = [];
  // variabile che contiene un'attrezzatura da aggiungere
  nuovocontratto = new Contratto();
  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];
  // variabile utilizzata per la validazione del form
  fff = false;
  // variabile utilizzata per creare una stringa di categorie SOA
  SOA = '';
  // variabile usata per l'elenco delle categorie SOA nel modifica contratto
  soa: string[] = [];

  limit: number = 25;

  regioni = [
    {name: 'Abruzzo'},
    {name: 'Basilicata'},
    {name: 'Calabria'},
    {name: 'Campania'},
    {name: 'Emilia-Romagna'},
    {name: 'Friuli Venezia Giulia'},
    {name: 'Lazio'},
    {name: 'Liguria'},
    {name: 'Lombardia'},
    {name: 'Marche'},
    {name: 'Molise'},
    {name: 'Piemonte'},
    {name: 'Puglia'},
    {name: 'Sardegna'},
    {name: 'Sicilia'},
    {name: 'Toscana'},
    {name: 'Trentino-Alto Adige'},
    {name: 'Umbria'},
    {name: 'Valle d\'Aosta'},
    {name: 'Veneto'}
  ];

  soatypes = [
    {name: 'OG 1 I Edifici civili e industriali'},
    {name: 'OG 1 II Edifici civili e industriali'},
    {name: 'OG 1 III Edifici civili e industriali'},
    {name: 'OG 1 III-bis Edifici civili e industriali'},
    {name: 'OG 1 IV Edifici civili e industriali'},
    {name: 'OG 1 IV-bis Edifici civili e industriali'},
    {name: 'OG 1 V Edifici civili e industriali'},
    {name: 'OG 1 VI Edifici civili e industriali'},
    {name: 'OG 1 VII Edifici civili e industriali'},
    {name: 'OG 1 VIII Edifici civili e industriali'},
    {name: 'OG 2 I Restauro e manutenzione dei beni immobili sottoposti a tutela'},
    {name: 'OG 2 II Restauro e manutenzione dei beni immobili sottoposti a tutela'},
    {name: 'OG 2 III Restauro e manutenzione dei beni immobili sottoposti a tutela'},
    {name: 'OG 2 III-bis Restauro e manutenzione dei beni immobili sottoposti a tutela'},
    {name: 'OG 2 IV Restauro e manutenzione dei beni immobili sottoposti a tutela'},
    {name: 'OG 2 IV-bis Restauro e manutenzione dei beni immobili sottoposti a tutela'},
    {name: 'OG 2 V Restauro e manutenzione dei beni immobili sottoposti a tutela'},
    {name: 'OG 2 VI Restauro e manutenzione dei beni immobili sottoposti a tutela'},
    {name: 'OG 2 VII Restauro e manutenzione dei beni immobili sottoposti a tutela'},
    {name: 'OG 3 VIII Restauro e manutenzione dei beni immobili sottoposti a tutela'},
    {name: 'OG 3 I Strade, autostrade, ponti, viadotti, ferrovie, metropolitane'},
    {name: 'OG 3 II Strade, autostrade, ponti, viadotti, ferrovie, metropolitane'},
    {name: 'OG 3 III Strade, autostrade, ponti, viadotti, ferrovie, metropolitane'},
    {name: 'OG 3 III-bis Strade, autostrade, ponti, viadotti, ferrovie, metropolitane'},
    {name: 'OG 3 IV Strade, autostrade, ponti, viadotti, ferrovie, metropolitane'},
    {name: 'OG 3 IV-bis Strade, autostrade, ponti, viadotti, ferrovie, metropolitane'},
    {name: 'OG 3 V Strade, autostrade, ponti, viadotti, ferrovie, metropolitane'},
    {name: 'OG 3 VI Strade, autostrade, ponti, viadotti, ferrovie, metropolitane'},
    {name: 'OG 3 VII Strade, autostrade, ponti, viadotti, ferrovie, metropolitane'},
    {name: 'OG 3 VIII Strade, autostrade, ponti, viadotti, ferrovie, metropolitane'},
    {name: 'OG 4 I Opere d\'arte nel sottosuolo'},
    {name: 'OG 4 II Opere d\'arte nel sottosuolo'},
    {name: 'OG 4 III Opere d\'arte nel sottosuolo'},
    {name: 'OG 4 III-bis Opere d\'arte nel sottosuolo'},
    {name: 'OG 4 IV Opere d\'arte nel sottosuolo'},
    {name: 'OG 4 IV-bis Opere d\'arte nel sottosuolo'},
    {name: 'OG 4 V Opere d\'arte nel sottosuolo'},
    {name: 'OG 4 VI Opere d\'arte nel sottosuolo'},
    {name: 'OG 4 VII Opere d\'arte nel sottosuolo'},
    {name: 'OG 4 VIII Opere d\'arte nel sottosuolo'},
    {name: 'OG 5 I Dighe'},
    {name: 'OG 5 II Dighe'},
    {name: 'OG 5 III Dighe'},
    {name: 'OG 5 III-bis Dighe'},
    {name: 'OG 5 IV Dighe'},
    {name: 'OG 5 IV-bis Dighe'},
    {name: 'OG 5 V Dighe'},
    {name: 'OG 5 VI Dighe'},
    {name: 'OG 5 VII Dighe'},
    {name: 'OG 5 VIII Dighe'},
    {name: 'OG 6 I Acquedotti, gasdotti, oleodotti, opere di irrigazione e di evacuazione'},
    {name: 'OG 6 II Acquedotti, gasdotti, oleodotti, opere di irrigazione e di evacuazione'},
    {name: 'OG 6 III Acquedotti, gasdotti, oleodotti, opere di irrigazione e di evacuazione'},
    {name: 'OG 6 III-bis Acquedotti, gasdotti, oleodotti, opere di irrigazione e di evacuazione'},
    {name: 'OG 6 IV Acquedotti, gasdotti, oleodotti, opere di irrigazione e di evacuazione'},
    {name: 'OG 6 IV-bis Acquedotti, gasdotti, oleodotti, opere di irrigazione e di evacuazione'},
    {name: 'OG 6 V Acquedotti, gasdotti, oleodotti, opere di irrigazione e di evacuazione'},
    {name: 'OG 6 VI Acquedotti, gasdotti, oleodotti, opere di irrigazione e di evacuazione'},
    {name: 'OG 6 VII Acquedotti, gasdotti, oleodotti, opere di irrigazione e di evacuazione'},
    {name: 'OG 6 VIII Acquedotti, gasdotti, oleodotti, opere di irrigazione e di evacuazione'},
    {name: 'OG 7 I Opere marittime e lavori di dragaggio'},
    {name: 'OG 7 II Opere marittime e lavori di dragaggio'},
    {name: 'OG 7 III Opere marittime e lavori di dragaggio'},
    {name: 'OG 7 III-bis Opere marittime e lavori di dragaggio'},
    {name: 'OG 7 IV Opere marittime e lavori di dragaggio'},
    {name: 'OG 7 IV-bis Opere marittime e lavori di dragaggio'},
    {name: 'OG 7 V Opere marittime e lavori di dragaggio'},
    {name: 'OG 7 VI Opere marittime e lavori di dragaggio'},
    {name: 'OG 7 VII Opere marittime e lavori di dragaggio'},
    {name: 'OG 7 VIII Opere marittime e lavori di dragaggio'},
    {name: 'OG 8 I Opere fluviali, di difesa, di sistemazione idraulica e di bonifica'},
    {name: 'OG 8 II Opere fluviali, di difesa, di sistemazione idraulica e di bonifica'},
    {name: 'OG 8 III Opere fluviali, di difesa, di sistemazione idraulica e di bonifica'},
    {name: 'OG 8 III-bis Opere fluviali, di difesa, di sistemazione idraulica e di bonifica'},
    {name: 'OG 8 IV Opere fluviali, di difesa, di sistemazione idraulica e di bonifica'},
    {name: 'OG 8 IV-bis Opere fluviali, di difesa, di sistemazione idraulica e di bonifica'},
    {name: 'OG 8 V Opere fluviali, di difesa, di sistemazione idraulica e di bonifica'},
    {name: 'OG 8 VI Opere fluviali, di difesa, di sistemazione idraulica e di bonifica'},
    {name: 'OG 8 VII Opere fluviali, di difesa, di sistemazione idraulica e di bonifica'},
    {name: 'OG 8 VIII Opere fluviali, di difesa, di sistemazione idraulica e di bonifica'},
    {name: 'OG 9 I Impianti per la produzione di energia elettrica'},
    {name: 'OG 9 II Impianti per la produzione di energia elettrica'},
    {name: 'OG 9 III Impianti per la produzione di energia elettrica'},
    {name: 'OG 9 III-bis Impianti per la produzione di energia elettrica'},
    {name: 'OG 9 IV Impianti per la produzione di energia elettrica'},
    {name: 'OG 9 IV-bis Impianti per la produzione di energia elettrica'},
    {name: 'OG 9 V Impianti per la produzione di energia elettrica'},
    {name: 'OG 9 VI Impianti per la produzione di energia elettrica'},
    {name: 'OG 9 VII Impianti per la produzione di energia elettrica'},
    {name: 'OG 9 VIII Impianti per la produzione di energia elettrica'},
    {name: 'OG 10 I Impianti per la trasformazione alta/media tensione e per la distribuzione di energia elettrica in corrente alternata e continua ed impianti di pubblica illuminazione'},
    {name: 'OG 10 II Impianti per la trasformazione alta/media tensione e per la distribuzione di energia elettrica in corrente alternata e continua ed impianti di pubblica illuminazione'},
    {name: 'OG 10 III Impianti per la trasformazione alta/media tensione e per la distribuzione di energia elettrica in corrente alternata e continua ed impianti di pubblica illuminazione'},
    {name: 'OG 10 III-bis Impianti per la trasformazione alta/media tensione e per la distribuzione di energia elettrica in corrente alternata e continua ed impianti di pubblica illuminazione'},
    {name: 'OG 10 IV Impianti per la trasformazione alta/media tensione e per la distribuzione di energia elettrica in corrente alternata e continua ed impianti di pubblica illuminazione'},
    {name: 'OG 10 IV-bis Impianti per la trasformazione alta/media tensione e per la distribuzione di energia elettrica in corrente alternata e continua ed impianti di pubblica illuminazione'},
    {name: 'OG 10 V Impianti per la trasformazione alta/media tensione e per la distribuzione di energia elettrica in corrente alternata e continua ed impianti di pubblica illuminazione'},
    {name: 'OG 10 VI Impianti per la trasformazione alta/media tensione e per la distribuzione di energia elettrica in corrente alternata e continua ed impianti di pubblica illuminazione'},
    {name: 'OG 10 VII Impianti per la trasformazione alta/media tensione e per la distribuzione di energia elettrica in corrente alternata e continua ed impianti di pubblica illuminazione'},
    {name: 'OG 10 VIII Impianti per la trasformazione alta/media tensione e per la distribuzione di energia elettrica in corrente alternata e continua ed impianti di pubblica illuminazione'},
    {name: 'OG 11  I Impianti tecnologici'},
    {name: 'OG 11  II Impianti tecnologici'},
    {name: 'OG 11 III Impianti tecnologici'},
    {name: 'OG 11 III-bis Impianti tecnologici'},
    {name: 'OG 11 IV Impianti tecnologici'},
    {name: 'OG 11 IV-bis Impianti tecnologici'},
    {name: 'OG 11 V Impianti tecnologici'},
    {name: 'OG 11 VI Impianti tecnologici'},
    {name: 'OG 11 VII Impianti tecnologici'},
    {name: 'OG 11 VIII Impianti tecnologici'},
    {name: 'OG 12 I Opere ed impianti di bonifica e protezione ambientale'},
    {name: 'OG 12 II Opere ed impianti di bonifica e protezione ambientale'},
    {name: 'OG 12 III Opere ed impianti di bonifica e protezione ambientale'},
    {name: 'OG 12 III-bis Opere ed impianti di bonifica e protezione ambientale'},
    {name: 'OG 12 IV Opere ed impianti di bonifica e protezione ambientale'},
    {name: 'OG 12 IV-bis Opere ed impianti di bonifica e protezione ambientale'},
    {name: 'OG 12 V Opere ed impianti di bonifica e protezione ambientale'},
    {name: 'OG 12 VI Opere ed impianti di bonifica e protezione ambientale'},
    {name: 'OG 12 VII Opere ed impianti di bonifica e protezione ambientale'},
    {name: 'OG 12 VIII Opere ed impianti di bonifica e protezione ambientale'},
    {name: 'OG 13 I Opere di ingegneria naturalistica'},
    {name: 'OG 13 II Opere di ingegneria naturalistica'},
    {name: 'OG 13 III Opere di ingegneria naturalistica'},
    {name: 'OG 13 III-bis Opere di ingegneria naturalistica'},
    {name: 'OG 13 IV Opere di ingegneria naturalistica'},
    {name: 'OG 13 IV-bis Opere di ingegneria naturalistica'},
    {name: 'OG 13 V Opere di ingegneria naturalistica'},
    {name: 'OG 13 VI Opere di ingegneria naturalistica'},
    {name: 'OG 13 VII Opere di ingegneria naturalistica'},
    {name: 'OG 13 VIII Opere di ingegneria naturalistica'},
    {name: 'OS 1 I Lavori in terra'},
    {name: 'OS 1 II Lavori in terra'},
    {name: 'OS 1 III Lavori in terra'},
    {name: 'OS 1 III-bis Lavori in terra'},
    {name: 'OS 1 IV Lavori in terra'},
    {name: 'OS 1 IV-bis Lavori in terra'},
    {name: 'OS 1 V Lavori in terra'},
    {name: 'OS 1 VI Lavori in terra'},
    {name: 'OS 1 VII Lavori in terra'},
    {name: 'OS 1 VIII Lavori in terra'},
    {name: 'OS 2-A I Superfici decorate di beni immobili del patrimonio culturale e beni culturali mobili di interesse storico, artistico, archeologico ed etnoantropologico'},
    {name: 'OS 2-A II Superfici decorate di beni immobili del patrimonio culturale e beni culturali mobili di interesse storico, artistico, archeologico ed etnoantropologico'},
    {name: 'OS 2-A III Superfici decorate di beni immobili del patrimonio culturale e beni culturali mobili di interesse storico, artistico, archeologico ed etnoantropologico'},
    {name: 'OS 2-A III-bis Superfici decorate di beni immobili del patrimonio culturale e beni culturali mobili di interesse storico, artistico, archeologico ed etnoantropologico'},
    {name: 'OS 2-A IV Superfici decorate di beni immobili del patrimonio culturale e beni culturali mobili di interesse storico, artistico, archeologico ed etnoantropologico'},
    {name: 'OS 2-A IV-bis Superfici decorate di beni immobili del patrimonio culturale e beni culturali mobili di interesse storico, artistico, archeologico ed etnoantropologico'},
    {name: 'OS 2-A V Superfici decorate di beni immobili del patrimonio culturale e beni culturali mobili di interesse storico, artistico, archeologico ed etnoantropologico'},
    {name: 'OS 2-A VI Superfici decorate di beni immobili del patrimonio culturale e beni culturali mobili di interesse storico, artistico, archeologico ed etnoantropologico'},
    {name: 'OS 2-A VII Superfici decorate di beni immobili del patrimonio culturale e beni culturali mobili di interesse storico, artistico, archeologico ed etnoantropologico'},
    {name: 'OS 2-A VIII Superfici decorate di beni immobili del patrimonio culturale e beni culturali mobili di interesse storico, artistico, archeologico ed etnoantropologico'},
    {name: 'OS 2-B I Beni culturali mobili di interesse archivistico e librario'},
    {name: 'OS 2-B II Beni culturali mobili di interesse archivistico e librario'},
    {name: 'OS 2-B III Beni culturali mobili di interesse archivistico e librario'},
    {name: 'OS 2-B III-bis Beni culturali mobili di interesse archivistico e librario'},
    {name: 'OS 2-B IV Beni culturali mobili di interesse archivistico e librario'},
    {name: 'OS 2-B IV-bis Beni culturali mobili di interesse archivistico e librario'},
    {name: 'OS 2-B V Beni culturali mobili di interesse archivistico e librario'},
    {name: 'OS 2-B VI Beni culturali mobili di interesse archivistico e librario'},
    {name: 'OS 2-B VII Beni culturali mobili di interesse archivistico e librario'},
    {name: 'OS 2-B VIII Beni culturali mobili di interesse archivistico e librario'},
    {name: 'OS 3 I Impianti idrico-sanitario, cucine, lavanderie'},
    {name: 'OS 3 II Impianti idrico-sanitario, cucine, lavanderie'},
    {name: 'OS 3 III Impianti idrico-sanitario, cucine, lavanderie'},
    {name: 'OS 3 III-bis Impianti idrico-sanitario, cucine, lavanderie'},
    {name: 'OS 3 IV Impianti idrico-sanitario, cucine, lavanderie'},
    {name: 'OS 3 IV-bis Impianti idrico-sanitario, cucine, lavanderie'},
    {name: 'OS 3 V Impianti idrico-sanitario, cucine, lavanderie'},
    {name: 'OS 3 VI Impianti idrico-sanitario, cucine, lavanderie'},
    {name: 'OS 3 VII Impianti idrico-sanitario, cucine, lavanderie'},
    {name: 'OS 3 VIII Impianti idrico-sanitario, cucine, lavanderie'},
    {name: 'OS 4 I Impianti elettromeccanici trasportatori'},
    {name: 'OS 4 II Impianti elettromeccanici trasportatori'},
    {name: 'OS 4 III Impianti elettromeccanici trasportatori'},
    {name: 'OS 4 III-bis Impianti elettromeccanici trasportatori'},
    {name: 'OS 4 IV Impianti elettromeccanici trasportatori'},
    {name: 'OS 4 IV-bis Impianti elettromeccanici trasportatori'},
    {name: 'OS 4 V Impianti elettromeccanici trasportatori'},
    {name: 'OS 4 VI Impianti elettromeccanici trasportatori'},
    {name: 'OS 4 VII Impianti elettromeccanici trasportatori'},
    {name: 'OS 4 VIII Impianti elettromeccanici trasportatori'},
    {name: 'OS 5 I Impianti pneumatici e antintrusione'},
    {name: 'OS 5 II Impianti pneumatici e antintrusione'},
    {name: 'OS 5 III Impianti pneumatici e antintrusione'},
    {name: 'OS 5 III-bis Impianti pneumatici e antintrusione'},
    {name: 'OS 5 IV Impianti pneumatici e antintrusione'},
    {name: 'OS 5 IV-bis Impianti pneumatici e antintrusione'},
    {name: 'OS 5 V Impianti pneumatici e antintrusione'},
    {name: 'OS 5 VI Impianti pneumatici e antintrusione'},
    {name: 'OS 5 VII Impianti pneumatici e antintrusione'},
    {name: 'OS 5 VIII Impianti pneumatici e antintrusione'},
    {name: 'OS 6 I Finiture di opere generali in materiali lignei, plastici, metallici e vetrosi'},
    {name: 'OS 6 II Finiture di opere generali in materiali lignei, plastici, metallici e vetrosi'},
    {name: 'OS 6 III Finiture di opere generali in materiali lignei, plastici, metallici e vetrosi'},
    {name: 'OS 6 III-bis Finiture di opere generali in materiali lignei, plastici, metallici e vetrosi'},
    {name: 'OS 6 IV Finiture di opere generali in materiali lignei, plastici, metallici e vetrosi'},
    {name: 'OS 6 IV-bis Finiture di opere generali in materiali lignei, plastici, metallici e vetrosi'},
    {name: 'OS 6 V Finiture di opere generali in materiali lignei, plastici, metallici e vetrosi'},
    {name: 'OS 6 VI Finiture di opere generali in materiali lignei, plastici, metallici e vetrosi'},
    {name: 'OS 6 VII Finiture di opere generali in materiali lignei, plastici, metallici e vetrosi'},
    {name: 'OS 6 VIII Finiture di opere generali in materiali lignei, plastici, metallici e vetrosi'},
    {name: 'OS 7 I Finiture di opere generali di natura edile e tecnica'},
    {name: 'OS 7 II Finiture di opere generali di natura edile e tecnica'},
    {name: 'OS 7 III Finiture di opere generali di natura edile e tecnica'},
    {name: 'OS 7 III-bis Finiture di opere generali di natura edile e tecnica'},
    {name: 'OS 7 IV Finiture di opere generali di natura edile e tecnica'},
    {name: 'OS 7 IV-bis Finiture di opere generali di natura edile e tecnica'},
    {name: 'OS 7 V Finiture di opere generali di natura edile e tecnica'},
    {name: 'OS 7 VI Finiture di opere generali di natura edile e tecnica'},
    {name: 'OS 7 VII Finiture di opere generali di natura edile e tecnica'},
    {name: 'OS 7 VIII Finiture di opere generali di natura edile e tecnica'},
    {name: 'OS 8 I Opere di impermeabilizzazione'},
    {name: 'OS 8 II Opere di impermeabilizzazione'},
    {name: 'OS 8 III Opere di impermeabilizzazione'},
    {name: 'OS 8 III-bis Opere di impermeabilizzazione'},
    {name: 'OS 8 IV Opere di impermeabilizzazione'},
    {name: 'OS 8 IV-bis Opere di impermeabilizzazione'},
    {name: 'OS 8 V Opere di impermeabilizzazione'},
    {name: 'OS 8 VI Opere di impermeabilizzazione'},
    {name: 'OS 8 VII Opere di impermeabilizzazione'},
    {name: 'OS 8 VIII Opere di impermeabilizzazione'},
    {name: 'OS 9 I Impianti per la segnaletica luminosa e la sicurezza del traffico'},
    {name: 'OS 9 II Impianti per la segnaletica luminosa e la sicurezza del traffico'},
    {name: 'OS 9 III Impianti per la segnaletica luminosa e la sicurezza del traffico'},
    {name: 'OS 9 III-bis Impianti per la segnaletica luminosa e la sicurezza del traffico'},
    {name: 'OS 9 IV Impianti per la segnaletica luminosa e la sicurezza del traffico'},
    {name: 'OS 9 IV-bis Impianti per la segnaletica luminosa e la sicurezza del traffico'},
    {name: 'OS 9 V Impianti per la segnaletica luminosa e la sicurezza del traffico'},
    {name: 'OS 9 VI Impianti per la segnaletica luminosa e la sicurezza del traffico'},
    {name: 'OS 9 VII Impianti per la segnaletica luminosa e la sicurezza del traffico'},
    {name: 'OS 9 VIII Impianti per la segnaletica luminosa e la sicurezza del traffico'},
    {name: 'OS 10 I Segnaletica stradale non luminosa'},
    {name: 'OS 10 II Segnaletica stradale non luminosa'},
    {name: 'OS 10 III Segnaletica stradale non luminosa'},
    {name: 'OS 10 III-bis Segnaletica stradale non luminosa'},
    {name: 'OS 10 IV Segnaletica stradale non luminosa'},
    {name: 'OS 10 IV-bis Segnaletica stradale non luminosa'},
    {name: 'OS 10 V Segnaletica stradale non luminosa'},
    {name: 'OS 10 VI Segnaletica stradale non luminosa'},
    {name: 'OS 10 VII Segnaletica stradale non luminosa'},
    {name: 'OS 10 VIII Segnaletica stradale non luminosa'},
    {name: 'OS 11 I Apparecchiature strutturali speciali'},
    {name: 'OS 11 II Apparecchiature strutturali speciali'},
    {name: 'OS 11 III Apparecchiature strutturali speciali'},
    {name: 'OS 11 III-bis Apparecchiature strutturali speciali'},
    {name: 'OS 11 IV Apparecchiature strutturali speciali'},
    {name: 'OS 11 IV-bis Apparecchiature strutturali speciali'},
    {name: 'OS 11 V Apparecchiature strutturali speciali'},
    {name: 'OS 11 VI Apparecchiature strutturali speciali'},
    {name: 'OS 11 VII Apparecchiature strutturali speciali'},
    {name: 'OS 11 VIII Apparecchiature strutturali speciali'},
    {name: 'OS 12-A I Barriere stradali di sicurezza'},
    {name: 'OS 12-A II Barriere stradali di sicurezza'},
    {name: 'OS 12-A III Barriere stradali di sicurezza'},
    {name: 'OS 12-A III-bis Barriere stradali di sicurezza'},
    {name: 'OS 12-A IV Barriere stradali di sicurezza'},
    {name: 'OS 12-A IV-bis Barriere stradali di sicurezza'},
    {name: 'OS 12-A V Barriere stradali di sicurezza'},
    {name: 'OS 12-A VI Barriere stradali di sicurezza'},
    {name: 'OS 12-A VII Barriere stradali di sicurezza'},
    {name: 'OS 12-A VIII Barriere stradali di sicurezza'},
    {name: 'OS 12-B I Barriere paramassi, fermaneve e simili'},
    {name: 'OS 12-B II Barriere paramassi, fermaneve e simili'},
    {name: 'OS 12-B III Barriere paramassi, fermaneve e simili'},
    {name: 'OS 12-B III-bis Barriere paramassi, fermaneve e simili'},
    {name: 'OS 12-B IV Barriere paramassi, fermaneve e simili'},
    {name: 'OS 12-B IV-bis Barriere paramassi, fermaneve e simili'},
    {name: 'OS 12-B V Barriere paramassi, fermaneve e simili'},
    {name: 'OS 12-B VI Barriere paramassi, fermaneve e simili'},
    {name: 'OS 12-B VII Barriere paramassi, fermaneve e simili'},
    {name: 'OS 12-B VIII Barriere paramassi, fermaneve e simili'},
    {name: 'OS 13 I Strutture prefabbricate in cemento armato'},
    {name: 'OS 13 II Strutture prefabbricate in cemento armato'},
    {name: 'OS 13 III Strutture prefabbricate in cemento armato'},
    {name: 'OS 13 III-bis Strutture prefabbricate in cemento armato'},
    {name: 'OS 13 IV Strutture prefabbricate in cemento armato'},
    {name: 'OS 13 IV-bis Strutture prefabbricate in cemento armato'},
    {name: 'OS 13 V Strutture prefabbricate in cemento armato'},
    {name: 'OS 13 VI Strutture prefabbricate in cemento armato'},
    {name: 'OS 13 VII Strutture prefabbricate in cemento armato'},
    {name: 'OS 13 VIII Strutture prefabbricate in cemento armato'},
    {name: 'OS 14 I Impianti di smaltimento e recupero rifiuti'},
    {name: 'OS 14 II Impianti di smaltimento e recupero rifiuti'},
    {name: 'OS 14 III Impianti di smaltimento e recupero rifiuti'},
    {name: 'OS 14 III-bis Impianti di smaltimento e recupero rifiuti'},
    {name: 'OS 14 IV Impianti di smaltimento e recupero rifiuti'},
    {name: 'OS 14 IV-bis Impianti di smaltimento e recupero rifiuti'},
    {name: 'OS 14 V Impianti di smaltimento e recupero rifiuti'},
    {name: 'OS 14 VI Impianti di smaltimento e recupero rifiuti'},
    {name: 'OS 14 VII Impianti di smaltimento e recupero rifiuti'},
    {name: 'OS 14 VIII Impianti di smaltimento e recupero rifiuti'},
    {name: 'OS 15 I Pulizia di acque marine, lacustri, fluviali'},
    {name: 'OS 15 II Pulizia di acque marine, lacustri, fluviali'},
    {name: 'OS 15 III Pulizia di acque marine, lacustri, fluviali'},
    {name: 'OS 15 III-bis Pulizia di acque marine, lacustri, fluviali'},
    {name: 'OS 15 IV Pulizia di acque marine, lacustri, fluviali'},
    {name: 'OS 15 IV-bis Pulizia di acque marine, lacustri, fluviali'},
    {name: 'OS 15 V Pulizia di acque marine, lacustri, fluviali'},
    {name: 'OS 15 VI Pulizia di acque marine, lacustri, fluviali'},
    {name: 'OS 15 VII Pulizia di acque marine, lacustri, fluviali'},
    {name: 'OS 15 VIII Pulizia di acque marine, lacustri, fluviali'},
    {name: 'OS 16 I Impianti per centrali produzione energia elettrica'},
    {name: 'OS 16 II Impianti per centrali produzione energia elettrica'},
    {name: 'OS 16 III Impianti per centrali produzione energia elettrica'},
    {name: 'OS 16 III-bis Impianti per centrali produzione energia elettrica'},
    {name: 'OS 16 IV Impianti per centrali produzione energia elettrica'},
    {name: 'OS 16 IV-bis Impianti per centrali produzione energia elettrica'},
    {name: 'OS 16 V Impianti per centrali produzione energia elettrica'},
    {name: 'OS 16 VI Impianti per centrali produzione energia elettrica'},
    {name: 'OS 16 VII Impianti per centrali produzione energia elettrica'},
    {name: 'OS 16 VIII Impianti per centrali produzione energia elettrica'},
    {name: 'OS 17 I Linee telefoniche ed impianti di telefonia'},
    {name: 'OS 17 II Linee telefoniche ed impianti di telefonia'},
    {name: 'OS 17 III Linee telefoniche ed impianti di telefonia'},
    {name: 'OS 17 III-bis Linee telefoniche ed impianti di telefonia'},
    {name: 'OS 17 IV Linee telefoniche ed impianti di telefonia'},
    {name: 'OS 17 IV-bis Linee telefoniche ed impianti di telefonia'},
    {name: 'OS 17 V Linee telefoniche ed impianti di telefonia'},
    {name: 'OS 17 VI Linee telefoniche ed impianti di telefonia'},
    {name: 'OS 17 VII Linee telefoniche ed impianti di telefonia'},
    {name: 'OS 17 VIII Linee telefoniche ed impianti di telefonia'},
    {name: 'OS 18-A I Componenti strutturali in acciaio'},
    {name: 'OS 18-A II Componenti strutturali in acciaio'},
    {name: 'OS 18-A III Componenti strutturali in acciaio'},
    {name: 'OS 18-A III-bis Componenti strutturali in acciaio'},
    {name: 'OS 18-A IV Componenti strutturali in acciaio'},
    {name: 'OS 18-A IV-bis Componenti strutturali in acciaio'},
    {name: 'OS 18-A V Componenti strutturali in acciaio'},
    {name: 'OS 18-A VI Componenti strutturali in acciaio'},
    {name: 'OS 18-A VII Componenti strutturali in acciaio'},
    {name: 'OS 18-A VIII Componenti strutturali in acciaio'},
    {name: 'OS 18-B I Componenti per facciate continue'},
    {name: 'OS 18-B II Componenti per facciate continue'},
    {name: 'OS 18-B III Componenti per facciate continue'},
    {name: 'OS 18-B III-bis Componenti per facciate continue'},
    {name: 'OS 18-B IV Componenti per facciate continue'},
    {name: 'OS 18-B IV-bis Componenti per facciate continue'},
    {name: 'OS 18-B V Componenti per facciate continue'},
    {name: 'OS 18-B VI Componenti per facciate continue'},
    {name: 'OS 18-B VII Componenti per facciate continue'},
    {name: 'OS 18-B VIII Componenti per facciate continue'},
    {name: 'OS 19 I Impianti di reti di telecomunicazione e di trasmissioni e trattamento'},
    {name: 'OS 19 II Impianti di reti di telecomunicazione e di trasmissioni e trattamento'},
    {name: 'OS 19 III Impianti di reti di telecomunicazione e di trasmissioni e trattamento'},
    {name: 'OS 19 III-bis Impianti di reti di telecomunicazione e di trasmissioni e trattamento'},
    {name: 'OS 19 IV Impianti di reti di telecomunicazione e di trasmissioni e trattamento'},
    {name: 'OS 19 IV-bis Impianti di reti di telecomunicazione e di trasmissioni e trattamento'},
    {name: 'OS 19 V Impianti di reti di telecomunicazione e di trasmissioni e trattamento'},
    {name: 'OS 19 VI Impianti di reti di telecomunicazione e di trasmissioni e trattamento'},
    {name: 'OS 19 VII Impianti di reti di telecomunicazione e di trasmissioni e trattamento'},
    {name: 'OS 19 VIII Impianti di reti di telecomunicazione e di trasmissioni e trattamento'},
    {name: 'OS 20-A I Rilevamenti topografici'},
    {name: 'OS 20-A II Rilevamenti topografici'},
    {name: 'OS 20-A III Rilevamenti topografici'},
    {name: 'OS 20-A III-bis Rilevamenti topografici'},
    {name: 'OS 20-A IV Rilevamenti topografici'},
    {name: 'OS 20-A IV-bis Rilevamenti topografici'},
    {name: 'OS 20-A V Rilevamenti topografici'},
    {name: 'OS 20-A VI Rilevamenti topografici'},
    {name: 'OS 20-A VII Rilevamenti topografici'},
    {name: 'OS 20-A VIII Rilevamenti topografici'},
    {name: 'OS 20-B I Indagini geognostiche'},
    {name: 'OS 20-B II Indagini geognostiche'},
    {name: 'OS 20-B III Indagini geognostiche'},
    {name: 'OS 20-B III-bis Indagini geognostiche'},
    {name: 'OS 20-B IV Indagini geognostiche'},
    {name: 'OS 20-B IV-bis Indagini geognostiche'},
    {name: 'OS 20-B V Indagini geognostiche'},
    {name: 'OS 20-B VI Indagini geognostiche'},
    {name: 'OS 20-B VII Indagini geognostiche'},
    {name: 'OS 20-B VIII Indagini geognostiche'},
    {name: 'OS 21 I Opere strutturali speciali'},
    {name: 'OS 21 II Opere strutturali speciali'},
    {name: 'OS 21 III Opere strutturali speciali'},
    {name: 'OS 21 III-bis Opere strutturali speciali'},
    {name: 'OS 21 IV Opere strutturali speciali'},
    {name: 'OS 21 IV-bis Opere strutturali speciali'},
    {name: 'OS 21 V Opere strutturali speciali'},
    {name: 'OS 21 VI Opere strutturali speciali'},
    {name: 'OS 21 VII Opere strutturali speciali'},
    {name: 'OS 21 VIII Opere strutturali speciali'},
    {name: 'OS 22 I Impianti di potabilizzazione e depurazione'},
    {name: 'OS 22 II Impianti di potabilizzazione e depurazione'},
    {name: 'OS 22 III Impianti di potabilizzazione e depurazione'},
    {name: 'OS 22 III-bis Impianti di potabilizzazione e depurazione'},
    {name: 'OS 22 IV Impianti di potabilizzazione e depurazione'},
    {name: 'OS 22 IV-bis Impianti di potabilizzazione e depurazione'},
    {name: 'OS 22 V Impianti di potabilizzazione e depurazione'},
    {name: 'OS 22 VI Impianti di potabilizzazione e depurazione'},
    {name: 'OS 22 VII Impianti di potabilizzazione e depurazione'},
    {name: 'OS 22 VIII Impianti di potabilizzazione e depurazione'},
    {name: 'OS 23 I Demolizione di opere'},
    {name: 'OS 23 II Demolizione di opere'},
    {name: 'OS 23 III Demolizione di opere'},
    {name: 'OS 23 III-bis Demolizione di opere'},
    {name: 'OS 23 IV Demolizione di opere'},
    {name: 'OS 23 IV-bis Demolizione di opere'},
    {name: 'OS 23 V Demolizione di opere'},
    {name: 'OS 23 VI Demolizione di opere'},
    {name: 'OS 23 VII Demolizione di opere'},
    {name: 'OS 23 VIII Demolizione di opere'},
    {name: 'OS 24 I Verde e arredo urbano'},
    {name: 'OS 24 II Verde e arredo urbano'},
    {name: 'OS 24 III Verde e arredo urbano'},
    {name: 'OS 24 III-bis Verde e arredo urbano'},
    {name: 'OS 24 IV Verde e arredo urbano'},
    {name: 'OS 24 IV-bis Verde e arredo urbano'},
    {name: 'OS 24 V Verde e arredo urbano'},
    {name: 'OS 24 VI Verde e arredo urbano'},
    {name: 'OS 24 VII Verde e arredo urbano'},
    {name: 'OS 24 VIII Verde e arredo urbano'},
    {name: 'OS 25 I Scavi archeologici'},
    {name: 'OS 25 II Scavi archeologici'},
    {name: 'OS 25 III Scavi archeologici'},
    {name: 'OS 25 III-bis Scavi archeologici'},
    {name: 'OS 25 IV Scavi archeologici'},
    {name: 'OS 25 IV-bis Scavi archeologici'},
    {name: 'OS 25 V Scavi archeologici'},
    {name: 'OS 25 VI Scavi archeologici'},
    {name: 'OS 25 VII Scavi archeologici'},
    {name: 'OS 25 VIII Scavi archeologici'},
    {name: 'OS 26 I Pavimentazioni e sovrastrutture speciali'},
    {name: 'OS 26 II Pavimentazioni e sovrastrutture speciali'},
    {name: 'OS 26 III Pavimentazioni e sovrastrutture speciali'},
    {name: 'OS 26 III-bis Pavimentazioni e sovrastrutture speciali'},
    {name: 'OS 26 IV Pavimentazioni e sovrastrutture speciali'},
    {name: 'OS 26 IV-bis Pavimentazioni e sovrastrutture speciali'},
    {name: 'OS 26 V Pavimentazioni e sovrastrutture speciali'},
    {name: 'OS 26 VI Pavimentazioni e sovrastrutture speciali'},
    {name: 'OS 26 VII Pavimentazioni e sovrastrutture speciali'},
    {name: 'OS 26 VIII Pavimentazioni e sovrastrutture speciali'},
    {name: 'OS 27 I Impianti per la trazione elettrica'},
    {name: 'OS 27 II Impianti per la trazione elettrica'},
    {name: 'OS 27 III Impianti per la trazione elettrica'},
    {name: 'OS 27 III-bis Impianti per la trazione elettrica'},
    {name: 'OS 27 IV Impianti per la trazione elettrica'},
    {name: 'OS 27 IV-bis Impianti per la trazione elettrica'},
    {name: 'OS 27 V Impianti per la trazione elettrica'},
    {name: 'OS 27 VI Impianti per la trazione elettrica'},
    {name: 'OS 27 VII Impianti per la trazione elettrica'},
    {name: 'OS 27 VIII Impianti per la trazione elettrica'},
    {name: 'OS 28 I Impianti termici e di condizionamento'},
    {name: 'OS 28 II Impianti termici e di condizionamento'},
    {name: 'OS 28 III Impianti termici e di condizionamento'},
    {name: 'OS 28 III-bis Impianti termici e di condizionamento'},
    {name: 'OS 28 IV Impianti termici e di condizionamento'},
    {name: 'OS 28 IV-bis Impianti termici e di condizionamento'},
    {name: 'OS 28 V Impianti termici e di condizionamento'},
    {name: 'OS 28 VI Impianti termici e di condizionamento'},
    {name: 'OS 28 VII Impianti termici e di condizionamento'},
    {name: 'OS 28 VIII Impianti termici e di condizionamento'},
    {name: 'OS 29 I Armamento ferroviario'},
    {name: 'OS 29 II Armamento ferroviario'},
    {name: 'OS 29 III Armamento ferroviario'},
    {name: 'OS 29 III-bis Armamento ferroviario'},
    {name: 'OS 29 IV Armamento ferroviario'},
    {name: 'OS 29 IV-bis Armamento ferroviario'},
    {name: 'OS 29 V Armamento ferroviario'},
    {name: 'OS 29 VI Armamento ferroviario'},
    {name: 'OS 29 VII Armamento ferroviario'},
    {name: 'OS 29 VIII Armamento ferroviario'},
    {name: 'OS 30 I Impianti interni elettrici, telefonici, radiotelefonici e televisivi'},
    {name: 'OS 30 II Impianti interni elettrici, telefonici, radiotelefonici e televisivi'},
    {name: 'OS 30 III Impianti interni elettrici, telefonici, radiotelefonici e televisivi'},
    {name: 'OS 30 III-bis Impianti interni elettrici, telefonici, radiotelefonici e televisivi'},
    {name: 'OS 30 IV Impianti interni elettrici, telefonici, radiotelefonici e televisivi'},
    {name: 'OS 30 IV-bis Impianti interni elettrici, telefonici, radiotelefonici e televisivi'},
    {name: 'OS 30 V Impianti interni elettrici, telefonici, radiotelefonici e televisivi'},
    {name: 'OS 30 VI Impianti interni elettrici, telefonici, radiotelefonici e televisivi'},
    {name: 'OS 30 VII Impianti interni elettrici, telefonici, radiotelefonici e televisivi'},
    {name: 'OS 30 VIII Impianti interni elettrici, telefonici, radiotelefonici e televisivi'},
    {name: 'OS 31 I Impianti per la mobilità sospesa'},
    {name: 'OS 31 II Impianti per la mobilità sospesa'},
    {name: 'OS 31 III Impianti per la mobilità sospesa'},
    {name: 'OS 31 III-bis Impianti per la mobilità sospesa'},
    {name: 'OS 31 IV Impianti per la mobilità sospesa'},
    {name: 'OS 31 IV-bis Impianti per la mobilità sospesa'},
    {name: 'OS 31 V Impianti per la mobilità sospesa'},
    {name: 'OS 31 VI Impianti per la mobilità sospesa'},
    {name: 'OS 31 VII Impianti per la mobilità sospesa'},
    {name: 'OS 31 VIII Impianti per la mobilità sospesa'},
    {name: 'OS 32 I Strutture in legno'},
    {name: 'OS 32 II Strutture in legno'},
    {name: 'OS 32 III Strutture in legno'},
    {name: 'OS 32 III-bis Strutture in legno'},
    {name: 'OS 32 IV Strutture in legno'},
    {name: 'OS 32 IV-bis Strutture in legno'},
    {name: 'OS 32 V Strutture in legno'},
    {name: 'OS 32 VI Strutture in legno'},
    {name: 'OS 32 VII Strutture in legno'},
    {name: 'OS 32 VIII Strutture in legno'},
    {name: 'OS 33 I Coperture speciali'},
    {name: 'OS 33 II Coperture speciali'},
    {name: 'OS 33 III Coperture speciali'},
    {name: 'OS 33 III-bis Coperture speciali'},
    {name: 'OS 33 IV Coperture speciali'},
    {name: 'OS 33 IV-bis Coperture speciali'},
    {name: 'OS 33 V Coperture speciali'},
    {name: 'OS 33 VI Coperture speciali'},
    {name: 'OS 33 VII Coperture speciali'},
    {name: 'OS 33 VIII Coperture speciali'},
    {name: 'OS 34 I Sistemi antirumore per infrastrutture di mobilità'},
    {name: 'OS 34 II Sistemi antirumore per infrastrutture di mobilità'},
    {name: 'OS 34 III Sistemi antirumore per infrastrutture di mobilità'},
    {name: 'OS 34 III-bis Sistemi antirumore per infrastrutture di mobilità'},
    {name: 'OS 34 IV Sistemi antirumore per infrastrutture di mobilità'},
    {name: 'OS 34 IV-bis Sistemi antirumore per infrastrutture di mobilità'},
    {name: 'OS 34 V Sistemi antirumore per infrastrutture di mobilità'},
    {name: 'OS 34 VI Sistemi antirumore per infrastrutture di mobilità'},
    {name: 'OS 34 VII Sistemi antirumore per infrastrutture di mobilità'},
    {name: 'OS 34 VIII Sistemi antirumore per infrastrutture di mobilità'},
    {name: 'OS 35 I Interventi a basso impatto ambientale'},
    {name: 'OS 35 II Interventi a basso impatto ambientale'},
    {name: 'OS 35 III Interventi a basso impatto ambientale'},
    {name: 'OS 35 III-bis Interventi a basso impatto ambientale'},
    {name: 'OS 35 IV Interventi a basso impatto ambientale'},
    {name: 'OS 35 IV-bis Interventi a basso impatto ambientale'},
    {name: 'OS 35 V Interventi a basso impatto ambientale'},
    {name: 'OS 35 VI Interventi a basso impatto ambientale'},
    {name: 'OS 35 VII Interventi a basso impatto ambientale'},
    {name: 'OS 35 VIII Interventi a basso impatto ambientale'}

  ]

  constructor(private _spinner: NgxSpinnerService, private pdf: PdfService, private changeDetector: ChangeDetectorRef, private modalService: NgbModal, private router: Router, private clienti: ClientiService, private servicepersonale: PersonaleService, private contrattoservice: ContrattoService, private prezziariogeneraleservice: PrezziarioGeneraleService) {
  }

  ngOnInit(): void {
    registerLocaleData(localeIt, 'it');

    // riempio temporaneamente la tabella con i dati precedentemente scaricati e messi all'interno di this.contrattoservice.contratti che si trova nei servizi
    // successivamente con la getAllContratti ripopolo la tabella con i dati appena scaricati
    this.contratti = this.contrattoservice.contratti;
    this.tempData = this.contrattoservice.contratti;

    // popolo l'array clientiget in modo da poter usare i clienti nel form del crea cantiere
    this.clienti.getAllClienti()
      .subscribe(
        (res) => {
          this.clientiget = res
        },
        (err) => {
          LoggingService.log('errore nel recupero dei clienti', LogLevel.warn, err)
        },
        () => {
          LoggingService.log('array cienti estratti', LogLevel.debug, this.clientiget)
        }
      );
    // popolo l'array personale_get in modo da poter usare il personale nel form del crea cantiere
    this.servicepersonale.getAllPersonale()
      .subscribe(
        (res) => {
          this.personale_get = res
        },
        (err) => {
          LoggingService.log('errore nel recupero del personale', LogLevel.warn, err)
        },
        () => {
          LoggingService.log('array personale estratto', LogLevel.debug, this.personale_get);
          // popolo il campo fullname con una semplice concatenazione di due stringhe
          this.personale_get.forEach(i => {
            i.fullName = i.name + ' ' + i.surname;
          });
        }
      );
    this.contrattoservice.getAllContratti()
      .subscribe(
        (res) => {
          LoggingService.log('contratti ottenuti', LogLevel.debug, res)
          this.contratti = res;
          this.tempData = res;
          this.contrattoservice.contratti = res;
        },
        (err) => {
          LoggingService.log('Errore get contratti ', LogLevel.error, err)
        },
        () => {
          // genero un click
          const tableRef = document.getElementById('ngx-datatable-contratti');
          tableRef.click();
        }
      )
    this.prezziariogeneraleservice.getAllPrezziariGenerali()
      .subscribe(
        (res) => {
          LoggingService.log('Scaricata lista prezziari generali ', LogLevel.debug, res);
          this.prezziariget = res;
        },
        (err) => {
          LoggingService.log('Errore get prezziari generali ', LogLevel.error, err)
        },
        () => {
        },
      )
  }

  // filtro
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    let temp = this.tempData;
    LoggingService.log('filtro attrezzatura', LogLevel.debug, this.tempData)
    if (val) {
      // Filtro i dati se il controllo è valorizzato
      temp = temp.filter(
        (v, i, a) => {
          // Suppongo di default di escluderlo
          let accept = false;
          // se accept è true prendo l'elemento v, altrimenti non lo prendo

          // Filtro x clienteName, se lo trovo lo aggiungo alla lista
          if (v.clienteName.toLowerCase().indexOf(val) !== -1) {
            accept = true;
          }
          // Filtro x shortDesc, se lo trovo lo aggiungo alla lista
          if (v.shortDescription.toLowerCase().indexOf(val) !== -1) {
            accept = true;
          }
          // Filtro per area, se lo trovo lo aggiungo alla lista
          // l'area potrebbe essere null
          if (v.place && v.place.toLowerCase().indexOf(val) !== -1) {
            accept = true;
          }

          return accept;
        }
      );
    }

    // aggiorna le righe della tabella dopo l'eventuale filtraggio
    this.contratti = temp;

  }

  // metodo utilizzato dal tasto "aggiungi contratto" per aprire un popup
  openLg(content) {
    this.modalService.open(content, {size: 'xl'});

  }

  // funzione chiamata alla pressione del bottone posto su ogni riga della tabella
  onView(target: Contratto) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);
    // Navigo verso la dashboard di quel cantiere
    this.router.navigate(['/page/dashboards/contratti/', target.id]);
  }

  // funzione chiamata in seguito alla selezione di una checkbox
  onSelect(event) {
    this.selected = event.selected;
    LoggingService.log('selezionato', LogLevel.debug, event)
  }

  // funzione chiamata al click del bottone modifica sulla riga della tabella
  onModify(modale, contratto: Contratto) {

    this.contrattoservice.getContratto(contratto.id)
      .subscribe(
        (res) => {
          LoggingService.log('contratto da modificare scaricato', LogLevel.debug, res);
          this.nuovocontratto = res;
          this.riempiSoa();
        },
        (err) => {
          LoggingService.log('ERRORE get contratto da modificare', LogLevel.error, err);
        },
        () => {
          this.modalService.open(modale, {size: 'xl'});
        },
      )
  }

  // funzione utilizzata dai datepicker
  cambia(event: NgbDate, binding: string, otherdata: any = null) {
    LoggingService.log('cambia è', LogLevel.debug, event);
    const millisec = Date.now();
    const date = new Date(millisec);
    const ore = Number.parseInt(date.toTimeString().substring(0, 2));
    const minuti = Number.parseInt(date.toTimeString().substring(3, 5));
    const secondi = Number.parseInt(date.toTimeString().substring(6, 8));

    switch (binding) {
      case 'datastipula': {
        if (event.year == null && event.month == null && event.day == null) {
          this.nuovocontratto.startDate = null;
          console.log('cancella data', event);
          return
        }
        this.nuovocontratto.startDate = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        LoggingService.log('la data di stipula del nuovo contratto è', LogLevel.debug, this.nuovocontratto.startDate);
        break;
      }
      case 'datatermine': {
        if (event.year == null && event.month == null && event.day == null) {
          this.nuovocontratto.endingDate = null;
          console.log('cancella data', event);
          return
        }
        this.nuovocontratto.endingDate = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        LoggingService.log('la data di termine del nuovo contratto è', LogLevel.debug, this.nuovocontratto.endingDate);
        break;
      }
      case 'datacontratto': {
        if (event.year == null && event.month == null && event.day == null) {
          otherdata.data = null

          return
        }
        otherdata.data = new Date(event.year, event.month, event.day, ore, minuti, secondi);

        break;
      }
      default: {
        // statements;
        break;
      }
    }

  }

  deleteContratto(event) {
    LoggingService.log('ho premuto il tasto del cestino', LogLevel.debug, event);
    const str = 'Elimina il contratto selezionato';
    const check = true;
    const text = 'L\'azione è irreversibile';

    let ret;

    ret = swal.fire({
      title: str,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: check,
      confirmButtonColor: '#2F8BE6',
      cancelButtonColor: '#F55252',
      cancelButtonText: 'Annulla',
      confirmButtonText: str,
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-info ml-1'
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.value) {
        swal.fire({
          title: 'Sei sicuro?',
          text: '',
          icon: 'warning',
          showCancelButton: true,
          showConfirmButton: check,
          confirmButtonColor: '#2F8BE6',
          cancelButtonColor: '#F55252',
          cancelButtonText: 'No',
          confirmButtonText: 'Si sono sicuro',
          customClass: {
            confirmButton: 'btn btn-danger',
            cancelButton: 'btn btn-info ml-1'
          },
          buttonsStyling: false,
        }).then((result) => {
          if (result.value) {
            LoggingService.log('event è', LogLevel.debug, event.id)
            this.contrattoservice.deleteContratto(event.id)
              .subscribe(
                (res) => {
                  LoggingService.log('contratto eliminato con statuscode:', LogLevel.debug, res.status);
                  swal.fire({
                    icon: 'success',
                    title: 'Fatto!',
                    text: 'Il contratto è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-success'
                    },
                  });
                },
                (err) => {
                  LoggingService.log('errore eliminazione contratto', LogLevel.debug, err);
                  swal.fire({
                    icon: 'error',
                    title: 'C\'è stato un problema!',
                    text: 'Il contratto NON è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-danger'
                    }
                  });
                },
                () => {
                  this.contratti.splice(
                    this.contratti.indexOf(
                      this.contratti.find(x => x.id == event.id)
                    ),
                    1
                  );
                  // ricarico la tabella
                  this.contratti = [...this.contratti];
                  this.tempData = this.contratti;
                }
              )
          }

        })
      }
    })

    LoggingService.log('Danilozzo zzozzo', LogLevel.debug, ret);
  }

  clearData() {
    this.nuovocontratto = new Contratto();
    this.fff = false;
    this.soa = [];
  }

  // chiamata quando si modifica un contratto e lo si salva come bozza
  updateContrattoBozza() {
    this.nuovocontratto.status = 'Bozza';
    this.updateContratto();
  }

  updateContratto() {
    if (this.nuovocontratto.prezzari_id?.length > 0) {
      this.nuovocontratto.idPrezziarioCliente = this.nuovocontratto.prezzari_id[0];
    }

    this.nuovocontratto.soa = this.SOA;
    this.contrattoservice.updateContratto(this.nuovocontratto.id, this.nuovocontratto)
      .subscribe(
        (res) => {
          LoggingService.log('ok update andato', LogLevel.debug, res);
          console.warn(this.clientiget);
          console.warn(this.nuovocontratto);
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
          // necessario per visualizzare correttamente il dato nella tabella
          this.nuovocontratto.clienteName = this.nuovocontratto.cliente.name;

          swal.fire({
            icon: 'success',
            title: 'Fatto!',
            text: 'Il contratto è stato modificato',
            customClass: {
              confirmButton: 'btn btn-success'
            },
          });
          // pos contiene la posizione del servizio da modificare
          const pos = this.contratti.indexOf(this.contratti.find(x => x.id == this.nuovocontratto.id));
          // sovrascrivo l'oggetto in posizione pos con il nuovoservizio
          this.contratti[pos] = this.nuovocontratto;
          this.tempData = this.contratti;
          // ricarico la tabella
          this.contratti = [...this.contratti];
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
          this.clearData();
        },
      )
  }

  // chiamata quando viene selezionato un contratto e aperto il popup di modifica
  riempiSoa() {
    console.log('contratto selezionato soa', this.nuovocontratto.soa);
    if (this.nuovocontratto.soa && this.nuovocontratto.soa.length > 0) {

      let index = 0;
      for (let i = 0; i < this.nuovocontratto.soa.length; i++) {
        const char = this.nuovocontratto.soa.charAt(i);
        if (char == '$' && this.nuovocontratto.soa.charAt(i + 1) == '%') {

          this.soa.push(this.nuovocontratto.soa.substring(index, i));
          index = i + 2;
        }
      }
      console.log('SOAAA', this.soa);
      return;
    } else {
      this.soa = [];
    }
  }

  // chiamata ogni volta che viene cambiata la categoria SOA
  categoriaSOA(event) {
    console.log(event);
    this.SOA = '';

    event.forEach(element => {
      this.SOA = this.SOA.concat(element.name + '$%');
    });
  }

  // crea il contratto imopstando lo stato a Bozza
  creaContrattoBozza() {
    this.nuovocontratto.status = 'Bozza';
    this.creaContratto();
  }

  creaContratto() {

    LoggingService.log('il nuovo contratto è', LogLevel.debug, this.nuovocontratto);
    this.nuovocontratto.clienteName = this.clientiget.find(x => x.id == this.nuovocontratto.idCliente).name;
    // trasformo l'array delle soa in una stringa unica

    // this.nuovocontratto.soa.forEach(e => {
    //   soa = soa.concat(e) + '$%';
    // });
    if (this.nuovocontratto.prezzari_id?.length > 0) {
      this.nuovocontratto.idPrezziarioCliente = this.nuovocontratto.prezzari_id[0];
    }

    this.nuovocontratto.soa = this.SOA;
    this.contrattoservice.postContratto(this.nuovocontratto)
      .subscribe(
        (res) => {
          LoggingService.log('nuovo contratto postato con successo', LogLevel.debug, res);
          this.nuovocontratto.id = res.id;
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
            title: 'Contratto Creato!',
            text: 'Il contratto è stato aggiunto nella tabella',
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'

            },
            buttonsStyling: false,
            confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
          });
        },
        (err) => {
          LoggingService.log('ERRORE post nuovo contratto', LogLevel.debug, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il contratto NON è stato creato.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {
          this.contratti.unshift(this.nuovocontratto);
          this.contratti = [...this.contratti];
          this.clearData();
          this.tempData = this.contratti;
        }
      )

  }

  validationForm(form) {
    LoggingService.log('form', LogLevel.debug, form);
    // calcolo importo iniziale netto
    if (this.nuovocontratto.initialGrossWorkAmount == null && this.nuovocontratto.initialChargesAmount == null) {
      this.nuovocontratto.startNetAmount = null;
    }
    if (this.nuovocontratto.initialGrossWorkAmount != null && this.nuovocontratto.initialChargesAmount != null) {
      if (this.nuovocontratto.discount == null) {
        this.nuovocontratto.startNetAmount = Number.parseFloat((this.nuovocontratto.initialGrossWorkAmount + this.nuovocontratto.initialChargesAmount).toFixed(3));
      } else {
        this.nuovocontratto.startNetAmount = Number.parseFloat((this.nuovocontratto.initialGrossWorkAmount - (this.nuovocontratto.initialGrossWorkAmount * this.nuovocontratto.discount / 100) + this.nuovocontratto.initialChargesAmount).toFixed(3));
      }
    }
    if (this.nuovocontratto.initialGrossWorkAmount != null && this.nuovocontratto.initialChargesAmount == null) {
      this.nuovocontratto.startNetAmount = this.nuovocontratto.initialGrossWorkAmount;
    }

    if (this.nuovocontratto.initialGrossWorkAmount == null && this.nuovocontratto.initialChargesAmount != null) {
      this.nuovocontratto.startNetAmount = this.nuovocontratto.initialChargesAmount;
    }

    this.nuovocontratto.totalGrossWorkAmount = this.nuovocontratto.initialGrossWorkAmount ?? 0

    this.nuovocontratto.totalChargesAmount = this.nuovocontratto.initialChargesAmount ?? 0
    this.nuovocontratto.totalNetAmount = this.nuovocontratto.startNetAmount ?? 0

    // calcolo importo aggiuntivo netto

    for (let valAgg of this.nuovocontratto.valoriAggiuntivi) {

      if (valAgg.additionalGrossWorkAmount === null && valAgg.additionalChargesAmount === null) {
        valAgg.additionalNetAmount = null;
      }

      if (this.nuovocontratto.discount) {
        valAgg.additionalNetAmount = Number.parseFloat(((valAgg.additionalGrossWorkAmount ?? 0) - ((valAgg.additionalGrossWorkAmount ?? 0) * this.nuovocontratto.discount / 100) + valAgg.additionalChargesAmount).toFixed(3));
      } else {
        valAgg.additionalNetAmount = Number.parseFloat(((valAgg.additionalGrossWorkAmount ?? 0) + (valAgg.additionalChargesAmount ?? 0)).toFixed(3));
      }

      this.nuovocontratto.totalGrossWorkAmount += valAgg.additionalGrossWorkAmount ?? 0

      this.nuovocontratto.totalChargesAmount += valAgg.additionalChargesAmount ?? 0
      this.nuovocontratto.totalNetAmount += valAgg.additionalNetAmount ?? 0

    }

    //arrotonda il totale netto
    this.nuovocontratto.totalNetAmount = Number.parseFloat(this.nuovocontratto.totalNetAmount.toFixed(3))

    if (form.status == 'VALID') {
      this.fff = true;
      return;
    } else {
      this.fff = false
      return;
    }
  }

  downloadPdf() {
    if (this.contratti.length > this.limit) {

      let l = this.limit
      this.limit = this.contratti.length
      setTimeout(() => {
        this.pdf.downloadPDF('ngx-datatable-contratti', `contratti`, () => {
          this.limit = l;
          this.changeDetector.detectChanges()
        }, this._spinner)
      })
    } else {
      this.pdf.downloadPDF('ngx-datatable-contratti', `contratti`, null, this._spinner)
    }

  }

  protected readonly JSON = JSON;

  protected readonly removeValoriAggiuntivi = removeValoriAggiuntivi;
  protected readonly addValoriAggiuntivi = addValoriAggiuntivi;
  protected readonly Date = Date;
  protected readonly dataToStringValue = dataToStringValue;

  isLastIndex(i: number): boolean {
    return this.nuovocontratto.valoriAggiuntivi.length === 0 || i === this.nuovocontratto.valoriAggiuntivi.length - 1;
  }

}

