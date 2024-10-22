import { _File } from './file.model';

export class ListaSalFattureCantiere {
    id: number;
    descriptionNumberSal: string;
    descriptionNumberCP: string;
    descriptionNumberFattura: string;

    dataEmissioneSAL: string;
    dataEmissioneCP: string;
    dataEmissioneFattura: string;
    dataScadenzaFattura: string;
    dataIncassoFattura: string;
    delayDaysFattura: number; // giornidiritardoFattura

    netAmountSAL: string;
    netAmountCP: number;
    netAmountFattura: number;

    ivaAmountFattura: number;

    salState: string;
    cpState: string;
    fatturaState: string;

    contractualAdvance: string; // anticipazione cotrattuale
    accidentsWithholding: string; // ritenuta infortuni
    iva: string;
    idCantiere: number;

    startingReferralPeriodDate: string; // data inizio periodo di riferimento
    endingReferralPeriodDate: string; // data fine periodo di riferimento

    listFile: _File[]; // contiene in ordine l'allegato SAL, allegato CP e allegato fattura
}
