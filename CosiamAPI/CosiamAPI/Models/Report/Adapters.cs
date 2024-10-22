using CosiamAPI.Data;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

#nullable enable
namespace CosiamAPI.Models.Report
{
	public struct PersonaleReportModel
	{
		public List<Personale> employees { get; set; }
		public List<double?>? extraordinaryCost { get; set; }
		public List<string?> extraordinaryHours { get; set; }
		public List<string?> hours { get; set; }
		public List<double?>? ordinaryCost { get; set; }
		public List<double?>? totalCost { get; set; }
		public List<string?> travelHours { get; set; }
		public List<double?>? travelHoursCost { get; set; }
		public List<string?>? extraordinaryAmount { get; set; }
		public List<string?>? ordinaryAmount { get; set; }
		public List<string?>? travelAmount { get; set; }
		public List<string?>? AbsenceHours { get; set; }
		public List<string?>? AbsenceReasons { get; set; }



		public List<TimeCard> TimeCardFrontEndModelToTimeCard(int idReport)
		{

			if (employees == null || employees.Count == 0)
				return new List<TimeCard>();

			List<TimeCard> tms = new();

			for (int i = 0; i < employees.Count; i++)
			{
				if (employees[i] == null)
					continue;
				// Prima di tutto controllo che il personale esista e le informazioni siano corrette
				var hour_i = string.IsNullOrEmpty(hours[i]) ? 0.0 : double.Parse(hours[i]!.Replace(".", ","), new CultureInfo("it-IT"));
				if (hour_i != 0)
				{
					TimeCard ordinary_tm = new(TimeCardsTypes.Ordinary, (double)hour_i, employees[i].Id, idReport, null, null);
					tms.Add(ordinary_tm);
				}
				var e_hour_i = string.IsNullOrEmpty(extraordinaryHours[i]) ? 0.0 : double.Parse(extraordinaryHours[i]!.Replace(".", ","), new CultureInfo("it-IT"));
				if (e_hour_i != 0)
				{
					TimeCard extraordinary_tm = new(TimeCardsTypes.ExtraOrdinary, e_hour_i, employees[i].Id, idReport, null, null);
					tms.Add(extraordinary_tm);
				}
				var t_hour_i = string.IsNullOrEmpty(travelHours[i]) ? 0.0 : double.Parse(travelHours[i]!.Replace(".", ","), new CultureInfo("it-IT"));
				if (t_hour_i != 0)
				{
					TimeCard travel_tm = new(TimeCardsTypes.Travel, t_hour_i, employees[i].Id, idReport, null, null);
					tms.Add(travel_tm);
				}
				var a_hour = string.IsNullOrEmpty(AbsenceHours[i]) ? 0.0 : double.Parse(AbsenceHours[i]!.Replace(".", ","), new CultureInfo("it-IT"));
				if (a_hour != 0)
				{
					TimeCard absence_tm = new(TimeCardsTypes.Absence, a_hour, employees[i].Id, idReport, null, null)
					{
						AbsenceReason = AbsenceReasons[i]
					};

					tms.Add(absence_tm);
				}



			}
			return tms;
		}

