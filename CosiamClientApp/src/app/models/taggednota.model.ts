import { _File } from './file.model';
import { Note } from './note.model';
import { Personale } from './personale.model';

export class TaggedNota {
    nota: Note;
    personaleTagged: Personale[] = [];
    listFile: _File[];
}
