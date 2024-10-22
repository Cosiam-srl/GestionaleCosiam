using System;
using Microsoft.AspNetCore.Mvc;
using Rotativa.AspNetCore;
using System.Collections;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using OfficeOpenXml;
using CosiamAPI.Models;
using System.Linq;
using OfficeOpenXml.Style;
using System.Drawing;

namespace CosiamAPI.Reports
{

	public enum ReportsEnum
	{
		WorksiteReport,
		EstrazioneOrePersonaleReport,
		EstrazioneOreMezziReport
	}

	public class ReportGenerator
	{
		public Controller SrcController { get; set; }
		//
		// Constructor
		//
		public ReportGenerator(Controller srcController)
		{
			this.SrcController = srcController;
		}

		//
		// Methods
		//
		public async Task<string> generatePDF(ReportsEnum report, object model, string dstFilename)
		{
			// Retrieving report view path
			string reportView = retrieveReportView(report);
			// Generating ViewAsPdf using Rotativa
			ViewAsPdf pdf = new ViewAsPdf(reportView, model, viewData: SrcController.ViewData)
			{
				FileName = dstFilename,
				IsJavaScriptDisabled = false,
				PageOrientation = Rotativa.AspNetCore.Options.Orientation.Portrait,
				// CustomSwitches = "--enable-javascript --javascript-delay 1000 --no-stop-slow-scripts"
			};
			// Building PDF file from the View returned by Rotativa
			byte[] pdfData = await pdf.BuildFile(new ActionContext(SrcController.HttpContext, SrcController.RouteData, new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor(), SrcController.ModelState));
			// Writing file
			string fullPath = "Reports/" + pdf.FileName;
			using (var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write))
			{
				fileStream.Write(pdfData, 0, pdfData.Length);
			}

			return fullPath;
		}

		public async Task<string> generatePDF(ReportsEnum report, object model, string pathToFile, string dstFilename)
		{
			// Retrieving report view path
			string reportView = retrieveReportView(report);
			// Generating ViewAsPdf using Rotativa
			ViewAsPdf pdf = new ViewAsPdf(reportView, model, viewData: SrcController.ViewData)
			{
				FileName = dstFilename,
				IsJavaScriptDisabled = false,
				PageOrientation = Rotativa.AspNetCore.Options.Orientation.Landscape,
				// CustomSwitches = "--enable-javascript --javascript-delay 1000 --no-stop-slow-scripts"
			};
			// Building PDF file from the View returned by Rotativa
			byte[] pdfData = await pdf.BuildFile(new ActionContext(SrcController.HttpContext, SrcController.RouteData, new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor(), SrcController.ModelState));
			// Writing file
			string fullPath = Path.Combine(pathToFile, pdf.FileName);
			using (var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write))
			{
				fileStream.Write(pdfData, 0, pdfData.Length);
			}

