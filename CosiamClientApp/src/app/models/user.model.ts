import { Personale } from './personale.model';

export class User {
    username: string;
    email: string;
    password: string;
    level: string;
    status: string;
    persona: Personale;
}
