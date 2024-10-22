using CosiamAPI.Data;
using CosiamAPI.Models.Report;
using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

#nullable enable
namespace CosiamAPI.Models
{
	public class ReportDiCantiere
	{
		public int Id { get; set; }
		public DateTime date { get; set; } = DateTime.Now;
		public string? Sign { get; set; }
		public int IdCantiere { get; set; }
		[ForeignKey("IdCantiere")]
		public Cantiere? Cantiere { get; set; }
		public string? Author { get; set; }
		public string? referenceDate { get; set; }
		public ReportStatus Status { get; set; } = ReportStatus.ToBeApproved;
		public ushort? Counter { get; set; }
		public DateTime? ApprovalDate { get; set; }
		public string? ApprovalAuthor { get; set; }


		public async Task<object> getShortedVersionAsync(ApplicationDbContext _context, ReportDiCantiere rdc)
		{
			var oreNormali = await _context.TimeCard
												.Where(t => t.IdReport == this.Id).Where(t => t.Type == TimeCardsTypes.Ordinary)
												.Select(tc => new TimeCard(tc.Type, tc.NumberOfHours, tc.PersonaleId, tc.IdReport, tc.BeginningDate, tc.EndDate)
												{
													Id = tc.Id,
													Personale = new Personale()
													{
														CF = tc.Personale.CF,
														ConsegnaDPI = tc.Personale.ConsegnaDPI,
														ConsegnaTesserino = tc.Personale.ConsegnaTesserino,
														email = tc.Personale.email,
														Employed = tc.Personale.Employed,
														extraordinaryPrice = tc.Personale.extraordinaryPrice,
														Id = tc.Personale.Id,
														inStrenght = tc.Personale.inStrenght,
														job = tc.Personale.job,
														level = tc.Personale.level,
														medicalIdoneity = tc.Personale.medicalIdoneity,
														Name = tc.Personale.Name,
														ordinaryPrice = tc.Personale.ordinaryPrice,
														OrganizationRole = tc.Personale.OrganizationRole,
														skills = tc.Personale.skills,
														Surname = tc.Personale.Surname,
														telephone = tc.Personale.telephone,
														Title = tc.Personale.Title,
														travelPrice = tc.Personale.travelPrice,
													}
												})
													.ToArrayAsync();
			var OreStraordinarie = await _context.TimeCard
												.Where(t => t.IdReport == this.Id).Where(t => t.Type == TimeCardsTypes.ExtraOrdinary)
												.Select(tc => new TimeCard(tc.Type, tc.NumberOfHours, tc.PersonaleId, tc.IdReport, tc.BeginningDate, tc.EndDate)
												{
													Id = tc.Id,
													Personale = new Personale()
													{
														CF = tc.Personale.CF,
														ConsegnaDPI = tc.Personale.ConsegnaDPI,
														ConsegnaTesserino = tc.Personale.ConsegnaTesserino,
														email = tc.Personale.email,
														Employed = tc.Personale.Employed,
														extraordinaryPrice = tc.Personale.extraordinaryPrice,
														Id = tc.Personale.Id,
														inStrenght = tc.Personale.inStrenght,
														job = tc.Personale.job,
														level = tc.Personale.level,
														medicalIdoneity = tc.Personale.medicalIdoneity,
														Name = tc.Personale.Name,
														ordinaryPrice = tc.Personale.ordinaryPrice,
														OrganizationRole = tc.Personale.OrganizationRole,
														skills = tc.Personale.skills,
														Surname = tc.Personale.Surname,
														telephone = tc.Personale.telephone,
														Title = tc.Personale.Title,
														travelPrice = tc.Personale.travelPrice,
													}
												})
												.ToArrayAsync();
			var OreSpostamento = await _context.TimeCard
												.Where(t => t.IdReport == this.Id).Where(t => t.Type == TimeCardsTypes.Travel)
												.Select(tc => new TimeCard(tc.Type, tc.NumberOfHours, tc.PersonaleId, tc.IdReport, tc.BeginningDate, tc.EndDate)
												{
													Id = tc.Id,
													Personale = new Personale()
													{
														CF = tc.Personale.CF,
														ConsegnaDPI = tc.Personale.ConsegnaDPI,
														ConsegnaTesserino = tc.Personale.ConsegnaTesserino,
														email = tc.Personale.email,
														Employed = tc.Personale.Employed,
														extraordinaryPrice = tc.Personale.extraordinaryPrice,
														Id = tc.Personale.Id,
														inStrenght = tc.Personale.inStrenght,
														job = tc.Personale.job,
														level = tc.Personale.level,
														medicalIdoneity = tc.Personale.medicalIdoneity,
														Name = tc.Personale.Name,
														ordinaryPrice = tc.Personale.ordinaryPrice,
														OrganizationRole = tc.Personale.OrganizationRole,
														skills = tc.Personale.skills,
														Surname = tc.Personale.Surname,
														telephone = tc.Personale.telephone,
														Title = tc.Personale.Title,
														travelPrice = tc.Personale.travelPrice,
													}
												})
												.ToArrayAsync();

			var VehiclesStuff = await _context.VehicleCard.Include(m => m.Mezzo).Where(t => t.IdReport == this.Id).ToArrayAsync();

			var LavoriEseguiti = new LavoriEseguitiReportModel().AdaptPriceForDiscount(_context.ListOfServicesSoldToClient.Where(t => t.IdReport == this.Id).Include(s => s.servizioCliente), _context).ToArray();

			var Provviste = await _context.ListOfGoodsAndServicesInUse.Where(t => t.IdReport == this.Id).Include(s => s.ServizioFornitore).Include(f => f.ServizioFornitore.Fornitore).ToArrayAsync();
			var Report = await _context.ReportDiCantiere
										.Include(r => r.Cantiere)
										.FirstOrDefaultAsync(r => r.Id == Id);

			double? costi = 0.0;


			foreach (var tc in oreNormali)
			{
				if (tc.Personale.OrganizationRole == "Impiegato tecnico")
				{
					tc.NumberOfHours = 8; // Imposta ore normali a 8 se il ruolo è "Impiegato tecnico"
				}
				costi += tc.NumberOfHours * (tc.Personale.ordinaryPrice ?? 0);
			}
			foreach (var tc in OreStraordinarie)
			{
				if (tc.Personale.OrganizationRole == "Impiegato tecnico")
				{
					tc.NumberOfHours = 0; // Imposta ore straordinarie a 0 se il ruolo è "Impiegato tecnico"
				}
				costi += tc.NumberOfHours * (tc.Personale.extraordinaryPrice ?? 0);
			}
			foreach (var tc in OreSpostamento)
			{
				if (tc.Personale.OrganizationRole == "Impiegato tecnico")
				{
					tc.NumberOfHours = 0; // Imposta ore spostamento a 0 se il ruolo è "Impiegato tecnico"
				}
				costi += tc.NumberOfHours * (tc.Personale.travelPrice ?? 0);
			}

			foreach (var vc in VehiclesStuff)
			{
				costi += vc.LitersOfFuel * vc.FuelCost;
				costi += vc.Mezzo.DailyCost;
			}

			foreach (var provvista in Provviste)
			{
				costi += provvista.Quantity * provvista.ServizioFornitore.PricePerUM;
			}

			double? ricavi = 0.0;
			foreach (var lavoro in LavoriEseguiti)
			{
				ricavi += lavoro.Quantity * lavoro.servizioCliente.PricePerUm;
			}

			double? speseGenerali = (ricavi * (Report?.Cantiere?.percentualeSpeseGenerali ?? 0)) / 100;

			return new
			{
				this.Author,
				this.date,
				this.referenceDate,
				this.Id,
				this.IdCantiere,
				costi = costi + speseGenerali,
				ricavi = ricavi,
				margine = ricavi - costi - speseGenerali,
				status = rdc.Status,
				ApprovalAuthor = ApprovalAuthor,
				ApprovalDate = ApprovalDate
			};
		}
	}

