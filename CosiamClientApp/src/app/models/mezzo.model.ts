import { Note } from './note.model';
import { TaggedNota } from './taggednota.model';

export class Mezzo {
    id: number;
    description: string;
    brand: string;
    model: string;
    licensePlate: string;
    insuranceExpirationDate: Date;
    revisionExpirationDate: Date;
    stampDutyExpirationDate: Date; // scadenza bollo auto
    tachograph: Date;
    lastKMCheck: number;
    extimatedValue: number;
    matriculationDate: Date;
    originalPrice: number;
    licenseCProprio: Date;
    wearBook: Date;
    furtoIncendio: Date;
    contoProprioContoTerzi: boolean;
    ispsel: Date;
    TwentyYearVerificationOfLiftingOrgans: Date;
    inStrenght: string;
    dailyCost: number;

    fullDescription: string // solo frontEnd: usato per mostrare una descrizione più completa
}
export class ScadenzeMezzo {
    id: number;
    performingDate: Date;
    idMezzi: number;
    mezzo: Mezzo;
    idNote: number;
    nota: TaggedNota;
}
