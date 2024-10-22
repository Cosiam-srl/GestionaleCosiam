import {_File} from "./file.model";

export class BudgetModel {

  id: number; //da database
  idCantiere: number; //FK da database
  capitoli: CapitoloModel[]; //da database
  totaleRicavi: number; //calcolato
  totaleCosti: number; //calcolato
  totaleMargine: number; //calcolato
  percentualeRicavi: number; //calcolato

}

export class CapitoloModel {

  id: number; //da database
  capitolo: string; //da database
  attivita: AttivitaBudgetModel[]; //da database
  totaleRicavi: number; //calcolato
  totaleCosti: number; //calcolato
  totaleMargine: number; //calcolato
  virtualID?: number; //temporaneo
  attivitaDaEliminare?: AttivitaBudgetModel[]; //temporaneo

}

export interface AttivitaBudgetModel {
  id: number; //da database
  attivita: string; //da database
  ricavi: number; //da database
  costi: number; //da database
  margine: number; //calcolato
  percentualeRicavi: number; //calcolato
  idFornitore?: number; //da database
  allegato: _File[]; //da database
  virtualID?: number; //temporaneo
  allegatiDaEliminare?: _File[]; //temporaneo

}

export interface AttachmentsBudget {
  id: number
  idAttivitaBudget: number
  idFile: number
  attivitaBudget?: AttivitaBudgetModel
  file?: _File
}
