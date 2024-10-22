import { formatCurrency, formatDate, formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'tableRowFormatter'
})
export class TableRowFormatterPipe implements PipeTransform {

  transform(value: string, formatType: 'string' | 'number' | 'currency' | 'date'| 'datetime', ...args: unknown[]): string {
    switch(formatType) {
      case 'string':
        return value;
      case 'number':
        return formatNumber(Number.parseFloat(value), 'it', '1.0-0');
      case 'currency':
        return formatCurrency(Number.parseFloat(value),'it','€','EUR','1.00-2');
      case 'date':
        return formatDate(value, 'dd-MM-yyyy','it'); //CEST or CET standard timezone
      case 'datetime':
        return formatDate(value, 'dd-MM-yyyy HH:mm','it'); //CEST or CET standard timezone

      default:
        return value;
    }
  }

}
