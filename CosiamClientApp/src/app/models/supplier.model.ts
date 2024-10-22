import { TaggedNota } from './taggednota.model';

export class Supplier {
    id: number; // ok
    name: string; // ok
    email: string; // ok
    piva: string; // ok
    cf: string; // ok
    address: string; // ok
    type: string; // ok
    status: string;
    CAP: string; // ok
    telephone: string; // ok
    file: string| ArrayBuffer;
}
export class ScadenzeFornitore {
    id: number;
    performingDate: Date;
    idFornitori: number;
    fornitore: Supplier;
    idNote: number;
    nota: TaggedNota;
}
