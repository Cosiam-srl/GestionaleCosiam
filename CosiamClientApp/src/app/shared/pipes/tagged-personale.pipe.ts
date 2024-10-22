import { Pipe, PipeTransform } from '@angular/core';
import { Personale } from 'app/models/personale.model';

@Pipe({
  name: 'taggedPersonale'
})
export class TaggedPersonalePipe implements PipeTransform {

  transform(value: Personale[], ...args: unknown[]): string {
    let str = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 1) {
        str = str + '...';
        break;
      }
      if (i != 0) {
        str = str + ', ';
      }
      str = str + value[i].name;

    }
    return str;
  }

}
