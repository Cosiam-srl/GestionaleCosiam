import { Pipe, PipeTransform } from '@angular/core';
import { LoggingService, LogLevel } from '../services/logging/logging.service';

@Pipe({
    name: 'datastringa'
})
export class DataToStringPipe implements PipeTransform {

    transform(date: Date): string {
        if (Date == null) { return; }
        console.warn('data passata alla pipe datastringa', date);
        console.warn('data passata alla pipe datastringa con isostring', date.toISOString());
        const anno = date.toISOString().substring(0, 4);
        console.warn(date);
        LoggingService.log('data json in pipe datastringa', LogLevel.debug, [date.getDate(), date.getMonth() + 1, date.getFullYear()]);
        const mese = date.toISOString().substring(5, 7);
        const giorno = date.toISOString().substring(8, 10);
        let fullDate = giorno + '-' + mese + '-' + anno;
        return fullDate;
    }
}
