import {Cliente} from './cliente.model';
import {Personale} from './personale.model';
import {ValoriAggiuntivi} from "./valoriaggiuntivi.model";
export {ValoriAggiuntivi}

// ffff
export class Contratto {
  id: number; // ok
  idCliente: number; // ok
  idPrezziarioCliente: number; // ok
  cliente: Cliente; // ok
  shortDescription: string; // ok
  longDescription: string; // ok
  cig: string; // ok
  contractCode: string; // da aggiungere nel backend
  soa: string; // da modificare sul backend
  oda: string; // ok

  idPm: number; // ok
  pm: Personale; // ok
  place: string; // ok
  status: string; // ok
  // yearOfCompletition: string;//da eliminare sul backend
  // extraWorkAmount: number;//da eliminare sul backend
  startDate: Date; // data di stipula da ggiungere sul backend
  endingDate: Date; // data di termine da aggiungere sul backend

  clienteName: string// utilizzato per popolare una colonna della tabella contratti

  initialGrossWorkAmount = 0; // importo lavori iniziale lordo
  initialChargesAmount = 0; // importo oneri iniziale, diventato importo oneri per la sicurezza
  startNetAmount = 0; // importo iniziale netto

  totalGrossWorkAmount = 0; // importo lavori totale lordo
  totalChargesAmount = 0; // importo oneri totale
  totalNetAmount = 0; // importo aggiuntivo totale netto

  discount = 0; // sconto
  totalAmountDiscounted = 0; // somma di importo iniziale(oneri+lavori) con importo perizia meno lo sconto

  orderedImport: number; // importo ordinato. Sarà la somma degli importi dei cantieri
  residualImport: number; // importo residuo

  prezzari_id: number[];

  valoriAggiuntivi: ValoriAggiuntivi[] = [];

}