		public PersonaleReportModel(List<TimeCard> list)
		{
			this.employees = new List<Personale>();

			this.hours = new List<string?>();
			this.ordinaryAmount = new List<string?>();
			this.ordinaryCost = new List<double?>();

			this.travelHours = new List<string?>();
			this.travelHoursCost = new List<double?>();
			this.travelAmount = new List<string?>();

			this.extraordinaryHours = new List<string?>();
			this.extraordinaryAmount = new List<string?>();
			this.extraordinaryCost = new List<double?>();

			this.AbsenceHours = [];
			this.AbsenceReasons = [];


			this.totalCost = new List<double?>();
			//#region Stefano
			//for (int i = 0; i < list.Count; i++)
			//{
			//    TimeCard t = list[i];

			//    var p = t.Personale;
			//    if (p == null)
			//    {
			//        list.Remove(list[i]);  // If it's a null reference, it was wrong when it was passed
			//                               // SO we can remove it
			//        continue;   // Let's move to the next
			//    }
			//    this.employees.Add(p);

			//    double tCost = 0.0;

			//    for (int j = 0; j < list.Count; j++)
			//    {
			//        TimeCard t2 = list[j];
			//        if (t2 == null)
			//        {
			//            list.Remove(list[j]); // same as before
			//            continue;
			//        }

			//        if (t2.Personale!.Id == t.Personale!.Id)
			//        {
			//            if (t2.Type == TimeCardsTypes.Travel)
			//            {
			//                double travelPrice = (p.travelPrice == null ? 0.0 : (double)p.travelPrice);
			//                double travelAmount = travelPrice * t2.NumberOfHours;

			//                this.travelHours.Add(t2.NumberOfHours.ToString());
			//                this.travelHoursCost.Add(travelPrice);
			//                this.travelAmount.Add(travelAmount.ToString());

			//                tCost += travelAmount;

			//                list.Remove(t2);
			//                j--;
			//                continue;
			//            }

			//            if (t2.Type == TimeCardsTypes.Ordinary)
			//            {
			//                double ordinaryPrice = (p.ordinaryPrice == null ? 0.0 : (double)p.ordinaryPrice);
			//                double ordinaryAmount = ordinaryPrice * t2.NumberOfHours;

			//                this.hours.Add(t2.NumberOfHours.ToString());
			//                this.ordinaryCost.Add(ordinaryPrice);
			//                this.ordinaryAmount.Add(ordinaryAmount.ToString());

			//                tCost += ordinaryAmount;

			//                list.Remove(t2);
			//                j--;
			//                continue;
			//            }

			//            if (t2.Type == TimeCardsTypes.ExtraOrdinary)
			//            {
			//                double extraordinaryPrice = (p.extraordinaryPrice == null ? 0.0 : (double)p.extraordinaryPrice);
			//                double extraordinaryAmount = extraordinaryPrice * t2.NumberOfHours;

			//                this.extraordinaryHours.Add(t2.NumberOfHours.ToString());
			//                this.extraordinaryCost.Add(extraordinaryPrice);
			//                this.extraordinaryAmount.Add(extraordinaryAmount.ToString());

			//                tCost += extraordinaryAmount;

			//                list.Remove(t2);
			//                --j;
			//                continue;
			//            }
			//        }
			//    }
			//    this.totalCost.Add(tCost);
			//}
			//#endregion

			foreach (var timecardgroup in list.GroupBy(x => x.PersonaleId))
			{
				var personale = timecardgroup.First().Personale;
				var ordinaryHours = timecardgroup.SingleOrDefault(x => x.Type == TimeCardsTypes.Ordinary)?.NumberOfHours ?? 0;
				var extraordinaryHours = timecardgroup.SingleOrDefault(x => x.Type == TimeCardsTypes.ExtraOrdinary)?.NumberOfHours ?? 0;
				var travelHours = timecardgroup.SingleOrDefault(x => x.Type == TimeCardsTypes.Travel)?.NumberOfHours ?? 0;
				var absence = timecardgroup.SingleOrDefault(x => x.Type == TimeCardsTypes.Absence);
				var absenceHours = absence?.NumberOfHours ?? 0;
				var absenceReason = absence?.AbsenceReason;

				employees.Add(personale);

				ordinaryCost.Add(personale.ordinaryPrice);
				hours.Add(ordinaryHours.ToString());
				ordinaryAmount.Add(((personale.ordinaryPrice ?? 0) * ordinaryHours).ToString());

				extraordinaryCost.Add(personale.extraordinaryPrice);
				this.extraordinaryHours.Add(extraordinaryHours.ToString());
				this.extraordinaryAmount.Add(((personale.extraordinaryPrice ?? 0) * extraordinaryHours).ToString());

				travelHoursCost.Add(personale.travelPrice);
				this.travelHours.Add(travelHours.ToString());
				travelAmount.Add(((personale.travelPrice ?? 0) * travelHours).ToString());

				this.AbsenceHours.Add(absenceHours.ToString());
				this.AbsenceReasons.Add(absenceReason);

				totalCost.Add(((personale.ordinaryPrice ?? 0) * ordinaryHours) + ((personale.extraordinaryPrice ?? 0) * extraordinaryHours) + ((personale.travelPrice ?? 0) * travelHours));

			}
		}

		public PersonaleReportModel()
		{
			employees = new();
			extraordinaryCost = new();
			extraordinaryHours = new();
			hours = new();
			ordinaryCost = new();
			totalCost = new();
			travelHours = new();
			travelHoursCost = new();
			extraordinaryAmount = new();
			ordinaryAmount = new();
			travelAmount = new();
			AbsenceHours = [];
			AbsenceReasons = [];
		}

	}

	public struct VehiclesReportModel
	{
		public List<double?> costPerLiter { get; set; }
		public List<double?> dailyPrice { get; set; }
		public List<double?> fuelTotalPrice { get; set; }
		public List<double?> liters { get; set; }
		public List<double?> totalPrice { get; set; }
		public List<ListaMezziDiCantiere> vehicles { get; set; }

