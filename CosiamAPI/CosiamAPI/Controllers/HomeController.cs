using CosiamAPI.Common;
using CosiamAPI.Data;
using CosiamAPI.Models;
using CosiamAPI.Models.Report;
using CosiamAPI.Reports;
using JWTAuthentication.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Rotativa.AspNetCore;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace CosiamAPI.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        public HomeController(ILogger<HomeController> logger, IConfiguration configuration, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
            _config = configuration;
        }

        public IActionResult Index()
        {
            return View();
        }

        #region reports
        [HttpGet("home/PrintIndex/{reportID}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
        public async Task<IActionResult> PrintIndex([FromRoute] int reportID)
        {
            var report = this._context.ReportDiCantiere
                .Include(x => x.Cantiere)
                .Include(x => x.Cantiere.Contratto)
                .Include(x => x.Cantiere.Contratto.Cliente)
                .Single(x => x.Id == reportID);
            var model = new ReportDiCantiereViewModel
            {
                Author = report.Author,
                Id = reportID,
                Cantiere = report.Cantiere,
                date = report.referenceDate,
                ReportSingolo=true,

                oreNormali = await _context.TimeCard
                                                .Where(t => t.IdReport == reportID).Where(t => t.Type == TimeCardsTypes.Ordinary)
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
                                                    .ToArrayAsync(),
                OreStraordinarie = await _context.TimeCard
                                                    .Where(t => t.IdReport == reportID).Where(t => t.Type == TimeCardsTypes.ExtraOrdinary)
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
                                                    .ToArrayAsync(),
                OreSpostamento = await _context.TimeCard
                                                    .Where(t => t.IdReport == reportID).Where(t => t.Type == TimeCardsTypes.Travel)
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
                                                    .ToArrayAsync(),

                VehiclesStuff = await _context.VehicleCard.Include(m => m.Mezzo).Where(t => t.IdReport == reportID).ToArrayAsync(),

                LavoriEseguiti = new LavoriEseguitiReportModel().AdaptPriceForDiscount(_context.ListOfServicesSoldToClient.Where(t => t.IdReport == reportID).Include(s => s.servizioCliente), _context).ToArray(),

                Provviste = await _context.ListOfGoodsAndServicesInUse.Where(t => t.IdReport == reportID).Include(s => s.ServizioFornitore).Include(f => f.ServizioFornitore.Fornitore).ToArrayAsync(),
                //Questionario = await _context.AllegatiEQuestionarioReportModel.SingleAsync(q => q.IdReport == reportID),

                Immagini = await _context.DocumentsList.Include(f => f.FileDiCantiere).Where(t => t.IdReport == reportID).Include(f => f.FileDiCantiere.File).Where(f => f.FileDiCantiere.File.Type.Contains("image")).ToArrayAsync(),
                file_base_path = _config["folderPath"],

                Sign = (await _context.ReportDiCantiere.SingleAsync(x => x.Id == reportID)).Sign,

                ProgressivoContatore = report.Counter
            };
            //NEL REPORT NORMALE NON STAMPO I DETTAGLI DELLE ORE PERSONALE E MEZZI
            //var details = await GetDataForDetails(model.Cantiere.Id, model.date, model.date);
            //model.Details = details;

            string filename = Guid.NewGuid().ToString() + ".pdf";
            var rg = new ReportGenerator(this);
            string pathToFile = await rg.generatePDF(ReportsEnum.WorksiteReport, model, filename);
            return File(System.IO.File.ReadAllBytes(pathToFile), "application/pdf");
        }

        [HttpPost("home/GenerateSommaReport")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
        public async Task<IActionResult> GenerateSommaReport([FromBody] ReportDiCantiereViewModel model, [FromQuery] string exportType)
        {
            //if (model.Equals(default(ReportDiCantiereViewModel)))
            //{
            //    return BadRequest("Invalid model.");
            //}

            var rg = new ReportGenerator(this);


            // Se la data di inizio e' la standart "01/01/1900" mettere come data inizio la data di inizio del cantiere
            if (model.date.Split(" - ")[0] == "01/01/1900")
            {
                string DataInizio = model.Cantiere.Start.ToString("dd/MM/yyyy");
                model.date = DataInizio + " - " + model.date.Split(" - ")[1];
            }

            var details = await GetDataForDetails(model.Cantiere.Id, model.date.Split(" - ")[0], model.date.Split(" - ")[1]);
            if (exportType.Contains("pdf", StringComparison.InvariantCultureIgnoreCase))
            {
                model.Details = details;
                var pdfData = await rg.GeneratePdfByteArray(ReportsEnum.WorksiteReport, model);
                return File(pdfData, "application/pdf");
            }
            else if (exportType.Contains("xlsx", StringComparison.InvariantCultureIgnoreCase))
            {
                var file = rg.ExportExcel(model, details);
                return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            }

            return BadRequest("Tipo di file specificato per l'export non valido");
        }

        /// <summary>
        /// Scarica le info necessarie per inserire i dati dettagliati del personale e dei mezzi nel report (report per report)
        /// </summary>
        /// <param name="idCantiere"></param>
        /// <param name="dataFrom"></param>
        /// <param name="dataTo"></param>
        /// <returns></returns>
        private async Task<IEnumerable<IGrouping<int, object>>> GetDataForDetails(int idCantiere, string? dataFrom, string? dataTo)
        {
            if (!string.IsNullOrWhiteSpace(dataFrom))
                dataFrom = DateTime.Parse(dataFrom).ToString("yyyy-MM-dd");
            if (!string.IsNullOrWhiteSpace(dataTo))
                dataTo = DateTime.Parse(dataTo).ToString("yyyy-MM-dd");

            var reports = ReportUtils.GetReportsBetweenDates(_context, idCantiere, dataFrom, dataTo).ToDictionary(x => x.Id);

            Task<IEnumerable<IGrouping<int, TimeCard>>> t1 = GetPersonaleReportDetails(reports, dataFrom, dataTo);
            Task<IEnumerable<IGrouping<int, VehicleCard>>> t2 = GetMezziReportDetails(reports, dataFrom, dataTo);

            await Task.WhenAll(t1, t2);

            var l = new List<IGrouping<int, object>>();
            l.AddRange(t1.Result);
            l.AddRange(t2.Result);
            return l;

        }
        /// <summary>
        /// Scarica i dati dettagliati dei mezzi
        /// </summary>
        /// <param name="reports"> Insieme dei report di cui scaricare i dati</param>
        /// <param name="dataFrom"></param>
        /// <param name="dataTo"></param>
        /// <returns></returns>
        private async Task<IEnumerable<IGrouping<int, VehicleCard>>> GetMezziReportDetails(Dictionary<int, ReportDiCantiere> reports, string dataFrom, string dataTo)
        {
            //creata una nuova istanza del dbContext per lavorare in parallelo nella funzione chiamante
            var context = new ApplicationDbContext();
            var idReports = reports.Keys;

            var p = await context.VehicleCard.AsNoTracking()
                 .Where(x => idReports.Contains(x.IdReport))
                 .Include(x => x.Mezzo)
                 /*.Include(x => x.ReportDiCantiere)*/ //TODO: la firma del report appesantisce enormemente la chiamata ed è inutile in questo caso
                 .ToArrayAsync();

            foreach (var vc in p)
                vc.ReportDiCantiere = reports[vc.IdReport];

            return p.GroupBy(x => x.IdReport).ToList();
        }
        /// <summary>
        /// Scarica i dati dettagliati del personale
        /// </summary>
        /// <param name="reports"> Insieme dei report di cui scaricare i dati</param>
        /// <param name="dataFrom"></param>
        /// <param name="dataTo"></param>
        /// <returns></returns>
        private static async Task<IEnumerable<IGrouping<int, TimeCard>>> GetPersonaleReportDetails(Dictionary<int, ReportDiCantiere> reports, string dataFrom, string dataTo)
        {
            //creata una nuova istanza del dbContext per lavorare in parallelo nella funzione chiamante
            var context = new ApplicationDbContext();
            var idReports = reports.Keys;

            //TODO: come lavorare se mancano le date di beginning e di ending??
            TimeCard[] p = await context.TimeCard.AsNoTracking()
                .Where(x => idReports.Contains(x.IdReport) /*&& x.BeginningDate != null && x.EndDate != null*/)
                .Include(x => x.Personale) //TODO: il Personale appesantisce  la chiamata
                /*.Include(x => x.ReportDiCantiere)*/ //TODO: la firma del report appesantisce enormemente la chiamata ed è inutile in questo caso
                .ToArrayAsync();

            #region 8 ore fisse per gli impiegati tecnici + aggiunta report
            var allPersonale = p.Select(x => x.Personale).DistinctBy(x => x.Id).ToDictionary(x => x.Id);

            foreach (var tc in p)
            {
                tc.ReportDiCantiere = reports[tc.IdReport];
                if (allPersonale[tc.PersonaleId].OrganizationRole == "Impiegato tecnico")
                {
                    tc.NumberOfHours = tc.Type == TimeCardsTypes.Ordinary ? 8 : 0;
                }
            }
            #endregion

            return p.GroupBy(x => x.IdReport).ToList();
        }

        public IActionResult PrintIndexWithoutServerSaving()
        {
            return new ViewAsPdf("~/Views/Reports/WorksiteReport.cshtml", ViewData);
        }
        #endregion

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
