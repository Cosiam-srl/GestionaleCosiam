import { Personale } from './personale.model';

export class ListaPersonaleAssegnatoDiCantiere {
    id: number;
    idPersonale: number;
    personale: Personale;
    idCantiere: number;
    fromDate: Date;
    toDate: Date
}