		public IEnumerable<VehicleCard> VehicleCardFrontendModelToVehicleCard(int idReport)
		{
			if (vehicles == null || vehicles.Count == 0)
				return new List<VehicleCard>();

			List<VehicleCard> vcs = new List<VehicleCard>();

			for (int i = 0; i < vehicles.Count; i++)
			{
				if (vehicles[i] == null)
					continue;

				double _costPerLiter = costPerLiter?[i] ?? 0.0;
				double _liters = liters?[i] ?? 0.0;

				VehicleCard vc = new VehicleCard(_liters, _costPerLiter, vehicles[i].Id, idReport, null);
				vcs.Add(vc);
			}
			return vcs;
		}

		public VehiclesReportModel(List<VehicleCard> list)
		{
			this.costPerLiter = new List<double?>();
			this.dailyPrice = new List<double?>();
			this.fuelTotalPrice = new List<double?>();
			this.liters = new List<double?>();
			this.totalPrice = new List<double?>();
			this.vehicles = new List<ListaMezziDiCantiere>();

			foreach (VehicleCard v in list)
			{
				if (v.Mezzo != null)
				{
					this.costPerLiter.Add(v.FuelCost);
					this.dailyPrice.Add(v.Mezzo.DailyCost);
					this.fuelTotalPrice.Add(v.FuelCost * v.LitersOfFuel);
					this.liters.Add(v.LitersOfFuel);
					this.totalPrice.Add(v.LitersOfFuel * v.FuelCost + v.Mezzo.DailyCost);

					var temp_lista_mezzi = new ListaMezziDiCantiere
					{
						Mezzo = v.Mezzo,
						IdMezzi = v.MezzoId
					};
					this.vehicles.Add(temp_lista_mezzi);
				}
			}
		}
	}


	public struct LavoriEseguitiReportModel
	{
		public List<string> activities { get; set; } //decription
		public List<string> category { get; set; }
		public List<ServizioCliente> prezziario { get; set; }
		public List<string?>? quantities { get; set; }
		public List<double?> EqualParts { get; set; }
		public List<double?> Lengths { get; set; }
		public List<double?> Widths { get; set; }
		public List<double?> Heights { get; set; }

		public List<double?> totalPrice { get; set; }
		public List<string> ums { get; set; }
		public List<double?> unitaryPrices { get; set; }
		public IEnumerable<ListOfServicesSoldToClient> ListaServiziClienteFrontEndModelToListOfServicesSoldToClient(int idReport)
		{
			if (prezziario == null || prezziario.Count == 0)
				return new List<ListOfServicesSoldToClient>();
			List<ListOfServicesSoldToClient> losstcs = new List<ListOfServicesSoldToClient>();
			for (int i = 0; i < prezziario.Count; i++)
			{
				if (prezziario[i] == null)
					continue;

				double _quantities;
				if (quantities == null || string.IsNullOrWhiteSpace(quantities[i]))
					_quantities = 0.0;
				else
					_quantities = Double.Parse(quantities[i]!.Replace(".", ","), new CultureInfo("it-IT"));

				double equalParts = EqualParts[i] ?? 1;

				ListOfServicesSoldToClient losstc = new ListOfServicesSoldToClient(_quantities, activities[i] == null ? "" : activities[i], prezziario[i].ID, idReport, equalParts, Lengths[i], Widths[i], Heights[i]);
				losstcs.Add(losstc);
			}
			return losstcs;
		}
		public LavoriEseguitiReportModel(List<ListOfServicesSoldToClient> list, ApplicationDbContext context)
		{

			this.activities = new List<string>();
			this.category = new List<string>();
			this.prezziario = new List<ServizioCliente>();
			this.quantities = new List<string?>();
			this.EqualParts = new List<double?>();
			this.Lengths = new List<double?>();
			this.Widths = new List<double?>();
			this.Heights = new List<double?>();
			this.totalPrice = new List<double?>();
			this.ums = new List<string>();
			this.unitaryPrices = new List<double?>();

			if (list is null || list.Count <= 0)
				return;

			double? percentageDiscount = context.PrezziarioCliente.Select(x => new { x.Id, x.DiscountPercentage }).Single(x => x.Id == list.First().servizioCliente.IdPrezziario)?.DiscountPercentage;

			foreach (ListOfServicesSoldToClient s in list)
			{
				if (s.servizioCliente != null)
				{  //No ServizioCliente No Party
					if (s.Description == null)
						s.Description = "";
					this.activities.Add(s.Description);
					this.category.Add(s.servizioCliente.Category);
					this.prezziario.Add(s.servizioCliente);
					this.quantities.Add(s.Quantity.ToString());
					this.EqualParts.Add(s.EqualParts);
					this.Lengths.Add(s.Length);
					this.Widths.Add(s.Width);
					this.Heights.Add(s.Height);

					this.ums.Add(s.servizioCliente.UM);
					//se c'è applico lo sconto
					if (s.servizioCliente.ApplyDiscount is true && percentageDiscount is not null)
					{
						var discountedPrice = s.servizioCliente.PricePerUm - (s.servizioCliente.PricePerUm * percentageDiscount / 100);
						this.unitaryPrices.Add(discountedPrice);
						this.totalPrice.Add(s.Quantity * discountedPrice);

					}
					else
					{
						this.unitaryPrices.Add(s.servizioCliente.PricePerUm);
						this.totalPrice.Add(s.Quantity * s.servizioCliente.PricePerUm);
					}
				}
			}
		}