	public enum ReportStatus
	{
		Draft,
		ToBeApproved,
		Approved
	}
	public enum TimeCardsTypes
	{
		Ordinary,
		ExtraOrdinary,
		Travel,
		Absence
	}

	/// <summary>
	/// La distanza tra beginning date e l'end date indica i giorni per cui le ore segnate vanno 
	/// valutate. Per esempio se c'è una distanza di tre giorni, significa che quelle ore sono state lavorate
	/// ugualmente in quei tre gorni. Se beginning date è null, va considerata la data del report di
	/// riferimento. Se invece end date è null, va conisderato solo il giorno iniziale.
	/// </summary>
	public class TimeCard
	{
		public int Id { get; set; }
		public double NumberOfHours { get; set; }
		public TimeCardsTypes Type { get; set; } = TimeCardsTypes.Ordinary;
		public DateTime? BeginningDate { get; set; } // DA TOGLIERE GENERE BUG
		public DateTime? EndDate { get; set; }
		[MaxLength(255)]
		public string? AbsenceReason { get; set; }
		public int PersonaleId { get; set; } = 0;
		[ForeignKey("PersonaleId")]
		public Personale? Personale { get; set; }
		public int IdReport { get; set; } = 0;
		[ForeignKey("IdReport")]
		public ReportDiCantiere? ReportDiCantiere { get; set; }
		public TimeCard(TimeCardsTypes type, double numberOfHours, int personaleId, int idReport, DateTime? beginningDate, DateTime? endDate)
		{
			this.Type = type;
			this.NumberOfHours = numberOfHours;
			this.PersonaleId = personaleId;
			this.IdReport = idReport;
			this.BeginningDate = beginningDate;
			this.EndDate = endDate;
		}
	}

