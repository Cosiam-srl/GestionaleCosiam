import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tagliastringa'
})
export class TagliastringaPipe implements PipeTransform {
  // ritorna solo i primi 15 caratteri della stringa
  transform(fullstring: string): string {
    return fullstring.substring(0, 55) + '...';
  }

}
