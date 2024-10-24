// per il backend corrisponde al ServizioCliente
export class ServizioCliente {
  id: number;
  description: string;
  category: string;
  um: string;
  pricePerUm: number; // float
  iva: number; // float
  idPrezziario: number; // id del prezziario generale
  rateCode: string;
  applyDiscount: boolean;
}

export class ServizioFornitore {
  id: number;
  description: string;
  category: string;
  um: string;
  pricePerUM: number; // senza iva
  iva: number; // float
  idFornitore: string;
}

// per il backend corrisponde a PrezziarioCliente
export class PrezziarioGenerale {
  id: number;
  name: string;
  type: string;
  discountPercentage: number;
  validationYear: string;
  idCliente: number;
  clienteName: string;
}