		public IEnumerable<ListOfServicesSoldToClient> AdaptPriceForDiscount(IQueryable<ListOfServicesSoldToClient> services, ApplicationDbContext context)
		{
			if (!services.Any())
				return services;

			double? percentageDiscount = context.PrezziarioCliente.Select(x => new { x.Id, x.DiscountPercentage }).Single(x => x.Id == services.First().servizioCliente.IdPrezziario)?.DiscountPercentage;

			foreach (var s in services)
			{
				if (s.servizioCliente.ApplyDiscount is true && percentageDiscount is not null)
				{
					double discountedPrice = s.servizioCliente.PricePerUm - (s.servizioCliente.PricePerUm * percentageDiscount.Value / 100);
					s.servizioCliente.PricePerUm = discountedPrice;
					s.servizioCliente.ApplyDiscount = false;
				}

			}
			return services;
		}

	}

	public struct ProvvisteReportModel
	{
		public List<ServizioFornitore> descriptions { get; set; } //servizi pagati ai fornitori
		public List<string> quantities { get; set; }
		public List<Fornitori> suppliers { get; set; }
		public List<double?>? totalPrices { get; set; }
		public List<string> ums { get; set; }
		public List<double?> unitaryPrices { get; set; }
		public IEnumerable<ListOfGoodsAndServicesInUse> ListaServiziFornitoreFrontENdModelToListaServiziFornitoreFrontENdModel(int idReport)
		{
			if (suppliers == null || suppliers.Count() == 0)
				return new List<ListOfGoodsAndServicesInUse>();
			List<ListOfGoodsAndServicesInUse> logasius = new List<ListOfGoodsAndServicesInUse>();
			for (int i = 0; i < suppliers.Count(); i++)
			{
				if (suppliers[i] == null)
					continue;

				double _quantities;
				// Controllo se quantities è null o se l'elemento corrente è una stringa vuota o null
				if (quantities == null || string.IsNullOrWhiteSpace(quantities[i]))
					_quantities = 1.0; // Imposta 1.0 come valore di default se non definito
				else
					// Usa la cultura italiana per il parsing, considerando la virgola come separatore decimale
					_quantities = Double.Parse(quantities[i].Replace(".", ","), new CultureInfo("it-IT"));

				ListOfGoodsAndServicesInUse logasiu = new ListOfGoodsAndServicesInUse(_quantities, descriptions[i].Id, idReport, null);
				logasius.Add(logasiu);
			}
			return logasius;
		}

		public ProvvisteReportModel(List<ListOfGoodsAndServicesInUse> list)
		{
			this.descriptions = new List<ServizioFornitore>();
			this.quantities = new List<string>();
			this.suppliers = new List<Fornitori>();
			this.ums = new List<string>();
			this.totalPrices = new List<double?>();
			this.unitaryPrices = new List<double?>();
			foreach (ListOfGoodsAndServicesInUse s in list)
			{
				if (s != null)
				{
					if (s.ServizioFornitore != null)
					{
						this.descriptions.Add(s.ServizioFornitore);
						this.suppliers.Add(s.ServizioFornitore.Fornitore);
						this.ums.Add(s.ServizioFornitore.UM);
						this.totalPrices.Add(s.Quantity * s.ServizioFornitore.PricePerUM);
						this.unitaryPrices.Add(s.ServizioFornitore.PricePerUM);
						this.quantities.Add(s.Quantity.ToString());
					}
				}
			}
		}
	}

	public struct ReportModel
	{
		public PersonaleReportModel personale { get; set; }
		public VehiclesReportModel mezzi { get; set; }
		public LavoriEseguitiReportModel lavoriEseguiti { get; set; }
		public ProvvisteReportModel provviste { get; set; }
		public AllegatiEQuestionarioReportModel allegatiEQuestionario { get; set; }
		public string? Signature { get; set; }
		public string? Author { get; set; }
		public string? referenceDate { get; set; }
		public ReportStatus Status { get; set; }
		public DateTime? ApprovalDate { get; set; }
		public string? ApprovalAuthor { get; set; }
	}

}
