using OfficeOpenXml.Style;
using OfficeOpenXml;
using System.Drawing;
using System.IO;
using System;
using CosiamAPI.Models;
using System.Collections.Generic;
using System.Linq;

namespace CosiamAPI.Controllers.PersonaleFolder
{
    public class PersonaleHelper
    {
        public byte[] ExportEstrazioneOreExcel(List<(string cantiere, DateTime date, string dayOfWeek, double ordinaryHours, double ordinaryCost, double extraordinaryHours, double extraordinaryCost, double travelHours, double travelCost, double totalCost, double absenceHours, string? absenceReasons, Personale personale)> data)
        {
            using (var memoryStream = new MemoryStream())
            {
                using (ExcelPackage p = new(memoryStream))
                {
                    // Aggiungere i fogli di lavoro
                    ExcelWorksheet sheet = p.Workbook.Worksheets.Add("Riepilogo");
                    int currentRowNumber = 1;
                    var headers = new[] { "Personale",  "Data", "Giorno", "Cantiere", "Ore Ordinarie", "Ore Straordinarie", "Ore Spostamento", "Costi Parziali", "Costo Totale", "Ore Assenza", "Motivazione" };
                    for (int i = 0; i < headers.Length; i++)
                    {
                        sheet.Cells[currentRowNumber, i + 1].Value = headers[i];
                    }

                    // Formattazione delle celle per le intestazioni
                    using (var range = sheet.Cells[currentRowNumber, 1, currentRowNumber, headers.Length])
                    {
                        range.Style.Font.Bold = true;
                    }

                    // Aggiungo i dati
                    //currentRow += numberRowsSummary;
                    currentRowNumber += 1;


                    foreach (var group in data.GroupBy(x => x.personale))
                    {
                        //#region riepilogo Dati Personale
                        //int numberRowsSummary = 5;
                        //int numberColumnsSummary = 4;

                        //sheet.Cells[currentRowNumber, 1].Value = $"{group.Key.Name} {group.Key.Surname}";
                        //sheet.Cells[currentRowNumber, 1].Style.Font.Bold = true;
                        //sheet.Cells[currentRowNumber, 3].Value = "Inquadramento";
                        //sheet.Cells[currentRowNumber + 1, 4].Value = ""; //TODO: inserire inquadramento
                        //sheet.Cells[currentRowNumber + 1, 3].Value = "Qualifica";
                        //sheet.Cells[currentRowNumber + 2, 4].Value = "";//TODO: inserire qualifica;
                        //sheet.Cells[currentRowNumber + 2, 3].Value = "Livello";
                        //sheet.Cells[currentRowNumber + 3, 4].Value = "";//TODO: inserire livello
                        //sheet.Cells[currentRowNumber + 3, 3].Value = "Tariffa Straord.";
                        //sheet.Cells[currentRowNumber + 3, 4].Value = $"{group.Key.extraordinaryPrice:#0.00}€/h";
                        //sheet.Cells[currentRowNumber + 4, 3].Value = "Caposquadra";
                        //sheet.Cells[currentRowNumber + 4, 4].Value = !string.IsNullOrWhiteSpace(group.Key.job) && group.Key.job.Contains("PM", StringComparison.CurrentCultureIgnoreCase) ? "Sì" : "No";

                        //// Definisci il range della tabella
                        //var tableRange = sheet.Cells[currentRowNumber, 1, currentRowNumber + numberRowsSummary - 1, numberColumnsSummary];

                        //// Applica i bordi alle celle
                        //tableRange.Style.Border.Top.Style = ExcelBorderStyle.Medium;
                        //tableRange.Style.Border.Bottom.Style = ExcelBorderStyle.Medium;
                        //tableRange.Style.Border.Left.Style = ExcelBorderStyle.Medium;
                        //tableRange.Style.Border.Right.Style = ExcelBorderStyle.Medium;

                        //// Imposta il colore dei bordi
                        //tableRange.Style.Border.Top.Color.SetColor(Color.Black);
                        //tableRange.Style.Border.Bottom.Color.SetColor(Color.Black);
                        //tableRange.Style.Border.Left.Color.SetColor(Color.Black);
                        //tableRange.Style.Border.Right.Color.SetColor(Color.Black);

                        //currentRowNumber += (numberRowsSummary + 1);
                        //currentRowNumber++;

                        //#endregion
                        // Impostare le intestazioni

                        foreach (var el in group)
                        {
                            // Aggiungere i dati al foglio Excel
                            sheet.Cells[currentRowNumber, 1].Value = $"{el.personale.Name} {el.personale.Surname}";
                            sheet.Cells[currentRowNumber, 2].Value = $"{el.date:dd/MM/yyyy}";
                            sheet.Cells[currentRowNumber, 3].Value = el.dayOfWeek;
                            sheet.Cells[currentRowNumber, 4].Value = el.cantiere;
                            sheet.Cells[currentRowNumber, 5].Value = el.ordinaryHours;
                            sheet.Cells[currentRowNumber, 6].Value = el.extraordinaryHours;
                            sheet.Cells[currentRowNumber, 7].Value = el.travelHours;
                            sheet.Cells[currentRowNumber, 8].Value = $"{el.ordinaryCost:#0.00}€ + {el.extraordinaryCost:#0.00}€ + {el.travelCost:#0.00}€";
                            sheet.Cells[currentRowNumber, 9].Value = el.totalCost;
                            sheet.Cells[currentRowNumber, 10].Value = el.absenceHours;
                            sheet.Cells[currentRowNumber, 11].Value = el.absenceReasons;


                            if (el.date.DayOfWeek == DayOfWeek.Saturday)
                            {
                                //TODO: colorare di grigio la riga del sabato
                                //sheet.Row(currentRow).Style.Fill.BackgroundColor=
                            }
                            currentRowNumber++;
                        }

                        // Convertire l'intervallo di celle in una tabella

                        //currentRowNumber += (group.Count() + 1);
                        //currentRowNumber += 1;
                    }

                    var tableRange = sheet.Cells[1, 1, currentRowNumber - 1, headers.Length];
                    var table = sheet.Tables.Add(tableRange, $"DettagliPersonale");
                    table.ShowTotal = false;
                    table.TableStyle = OfficeOpenXml.Table.TableStyles.Medium13;


                    // Applicare la formattazione delle celle per i costi
                    sheet.Cells[1, 9, currentRowNumber, 9].Style.Numberformat.Format = "€ #,##0.00";

                    // Auto-fit per le colonne

                    //sheet.Cells[sheet.Dimension.Address].AutoFitColumns();



                    // Salvare il file Excel
                    p.Save();
                    var file = memoryStream.ToArray();
                    //var path = @"C:\Users\finiz\Downloads\aaa.xlsx";
                    //System.IO.File.WriteAllBytes(path, file);
                    return file;
                }
            }
        }

    }
}
