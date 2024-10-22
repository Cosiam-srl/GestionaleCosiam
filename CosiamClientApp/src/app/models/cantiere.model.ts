import {Contratto} from './contratto.model';
import {ValoriAggiuntivi} from "./valoriaggiuntivi.model";

/**
 * Classe modello del cantiere
 */
export class Cantiere {
  id: number; // ok
  state: string; // ok
  address: string; // ok
  start: Date; // ok
  estimatedEnding: Date; // ok
  logo: File;
  orderCode: string; // ok
  description: string; // ok
  shortDescription: string;

  rup: string; // ok
  dl: string; // ok
  cse: string; // ok

  soa: string; // da aggiungere sul backend

  idContratto: number; // ok
  contratto: Contratto;
  idClienti: number; // ok

  workBudget: number; // lavori
  chargesBudget: number; // oneri
  orderAmount: number; // importo commessa
  additionalActsBudget: number; // atti aggiuntivi CAMPO ELIMINATO

  totalGrossWorkAmount = 0; // importo lavori totale lordo
  totalChargesAmount = 0; // importo oneri totale

  finalAmount: number; // importo finale
  percentualeSpeseGenerali: number; // percentuale spese generali

  cap: number// serve per il meteo;

  costiIniziali: number;
  ricaviIniziali: number;

  valoriAggiuntivi: ValoriAggiuntivi[] = [];

}

export class DatiFinanziari {
  id?: number;
  idCantiere?: number;
  // i dati verranno passati al backend parsati a numbers
  creditiVsClienti: number;
  daContabilizzare: string;
  daFatturare: string;
  daIncassare: string;
  debitiABreve: string; // ok
  anticipazioniDaRestituire: string;
  debitiVsFornitori: number;
  paghe: string;
  fattureRicevute: string;
  fattureDaRicevere: string;
  saldo: number;
  cashflow: number;
  proxSal: string;
}

export class AvanzamentoTemporaleCantiere {
  totalDays = 0;
  daysElapsed = 0;
  perc = 0;

  public sumAvanzamento(avt: AvanzamentoTemporaleCantiere) {
    this.totalDays += avt.totalDays;
    this.daysElapsed += avt.daysElapsed;
    this.perc += avt.perc;
  }

  public sumPerc(value: number) {
    this.perc += value;
  }
}
