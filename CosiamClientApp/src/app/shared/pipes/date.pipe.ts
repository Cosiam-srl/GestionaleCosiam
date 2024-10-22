import { Pipe, PipeTransform } from '@angular/core';
import { LoggingService, LogLevel } from '../services/logging/logging.service';

@Pipe({
    name: 'dataleggibile'
})
export class DataPipe implements PipeTransform {
    transform(data): string {
        // console.log('fulldate', fullDate);

        if (data == null) { return; }
        if (typeof data == 'string') {
            const datehour = data.substring(8, 10) + '-' + data.substring(5, 7) + '-' + data.substring(0, 4);
            return datehour;
        }
        if (data instanceof Date) {
            console.warn('data passata alla pipe datastringa', data);
            console.warn('data passata alla pipe datastringa con isostring', data.toISOString());
            const anno = data.toISOString().substring(0, 4);
            const mese = data.toISOString().substring(5, 7);
            const giorno = data.toISOString().substring(8, 10);
            const fullDate = giorno + '-' + mese + '-' + anno;
            return fullDate;
        }
    }
}
