import { Note } from './note.model';
import { TaggedNota } from './taggednota.model';

export class Personale {
    id: number; // ok
    title: string; // ok
    name: string; // ok
    surname: string; // ok
    fullName = ''; // ok
    employed: boolean; // ok
    job: string; // ok
    contract: string; // ok
    consegnaDPI = false;
    consegnaTesserinoAziendale = false;
    birthday: string; // ok
    birthPlace: string; // ok
    address: string; // ok
    telephone: string; // ok
    cf: string; // ok
    organizationRole: string; // ok
    level: string; // ok

    email: string; // ok
    medicalIdoneity: Date;
    hiringStartDate: Date;
    hiringEndDate: Date;

    // prezzo orario ordinario e straordinario
    ordinaryPrice: number;
    extraordinaryPrice: number;
    travelPrice: number;
    skills: string;
    file: string | ArrayBuffer;
    inStrenght: string;
    //PER LA GESTIONE UTENTE
    canLogin: boolean = false;
    role: string;
    ///////////////////////
}
export class ScadenzePersonale {
    id?: number;
    performingDate: Date;
    idPersonale: number;
    personale: Personale;
    idNote: number;
    nota: TaggedNota;
}

export class EstrazioneDatiPersonaleMezziModel {
    ids: number[] = [];
    dateFrom?: Date;
    dateTo?: Date
}