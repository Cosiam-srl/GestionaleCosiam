#nullable enable
using System.Collections.Generic;
using System.Linq;

namespace CosiamAPI.Models
{
	public struct ReportDiCantiereViewModel
	{
		public int Id { get; set; }
		public string Author { get; set; }
		public string date { get; set; }
		public Cantiere? Cantiere { get; set; } // contiene cantiere e contratto.cliente e il luogo
		public IGrouping<CosiamAPI.Models.Personale, CosiamAPI.Models.TimeCard>[] Ore { get; set; }
		public TimeCard[] oreNormali { get; set; }
		public TimeCard[] OreStraordinarie { get; set; }
		public TimeCard[] OreSpostamento { get; set; }
		public VehicleCard[] VehiclesStuff { get; set; } // Contiene il veicolo in uso (e quindi il costo giornaliero), la benzina usata e il relativo costo
		public ListOfServicesSoldToClient[] LavoriEseguiti { get; set; } // Contiene il servizio in uso e la relativa quantità
		public ListOfGoodsAndServicesInUse[] Provviste { get; set; } // Contiene il servizio in uso, la quantità ed il fornitore
		public string Sign { get; set; }
		public AllegatiEQuestionarioReportModel[] Questionario { get; set; }
		public DocumentsList[] Immagini { get; set; }
		public string file_base_path { get; set; }
		public ushort? ProgressivoContatore { get; set; }
		public bool? mostraCosti { get; set; }      //  mostrare nel report informazioni sui costi
		public bool? mostraRicavi { get; set; }     // mostrare nel report informazioni sui ricavi
		public bool? mostraFoto { get; set; }       // mostrare nel report foto
		public bool? reportCompleto { get; set; }   // Report completo o sintetico (mostra dettagli)  
		public required bool ReportSingolo { get; set; }
		public IEnumerable<IGrouping<int, object>> Details { get; set; } //contiene i dati utili per mostrare i dettagli nell'aggregazione di più report




		public ReportDiCantiereViewModel()
		{
			mostraCosti = true;
			mostraRicavi = true;
			mostraFoto = true;
			reportCompleto = true;
		}
	}
}

