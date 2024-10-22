import { _File } from './file.model';

export class Attrezzatura {
    id: number;
    type: string;
    description: string;
    builder: string;
    model: string;
    licensePlate: string;
    productionDate: Date;
    propertyOf: string;
    idoneity: string;
    technicalSpecs: string;
    estimatedValue: number;
    position: string;
    compatibility: string;
    notes: string;
    status: string;
    listFile: _File[];
}
