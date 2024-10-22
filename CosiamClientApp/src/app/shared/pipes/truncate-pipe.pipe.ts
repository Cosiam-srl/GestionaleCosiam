import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncatePipe'
})
export class TruncatePipePipe implements PipeTransform {

  transform(input: Object[], count: number): Object[] {
    return input.slice(0, count);
  }

}