	public class VehicleCard
	{
		public int Id { get; set; }
		public double? NumberOfHoursOfUsage { get; set; }
		public DateTime? BeginningDate { get; set; } = new DateTime().Date;
		public DateTime? EndDate { get; set; } = new DateTime().Date;
		public double LitersOfFuel { get; set; }
		public double FuelCost { get; set; }
		public int MezzoId { get; set; } = 0;
		[ForeignKey("MezzoId")]
		public Mezzi? Mezzo { get; set; }
		public int IdReport { get; set; } = 0;
		[ForeignKey("IdReport")]
		public ReportDiCantiere? ReportDiCantiere { get; set; }

		public VehicleCard(double LitersOfFuel, double FuelCost, int MezzoId, int idReport, double? NumberOfHoursOfUsage)
		{
			this.NumberOfHoursOfUsage = NumberOfHoursOfUsage;
			this.LitersOfFuel = LitersOfFuel;
			this.FuelCost = FuelCost;
			this.MezzoId = MezzoId;
			this.IdReport = idReport;
		}
	}
	public class ListOfServicesSoldToClient
	{
		public int Id { get; set; }
		public string? Description { get; set; }
		public double Quantity { get; set; }
		public double EqualParts { get; set; } = 1;
		public double? Length { get; set; }
		public double? Width { get; set; }
		public double? Height { get; set; }
		public int ServizioId { get; set; }
		[ForeignKey("ServizioId")]
		public ServizioCliente? servizioCliente { get; set; }
		public int IdReport { get; set; } = 0;
		[ForeignKey("IdReport")]
		public ReportDiCantiere? ReportDiCantiere { get; set; }
		public ListOfServicesSoldToClient(double quantity, string? Description, int ServizioId, int idReport, double equalParts, double? length = default, double? width = default, double? height = default)
		{
			this.Description = Description;
			this.Quantity = quantity;
			this.ServizioId = ServizioId;
			this.IdReport = idReport;
			this.EqualParts = equalParts;
			this.Length = length;
			this.Width = width;
			this.Height = height;
		}

	}
	public class ListOfGoodsAndServicesInUse
	{
		public int Id { get; set; }
		public string? Description { get; set; }
		public double Quantity { get; set; }
		public int ServizioId { get; set; }
		[ForeignKey("ServizioId")]
		public ServizioFornitore? ServizioFornitore { get; set; }
		public int IdReport { get; set; } = 0;
		[ForeignKey("IdReport")]
		public ReportDiCantiere? ReportDiCantiere { get; set; }
		public ListOfGoodsAndServicesInUse(double Quantity, int ServizioId, int idReport, string? Description)
		{
			this.Description = Description;
			this.ServizioId = ServizioId;
			this.IdReport = idReport;
			this.Quantity = Quantity;
		}
	}

	public class AllegatiEQuestionarioReportModel
	{
		public int Id { get; set; }
		public string? commenti { get; set; } = "No";
		public string? fornitori { get; set; } = "No";
		public string? commentiFornitori { get; set; } = "Nessun Commento";
		public string? meteo { get; set; } = "No";
		public string? commentiMeteo { get; set; } = "Nessun Commento";
		public string? mezzi { get; set; } = "No";
		public string? commentiAttrezzatureMezzi { get; set; } = "Nessun Commento";
		public string? risorseUmane { get; set; } = "No";
		public string? commentiRisorseUmane { get; set; } = "Nessun Commento";
		public int IdReport { get; set; } = 0;
		[ForeignKey("IdReport")]
		public ReportDiCantiere? ReportDiCantiere { get; set; }
		public void FixNulls()
		{
			if (commenti == null)
				commenti = "Nessun Commento";
			if (fornitori == null)
				fornitori = "No";
			if (commentiFornitori == null)
				commentiFornitori = "Nessun Commento";
			if (meteo == null)
				meteo = "No";
			if (commentiMeteo == null)
				commentiMeteo = "Nessun Commento";
			if (mezzi == null)
				mezzi = "No";
			if (commentiAttrezzatureMezzi == null)
				commentiAttrezzatureMezzi = "Nessun Commento";
			if (risorseUmane == null)
				risorseUmane = "No";
			if (commentiRisorseUmane == null)
				commentiRisorseUmane = "No";
		}
	}

	/// <summary>
	/// Ricordati che sarà da eliminare a parte
	/// </summary>
	public class DocumentsList
	{
		[Key]
		public int Id { get; set; }
		public int IdFileDiCantiere { get; set; }
		[ForeignKey("IdFileDiCantiere")]
		public ListaFileDiCantiere? FileDiCantiere { get; set; }
		public int IdReport { get; set; }
		[ForeignKey("IdReport")]
		public ReportDiCantiere? reportDiCantiere { get; set; }
		public string? type { get; set; }

	}
}
