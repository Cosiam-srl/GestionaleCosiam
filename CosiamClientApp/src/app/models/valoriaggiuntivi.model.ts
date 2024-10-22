import {Cantiere} from "./cantiere.model";
import {Contratto} from "./contratto.model";

export interface ValoriAggiuntivi {
  additionalGrossWorkAmount: number // importo lavori aggiuntivo lordo
  additionalChargesAmount: number; // importo oneri aggiuntivo
  additionalNetAmount: number; // importo aggiuntivo netto
  additionalSolarDays: number; //giorni solari
  codiceContratto?: string;
  data: Date;
  idCantiere?: number // Viene impostato idCantiere o idContratto in base a chi appartiene
  idContratto?: number
}

export function addValoriAggiuntivi(where: Cantiere | Contratto) {

  if (!where.valoriAggiuntivi) {
    where.valoriAggiuntivi = [];
  }

  where.valoriAggiuntivi.push({
    data: null,
    additionalGrossWorkAmount: 0,
    additionalChargesAmount: 0,
    additionalNetAmount: 0,
    additionalSolarDays: 0
  })

}

export function removeValoriAggiuntivi(el: ValoriAggiuntivi, where: Cantiere | Contratto) {
  where.valoriAggiuntivi = arrayRemove(where.valoriAggiuntivi, el)
}

export function arrayRemove(arr: any[], value: any) {

  return arr.filter(function (ele) {
    return ele != value;
  });
}

export function dataToStringValue(d: string | Date) {

  if (d) {
    if (d instanceof Date) {

      return `${d.getFullYear()}-${(d.getMonth() + 1) > 9 ? (d.getMonth() + 1) : "0" + (d.getMonth() + 1)}-${d.getDate() > 9 ? d.getDate() : "0" + d.getDate()}`;

    } else {
      let dd = new Date(d)

      return `${dd.getFullYear()}-${(dd.getMonth() + 1) > 9 ? (dd.getMonth() + 1) : "0" + (dd.getMonth() + 1)}-${dd.getDate() > 9 ? dd.getDate() : "0" + dd.getDate()}`;

    }
  }

}