			return fullPath;
		}

		public async Task<byte[]> GeneratePdfByteArray(ReportsEnum report, ReportDiCantiereViewModel model)
		{
			// Retrieving report view path
			string reportView = retrieveReportView(report);

			// Generating ViewAsPdf using Rotativa
			ViewAsPdf pdf = new(reportView, model, viewData: SrcController.ViewData)
			{
				IsJavaScriptDisabled = false,
				PageOrientation = Rotativa.AspNetCore.Options.Orientation.Portrait,
			};

			// Building PDF file from the View returned by Rotativa
			byte[] pdfData = await pdf.BuildFile(new ActionContext(SrcController.HttpContext, SrcController.RouteData, new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor(), SrcController.ModelState));

			return pdfData;
		}

		private static string retrieveReportView(ReportsEnum report)
		{
			string reportView;
			switch (report)
			{
				case ReportsEnum.WorksiteReport:
					reportView = "~/Views/Reports/WorksiteReport.cshtml";
					break;

				case ReportsEnum.EstrazioneOrePersonaleReport:
					reportView = "~/Views/Reports/DettaglioOrePersonaleReport.cshtml";
					break;
				case ReportsEnum.EstrazioneOreMezziReport:
					reportView = "~/Views/Reports/DettaglioOreMezziReport.cshtml";
					break;
				default:
					throw new ArgumentException("report requested doesn't have a linked view", "report");
			}

			return reportView;
		}

		public byte[] ExportExcel(ReportDiCantiereViewModel model, IEnumerable<IGrouping<int, object>> details)
		{
			using (var memoryStream = new MemoryStream())
			{
				using (ExcelPackage p = new ExcelPackage(memoryStream))
				{
					// Aggiungere i fogli di lavoro
					ExcelWorksheet riepilogoSheet = p.Workbook.Worksheets.Add("Riepilogo");
					ExcelWorksheet personaleSheet = p.Workbook.Worksheets.Add("Manodopera");
					ExcelWorksheet mezziSheet = p.Workbook.Worksheets.Add("Mezzi e Attrezzature");
					ExcelWorksheet serviziEsterniSheet = p.Workbook.Worksheets.Add("Materiali - Noli - Servizi Esterni");
					ExcelWorksheet serviziVendutiSheet = p.Workbook.Worksheets.Add("Attività di ricavo");
					ExcelWorksheet dettagliPersonaleSheet = p.Workbook.Worksheets.Add("Dettagli Personale");
					ExcelWorksheet dettagliMezziSheet = p.Workbook.Worksheets.Add("Dettagli Mezzi");





					// Calcola i totali e popola i fogli di lavoro
					decimal totalePersonale = AggiungiDatiPersonale(personaleSheet, model);
					decimal totaleMezzi = AggiungiDatiMezzi(mezziSheet, model);
					decimal totaleServiziEsterni = AggiungiDatiServiziEsterni(serviziEsterniSheet, model);
					decimal totaleVenduto = AggiungiDatiServiziVenduti(serviziVendutiSheet, model);
					decimal totaleFinale = totaleMezzi + totalePersonale + totaleServiziEsterni;
					AggiungiDettagliPersonale(dettagliPersonaleSheet, details.OfType<IGrouping<int, TimeCard>>());
					AggiungiDettagliMezzo(dettagliMezziSheet, details.OfType<IGrouping<int, VehicleCard>>());
					// Aggiungi i dati al foglio di riepilogo
					AggiungiDatiRiepilogo(riepilogoSheet, model, totaleVenduto, totaleFinale);

					// Salvare il file Excel
					p.Save();
				}

				// Restituire il file Excel come array di byte
				return memoryStream.ToArray();
			}
		}

		private static void AggiungiDettagliMezzo(ExcelWorksheet sheet, IEnumerable<IGrouping<int, VehicleCard>> details)
		{
			if (!details.Any())
				return;
			// Impostare le intestazioni
			var headers = new[] { "Descrizione", "Costo GG", "Litri Gasolio", "Costo Mezzo", "Costo Carburante", "Costo tot." };
			for (int i = 0; i < headers.Length; i++)
			{
				sheet.Cells[1, i + 1].Value = headers[i];
			}

			// Formattazione delle celle per le intestazioni
			using (var range = sheet.Cells[1, 1, 1, headers.Length])
			{
				range.Style.Font.Bold = true;
			}

			int currentRow = 2;
			foreach (var reportGroup in details)
			{
				sheet.Cells[currentRow, 1].Value = $"Report #{reportGroup.First().ReportDiCantiere?.Counter} - {reportGroup.First().ReportDiCantiere.referenceDate:dd/MM/yyyy}";
				using (var range = sheet.Cells[currentRow, 1, currentRow, 1])
				{
					range.Style.Font.Bold = true;
					range.Style.Font.Italic = true;
				}
				currentRow++;
				//data.key è l'id del report
				foreach (var vc in reportGroup.GroupBy(x => x.MezzoId))
				{
					var p = vc.First();
					sheet.Cells[currentRow, 1].Value = $"{p.Mezzo.Description} {p.Mezzo.Brand} {p.Mezzo.LicensePlate}";
					sheet.Cells[currentRow, 2].Value = p.Mezzo.DailyCost;
					sheet.Cells[currentRow, 3].Value = p.LitersOfFuel;

					decimal p_fuel_cost = Math.Round((decimal)(p.LitersOfFuel * p.FuelCost), 2);
					decimal p_daily_cost = Math.Round((decimal)(p.Mezzo.DailyCost * (p.NumberOfHoursOfUsage ?? 1)), 2);
					decimal p_total_cost = p_fuel_cost + p_daily_cost;
					sheet.Cells[currentRow, 4].Value = p_daily_cost;
					sheet.Cells[currentRow, 5].Value = p_fuel_cost;
					sheet.Cells[currentRow, 6].Value = p_total_cost;
					currentRow++;
				}
			}
			// Applicare la formattazione delle celle per i costi
			sheet.Cells[2, 2, currentRow, 2].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 4, currentRow, 4].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 5, currentRow, 5].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 6, currentRow, 6].Style.Numberformat.Format = "€ #,##0.00";

			// Auto-fit per le colonne
			//sheet.Cells[sheet.Dimension.Address].AutoFitColumns();
		}

		public static void AggiungiDettagliPersonale(ExcelWorksheet sheet, IEnumerable<IGrouping<int, TimeCard>> details)
		{

			if (!details.Any())
				return;
			// Impostare le intestazioni
			var headers = new[] { "Nome e Cognome", "Ore Normali", "Costo Ore Normali", "Ore Straordinarie", "Costo Ore Straordinarie", "Ore Spostamento", "Costo Ore Spostamento", "Totale Ore", "Costo Totale" };
			for (int i = 0; i < headers.Length; i++)
			{
				sheet.Cells[1, i + 1].Value = headers[i];
			}
			// Formattazione delle celle per le intestazioni
			using (var range = sheet.Cells[1, 1, 1, headers.Length])
			{
				range.Style.Font.Bold = true;
			}

			int currentRow = 2;
			foreach (var reportGroup in details)
			{
				sheet.Cells[currentRow, 1].Value = $"Report #{reportGroup.First().ReportDiCantiere?.Counter} - {reportGroup.First().ReportDiCantiere.referenceDate:dd/MM/yyyy}";
				using (var range = sheet.Cells[currentRow, 1, currentRow, 1])
				{
					range.Style.Font.Bold = true;
					range.Style.Font.Italic = true;
				}
				currentRow++;
				//data.key è l'id del report
				foreach (var tc in reportGroup.GroupBy(x => x.PersonaleId))
				{
					//tc.key è l'idPersonale
					sheet.Cells[currentRow, 1].Value = $"{tc.First().Personale.Name} {tc.First().Personale.Surname}";

					double oreOrdinarie = tc.SingleOrDefault(x => x.Type == TimeCardsTypes.Ordinary)?.NumberOfHours ?? 0.0;
					double oreStraordinarie = tc.SingleOrDefault(x => x.Type == TimeCardsTypes.ExtraOrdinary)?.NumberOfHours ?? 0.0;
					double oreSpostamento = tc.SingleOrDefault(x => x.Type == TimeCardsTypes.Travel)?.NumberOfHours ?? 0.0;

					var TotaleOrdinario = Math.Round((decimal)(oreOrdinarie * (tc.First().Personale.ordinaryPrice ?? 0.0)), 2);
					var TotaleStraordinario = Math.Round((decimal)(oreStraordinarie * (tc.First().Personale.extraordinaryPrice ?? 0.0)), 2);
					var TotaleSpostamento = Math.Round((decimal)(oreSpostamento * (tc.First().Personale.travelPrice ?? 0.0)), 2);

					decimal Totale = TotaleOrdinario + TotaleStraordinario + TotaleSpostamento;

					sheet.Cells[currentRow, 2].Value = oreOrdinarie;
					sheet.Cells[currentRow, 3].Value = tc.First().Personale.ordinaryPrice ?? 0.0;
					sheet.Cells[currentRow, 4].Value = oreStraordinarie;
					sheet.Cells[currentRow, 5].Value = tc.First().Personale.extraordinaryPrice ?? 0.0;
					sheet.Cells[currentRow, 6].Value = oreSpostamento;
					sheet.Cells[currentRow, 7].Value = tc.First().Personale.travelPrice ?? 0.0;
					sheet.Cells[currentRow, 8].Value = oreOrdinarie + oreSpostamento + oreStraordinarie;
					sheet.Cells[currentRow, 9].Value = TotaleOrdinario + TotaleSpostamento + TotaleStraordinario;
					currentRow++;
				}
			}
			// Applicare la formattazione delle celle per i costi
			sheet.Cells[2, 3, currentRow, 3].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 5, currentRow, 5].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 7, currentRow, 7].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 9, currentRow, 9].Style.Numberformat.Format = "€ #,##0.00";

			// Auto-fit per le colonne
			//sheet.Cells[sheet.Dimension.Address].AutoFitColumns();

		}

		private static decimal AggiungiDatiPersonale(ExcelWorksheet sheet, ReportDiCantiereViewModel model)
		{
			// Impostare le intestazioni
			var headers = new[] { "Nome e Cognome", "Qualifica", "Ore Normali", "Costo Ore Normali", "Ore Straordinarie", "Costo Ore Straordinarie", "Ore Spostamento", "Costo Ore Spostamento", "Totale Ore", "Costo Totale" };
			for (int i = 0; i < headers.Length; i++)
			{
				sheet.Cells[1, i + 1].Value = headers[i];
			}

			// Formattazione delle celle per le intestazioni
			using (var range = sheet.Cells[1, 1, 1, headers.Length])
			{
				range.Style.Font.Bold = true;
			}

			// Aggiungere i dati
			decimal parziale = 0;
			int currentRow = 2;
			foreach (var p in model.oreNormali)
			{
				double OreNormali = p.NumberOfHours;
				double OreStraordinarie = model.OreStraordinarie.SingleOrDefault(x => x.PersonaleId == p.PersonaleId)?.NumberOfHours ?? 0.0;
				double OreSpostamento = model.OreSpostamento.SingleOrDefault(x => x.PersonaleId == p.PersonaleId)?.NumberOfHours ?? 0.0;

				var TotaleOrdinario = Math.Round((decimal)(OreNormali * (p.Personale.ordinaryPrice ?? 0.0)), 2);
				var TotaleStraordinario = Math.Round((decimal)(OreStraordinarie * (p.Personale.extraordinaryPrice ?? 0.0)), 2);
				var TotaleSpostamento = Math.Round((decimal)(OreSpostamento * (p.Personale.travelPrice ?? 0.0)), 2);

				decimal Totale = TotaleOrdinario + TotaleStraordinario + TotaleSpostamento;
				parziale += Totale;

				// Aggiungere i dati al foglio Excel
				sheet.Cells[currentRow, 1].Value = $"{p.Personale.Name} {p.Personale.Surname}";
				sheet.Cells[currentRow, 2].Value = p.Personale.job;
				sheet.Cells[currentRow, 3].Value = OreNormali;
				sheet.Cells[currentRow, 4].Value = TotaleOrdinario;
				sheet.Cells[currentRow, 5].Value = OreStraordinarie;
				sheet.Cells[currentRow, 6].Value = TotaleStraordinario;
				sheet.Cells[currentRow, 7].Value = OreSpostamento;
				sheet.Cells[currentRow, 8].Value = TotaleSpostamento;
				sheet.Cells[currentRow, 9].Value = OreNormali + OreStraordinarie + OreSpostamento;
				sheet.Cells[currentRow, 10].Value = Totale;
				currentRow++;
			}

			// Convertire l'intervallo di celle in una tabella
			var tableRange = sheet.Cells[1, 1, currentRow - 1, headers.Length];
			var table = sheet.Tables.Add(tableRange, "PersonaleTable");
			table.ShowTotal = true;
			table.TableStyle = OfficeOpenXml.Table.TableStyles.Medium13;

			// Impostare il tipo di totale per ciascuna colonna
			table.Columns[2].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;
			table.Columns[3].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;
			table.Columns[4].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;
			table.Columns[5].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;
			table.Columns[6].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;
			table.Columns[7].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;
			table.Columns[8].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;
			table.Columns[9].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;

			// Applicare la formattazione delle celle per i costi
			sheet.Cells[2, 4, currentRow, 4].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 6, currentRow, 6].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 8, currentRow, 8].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 10, currentRow, 10].Style.Numberformat.Format = "€ #,##0.00";

			// Auto-fit per le colonne
			//sheet.Cells[sheet.Dimension.Address].AutoFitColumns();

			// Calcola il totale finale
			decimal totalePersonale = sheet.Cells[2, 10, currentRow - 1, 10].Sum(c => c.GetValue<decimal>());

			// Restituisci il totale
			return totalePersonale;
		}
		private static decimal AggiungiDatiMezzi(ExcelWorksheet sheet, ReportDiCantiereViewModel model)
		{
			// Impostare le intestazioni
			var headers = new[] { "Descrizione", "Costo GG", "Litri Gasolio", "Costo Mezzo", "Costo Carburante", "Costo tot." };
			for (int i = 0; i < headers.Length; i++)
			{
				sheet.Cells[1, i + 1].Value = headers[i];
			}

			// Formattazione delle celle per le intestazioni
			using (var range = sheet.Cells[1, 1, 1, headers.Length])
			{
				range.Style.Font.Bold = true;
			}

			// Aggiungere i dati
			int currentRow = 2;
			foreach (var p in model.VehiclesStuff)
			{
				decimal p_fuel_cost = Math.Round((decimal)(p.LitersOfFuel * p.FuelCost), 2);
				decimal p_daily_cost = Math.Round((decimal)(p.Mezzo.DailyCost * p.NumberOfHoursOfUsage), 2);
				decimal p_total_cost = p_fuel_cost + p_daily_cost;

				// Aggiungere i dati al foglio Excel
				sheet.Cells[currentRow, 1].Value = $"{p.Mezzo.Description} {p.Mezzo.Brand} {p.Mezzo.LicensePlate}";
				sheet.Cells[currentRow, 2].Value = p.Mezzo.DailyCost;
				sheet.Cells[currentRow, 3].Value = p.LitersOfFuel;
				sheet.Cells[currentRow, 4].Value = p_daily_cost;
				sheet.Cells[currentRow, 5].Value = p_fuel_cost;
				sheet.Cells[currentRow, 6].Value = p_total_cost;

				currentRow++;
			}

			// Convertire l'intervallo di celle in una tabella
			var tableRange = sheet.Cells[1, 1, currentRow - 1, headers.Length];
			var table = sheet.Tables.Add(tableRange, "MezziTable");
			table.ShowTotal = true;
			table.TableStyle = OfficeOpenXml.Table.TableStyles.Medium13;

			// Impostare il tipo di totale per ciascuna colonna
			table.Columns[1].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;
			table.Columns[2].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;
			table.Columns[3].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;
			table.Columns[4].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;
			table.Columns[5].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;

			// Applicare la formattazione delle celle per i costi
			sheet.Cells[2, 2, currentRow, 2].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 4, currentRow, 4].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 5, currentRow, 5].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 6, currentRow, 6].Style.Numberformat.Format = "€ #,##0.00";

			// Auto-fit per le colonne
			//sheet.Cells[sheet.Dimension.Address].AutoFitColumns();

			// Calcola il totale finale
			decimal totaleMezzi = sheet.Cells[2, 6, currentRow - 1, 6].Sum(c => c.GetValue<decimal>());

			// Restituisci il totale
			return totaleMezzi;
		}
		private static decimal AggiungiDatiServiziEsterni(ExcelWorksheet sheet, ReportDiCantiereViewModel model)
		{
			// Impostare le intestazioni
			var headers = new[] { "Descrizione", "Fornitore", "Qtà", "U.M.", "P.U.", "Costo tot." };
			for (int i = 0; i < headers.Length; i++)
			{
				sheet.Cells[1, i + 1].Value = headers[i];
			}

			// Formattazione delle celle per le intestazioni
			using (var range = sheet.Cells[1, 1, 1, headers.Length])
			{
				range.Style.Font.Bold = true;
			}

			// Aggiungere i dati
			decimal parziale = 0;
			int currentRow = 2;
			foreach (var p in model.Provviste)
			{
				decimal Totale = Math.Round((decimal)(p.ServizioFornitore.PricePerUM * p.Quantity), 2);
				parziale += Totale;

				// Aggiungere i dati al foglio Excel
				sheet.Cells[currentRow, 1].Value = p.ServizioFornitore.Description;
				sheet.Cells[currentRow, 2].Value = p.ServizioFornitore.Fornitore.Name;
				sheet.Cells[currentRow, 3].Value = p.Quantity;
				sheet.Cells[currentRow, 4].Value = p.ServizioFornitore.UM;
				sheet.Cells[currentRow, 5].Value = p.ServizioFornitore.PricePerUM;
				sheet.Cells[currentRow, 6].Value = Totale;

				currentRow++;
			}

			// Convertire l'intervallo di celle in una tabella
			var tableRange = sheet.Cells[1, 1, currentRow - 1, headers.Length];
			var table = sheet.Tables.Add(tableRange, "ServiziEsterniTable");
			table.ShowTotal = true;
			table.TableStyle = OfficeOpenXml.Table.TableStyles.Medium13;

			// Impostare il tipo di totale per ciascuna colonna
			table.Columns[2].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;
			table.Columns[5].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum;

			// Applicare la formattazione delle celle per i costi
			sheet.Cells[2, 5, currentRow, 5].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 6, currentRow, 6].Style.Numberformat.Format = "€ #,##0.00";

			// Auto-fit per le colonne
			//sheet.Cells[sheet.Dimension.Address].AutoFitColumns();

			// Calcola il totale finale
			decimal totaleServiziEsterni = sheet.Cells[2, 6, currentRow - 1, 6].Sum(c => c.GetValue<decimal>());

			// Restituisci il totale
			return totaleServiziEsterni;
		}
		private static decimal AggiungiDatiServiziVenduti(ExcelWorksheet sheet, ReportDiCantiereViewModel model)
		{
			// Impostare le intestazioni
			var headers = new[] { "Rif. Prezzario", "Descrizione attività", "Par.Ug", "Lunghezza", "Larghezza", "H/Peso", "Qnt.", "U.M.", "P.U.", "Ricavo tot." };
			for (int i = 0; i < headers.Length; i++)
			{
				sheet.Cells[1, i + 1].Value = headers[i];
			}

			// Formattazione delle celle per le intestazioni
			using (var range = sheet.Cells[1, 1, 1, headers.Length])
			{
				range.Style.Font.Bold = true;
			}

			// Aggiungere i dati
			decimal parziale = 0;
			int currentRow = 2;
			foreach (var p in model.LavoriEseguiti)
			{
				decimal Totale = Math.Round((decimal)(p.servizioCliente.PricePerUm * p.Quantity), 2);
				parziale += Totale;

				// Aggiungere i dati al foglio Excel
				sheet.Cells[currentRow, 1].Value = p.Description;
				sheet.Cells[currentRow, 2].Value = p.servizioCliente.rateCode;
				sheet.Cells[currentRow, 3].Value = p.EqualParts;
				sheet.Cells[currentRow, 4].Value = p.Length;
				sheet.Cells[currentRow, 5].Value = p.Width;
				sheet.Cells[currentRow, 6].Value = p.Height;
				sheet.Cells[currentRow, 7].Value = p.Quantity;
				sheet.Cells[currentRow, 8].Value = p.servizioCliente.UM;
				sheet.Cells[currentRow, 9].Value = p.servizioCliente.PricePerUm;
				sheet.Cells[currentRow, 10].Value = Totale;
				currentRow++;
			}

			// Convertire l'intervallo di celle in una tabella
			var tableRange = sheet.Cells[1, 1, currentRow - 1, headers.Length];
			var table = sheet.Tables.Add(tableRange, "ServiziVendutiTable");
			table.ShowTotal = true;
			table.TableStyle = OfficeOpenXml.Table.TableStyles.Medium13;

			// Impostare il tipo di totale per ciascuna colonna
			table.Columns[2].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum; // Colonna "Parti Uguali"
			table.Columns[3].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum; // Colonna "Lunghezza"
			table.Columns[4].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum; // Colonna "Larghezza"
			table.Columns[5].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum; // Colonna "H/Peso"
			table.Columns[6].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum; // Colonna "Qta"
			table.Columns[9].TotalsRowFunction = OfficeOpenXml.Table.RowFunctions.Sum; // Colonna "Totale"



			// Applicare la formattazione delle celle per i costi
			sheet.Cells[2, 9, currentRow, 9].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 10, currentRow, 10].Style.Numberformat.Format = "€ #,##0.00";

			// Applicare l'auto-fit alle colonne
			//sheet.Cells[sheet.Dimension.Address].AutoFitColumns();

			// Calcola il totale finale
			decimal totaleServiziVenduti = sheet.Cells[2, 10, currentRow - 1, 10].Sum(c => c.GetValue<decimal>());
			if (model.mostraRicavi.HasValue && !model.mostraRicavi.Value)
			{
				//nascondo le colonne del PU e del totale
				sheet.DeleteColumn(10);
				sheet.DeleteColumn(9);
			}

			//elimino le colonne non piu necessarie della lunghezza, larghezza H/Peso e parti uguali
			//L'EXPORT IN EXCEL NON ESISTE PER IL REPORT SINGOLO
			if (!model.ReportSingolo)
			{
				sheet.DeleteColumn(6);
				sheet.DeleteColumn(5);
				sheet.DeleteColumn(4);
				sheet.DeleteColumn(3);
			}

			// Restituisci il totale
			return totaleServiziVenduti;
		}
		private static void AggiungiDatiRiepilogo(ExcelWorksheet sheet, ReportDiCantiereViewModel model, decimal totaleVenduto, decimal totaleFinale)
		{
			double percentualeSpeseGenerali = model.Cantiere.percentualeSpeseGenerali;
			decimal speseGenerali = Math.Round((totaleVenduto * (decimal)percentualeSpeseGenerali) / 100, 2);
			decimal margine = totaleVenduto - totaleFinale - speseGenerali;
			decimal marginePercentuale = totaleVenduto == 0 ? 0 : margine / totaleVenduto;

			// Impostare le intestazioni
			var headers = new[] { "Tot. Ricavo", "Tot. Costi", "Spese Generali", "Margine lordo Ass.", "Margine lordo %" };
			for (int i = 0; i < headers.Length; i++)
			{
				sheet.Cells[1, i + 1].Value = headers[i];
			}

			// Impostare i dati
			sheet.Cells[2, 1].Value = totaleVenduto;
			sheet.Cells[2, 2].Value = totaleFinale;
			sheet.Cells[2, 3].Value = speseGenerali;
			sheet.Cells[2, 4].Value = margine;
			sheet.Cells[2, 5].Value = marginePercentuale;

			// Formattazione delle celle
			using (var range = sheet.Cells[1, 1, 2, headers.Length])
			{
				range.Style.Font.Bold = true;
				range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
				range.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
			}

			// Applicare la formattazione delle celle per i costi
			sheet.Cells[2, 1, 2, 3].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 4, 2, 4].Style.Numberformat.Format = "€ #,##0.00";
			sheet.Cells[2, 5].Style.Numberformat.Format = "0.00 %";

			// Impostare i colori di sfondo
			sheet.Cells[1, 1, 2, 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
			sheet.Cells[1, 1, 2, 1].Style.Fill.BackgroundColor.SetColor(ColorTranslator.FromHtml("#dceddd"));

			sheet.Cells[1, 2, 2, 3].Style.Fill.PatternType = ExcelFillStyle.Solid;
			sheet.Cells[1, 2, 2, 3].Style.Fill.BackgroundColor.SetColor(ColorTranslator.FromHtml("#ffbfaa"));

			// Applicare l'auto-fit alle colonne
			//sheet.Cells[sheet.Dimension.Address].AutoFitColumns();
		}

	}
}
