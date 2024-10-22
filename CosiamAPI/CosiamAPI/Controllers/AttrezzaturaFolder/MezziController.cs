using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CosiamAPI.Data;
using CosiamAPI.Models;
using OfficeOpenXml;
using System.IO;
using Microsoft.Extensions.Configuration;
using JWTAuthentication.Authentication;
using Microsoft.AspNetCore.Authorization;
using CosiamAPI.Common;
using System.Collections.Immutable;
using System.Runtime.InteropServices;
using CosiamAPI.Reports;

namespace CosiamAPI.Controllers
{

    public struct ScadenzeMezziWithFile
    {
        public int Id { get; set; }
        public DateTime? PerformingDate { get; set; }
        public int IdMezzi { get; set; }
        public int IdNote { get; set; }
        public NoteWithAttachmentsView Nota { get; set; }

        public ScadenzeMezziWithFile(ScadenzeMezzi sp, ApplicationDbContext _context)
        {

            this.Id = sp.Id;
            this.PerformingDate = sp.PerformingDate;
            this.IdMezzi = sp.IdMezzi;
            this.IdNote = sp.IdNote;
            this.Nota = new NoteWithAttachmentsView();
            this.Nota.Nota = sp.Nota;
            this.Nota.listFile = _context.AttachmentsNota.Where(atn => atn.IdNota == sp.IdNote).Include(atn => atn.File).Select(atn => atn.File).ToList();

        }
        public ScadenzeMezzi ScadenzeMezziWithFileToScadenzeMezzi()
        {
            ScadenzeMezzi sp = new ScadenzeMezzi();
            sp.Id = this.Id;
            sp.PerformingDate = this.PerformingDate;
            sp.IdMezzi = this.IdMezzi;
            sp.IdNote = this.IdNote;
            sp.Nota = this.Nota.Nota;
            return sp;

        }
    }


    [Route("api/[controller]")]
    [ApiController]
    public class MezziController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        public MezziController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _config = configuration;
        }

        // GET: api/Mezzi
        [HttpGet]
        [Authorize(Roles = UserPolicy.Mezzi_R)]
        public async Task<ActionResult<IEnumerable<Mezzi>>> GetMezzi()
        {
            return await _context.Mezzi.ToListAsync();
        }

        // GET: api/Mezzi/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.Mezzi_R)]
        public async Task<ActionResult<Mezzi>> GetMezzi(int id)
        {
            var mezzi = await _context.Mezzi.FindAsync(id);

            if (mezzi == null)
            {
                return NotFound();
            }

            return mezzi;
        }

        // PUT: api/Mezzi/5
        /// <summary>
        /// Put a new mezzo. This function is deprecated, use POST instead
        /// (Post allows you to add the informations about the vehicle only,
        /// letting the DBMS assign the id)
        /// </summary>
        /// <param name="id"></param>
        /// <param name="mezzi"></param>
        /// <returns></returns>
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = UserPolicy.Mezzi_U)]
        public async Task<IActionResult> PutMezzi(int id, Mezzi mezzi)
        {
            if (id != mezzi.Id)
            {
                return BadRequest();
            }

            _context.Entry(mezzi).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MezziExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }


        private void ScadenzaMezzoSpawn(int idMezzo, string name, DateTime DueTime)
        {
            var sm = new ScadenzeMezzi();
            sm.Nota = new Note();
            sm.IdMezzi = idMezzo;
            sm.Nota.Name = name;
            sm.Nota.DueDate = DueTime;
            sm.Nota.Description = "Scadenza Automatica";
            _context.Note.Add(sm.Nota);
            _context.SaveChanges();
            _context.ScadenzeMezzi.Add(sm);
            _context.SaveChanges();
        }

        private void ScadenzaMezzoAutomaticSpawnPoint(Mezzi mezzo)
        {
            if (mezzo.InsuranceExpirationDate != null)
                ScadenzaMezzoSpawn(mezzo.Id, "Scadenza Assicurazione", (DateTime)mezzo.InsuranceExpirationDate);
            if (mezzo.RevisionExpirationDate != null)
                ScadenzaMezzoSpawn(mezzo.Id, "Prossima Revisione", (DateTime)mezzo.RevisionExpirationDate);
            if (mezzo.StampDutyExpirationDate != null)
                ScadenzaMezzoSpawn(mezzo.Id, "Scadenza Bollo", (DateTime)mezzo.StampDutyExpirationDate);
            if (mezzo.LicenseCProprio != null)
                ScadenzaMezzoSpawn(mezzo.Id, "Licenza C/Proprio", (DateTime)mezzo.LicenseCProprio);
            if (mezzo.WearBook != null)
                ScadenzaMezzoSpawn(mezzo.Id, "Libretto di Manutenzione (Usura)", (DateTime)mezzo.WearBook);
            if (mezzo.FurtoIncendio != null)
                ScadenzaMezzoSpawn(mezzo.Id, "Scadenza assicurazione Furto e Incendio", (DateTime)mezzo.FurtoIncendio);
            if (mezzo.ISPSEL != null)
                ScadenzaMezzoSpawn(mezzo.Id, "Scadenza ISPSEL", (DateTime)mezzo.ISPSEL);
            if (mezzo.TwentyYearVerificationOfLiftingOrgans != null)
                ScadenzaMezzoSpawn(mezzo.Id, "Verifica Ventennale organi di sollevamento", (DateTime)mezzo.TwentyYearVerificationOfLiftingOrgans);
        }

        // POST: api/Mezzi
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /// <summary>
        /// End point to post a new vehicle (id is auto assigned)
        /// </summary>
        /// <param name="mezzo"></param>
        /// <returns></returns>
        [HttpPost]
        [Authorize(Roles = UserPolicy.Mezzi_C)]
        public async Task<ActionResult<Mezzi>> PostMezzi(Mezzi mezzo)
        {
            _context.Mezzi.Add(mezzo);
            await _context.SaveChangesAsync();
            ScadenzaMezzoAutomaticSpawnPoint(mezzo);
            return CreatedAtAction("GetMezzi", new { id = mezzo.Id }, mezzo);
        }

        [HttpPost("UpdateMezzi")]
        [Authorize(Roles = UserPolicy.Mezzi_U)]
        public async Task<ActionResult<Mezzi>> UpdateMezzi(Mezzi mezzo)
        {
            _context.Mezzi.Update(mezzo);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMezzi", new { id = mezzo.Id }, mezzo);
        }

        // DELETE: api/Mezzi/5
        /// <summary>
        /// Delete a mezzo (id based)
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = UserPolicy.Mezzi_D)]
        public async Task<IActionResult> DeleteMezzi(int id)
        {
            var mezzi = await _context.Mezzi.FindAsync(id);
            if (mezzi == null)
            {
                return NotFound();
            }

            _context.Mezzi.Remove(mezzi);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("Delete/{id}")]
        [Authorize(Roles = UserPolicy.Mezzi_D)]
        public async Task<IActionResult> DeleteMezziPost(int id)
        {
            var mezzi = await _context.Mezzi.FindAsync(id);
            if (mezzi == null)
            {
                return NotFound();
            }

            _context.Mezzi.Remove(mezzi);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MezziExists(int id)
        {
            return _context.Mezzi.Any(e => e.Id == id);
        }


        [HttpGet("export")]
        [Authorize(Roles = UserPolicy.Mezzi_R)]
        public async Task<IActionResult> Export(System.Threading.CancellationToken cancellationToken)
        {
            // query data from database  
            await Task.Yield();
            List<Mezzi> list = await _context.Mezzi.ToListAsync();
            var stream = new MemoryStream();

            using (var package = new ExcelPackage(stream))
            {
                var workSheet = package.Workbook.Worksheets.Add("Sheet1");
                workSheet.Cells.LoadFromCollection(list, true);
                package.Save();
            }
            stream.Position = 0;
            string excelName = $"UserList-{DateTime.Now.ToString("yyyyMMddHHmmssfff")}.xlsx";

            //return File(stream, "application/octet-stream", excelName);  
            return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelName);
        }


        // Now time for some good old note disguised as Alert Mezzi

        [HttpGet("GetAlertMezzi/{Id}")]
        [Authorize(Roles = UserPolicy.Mezzi_R)]
        public async Task<IEnumerable<Note>> GetAlertMezzi([FromRoute] int Id)
        {
            return await _context.MezziNota.Where(prdn => prdn.IdMezzo == Id).Select(prn => prn.Note).ToListAsync();
        }

        [HttpPost("PostAlertMezzi/{Id}")]
        [Authorize(Roles = UserPolicy.Mezzi_U)]
        public async Task<ActionResult<Note>> PostAlertMezzi([FromRoute] int Id, Note note)
        {
            //salvo la nota nel database
            await _context.Note.AddAsync(note);
            await _context.SaveChangesAsync();

            //creo un tag sulla nota relativa al mezzo
            MezziNota mn = new MezziNota();
            mn.IdNote = note.Id;
            mn.IdMezzo = Id;
            await _context.MezziNota.AddAsync(mn);

            await _context.SaveChangesAsync();
            //ritorno la nota caso mai @danilozzozozzo volesse usarla per postare un documento
            return note;
        }

        //L'update la può fare direttamente sulla nota stessa (note controller), uguale per la delete

        ////////////////////////////////////////////
        // GESTIONE SCADENZE Mezzi //
        ///////////////////////////////////////////


        private IQueryable<ScadenzeMezzi> WhereDueDateExpired(IQueryable<ScadenzeMezzi> initialQuery)
        {
            return initialQuery.Where(d => d.Nota.DueDate <= DateTime.Now);              // controllo che sia nel timespan indicato
        }
        private IQueryable<ScadenzeMezzi> WhereStatus(IQueryable<ScadenzeMezzi> initialQuery, string status)
        {
            if (status.CompareTo("Scaduta") == 0)
                initialQuery = WhereDueDateExpired(initialQuery);
            return initialQuery.Where(n => n.Nota.State.CompareTo(status) == 0);
        }
        private IQueryable<ScadenzeMezzi> WhereExpiresBefore(IQueryable<ScadenzeMezzi> initialQuery, DateTime exp)
        {
            return initialQuery.Where(d => d.Nota.DueDate <= exp);              // controllo che sia nel timespan indicato
        }
        private IQueryable<ScadenzeMezzi> ExcludeClosed(IQueryable<ScadenzeMezzi> initialQuery)
        {
            return initialQuery.Where(n => n.Nota.State.CompareTo("Chiusa") != 0);
        }

        private async Task<List<ScadenzeMezziWithFile>> ToOrderedScadenzeMezziWithFile(IQueryable<ScadenzeMezzi> initialQuery)
        {

            initialQuery = initialQuery.Include(s => s.Nota);
            initialQuery = initialQuery.OrderBy(s => s.Nota.DueDate);

            var finalQuery = initialQuery.Select(x => new ScadenzeMezziWithFile(x, _context));

            return await finalQuery.ToListAsync();
        }

        /// <summary>
        /// Endpoint che permette di scaricare e filtrare le scadenze di un Mezzi.
        /// Se il parametro includeClosed == true, andrà a scaricare quelle chiuse. 
        /// </summary>
        /// <param name="id"> id del record Mezzi </param>
        /// <param name="state"> filtro riguardante lo "stato" della scadenza</param>
        /// <param name="daysToGo"> filtro riguardante i giorni entro i quali scadrà la scadenza </param>
        /// <param name="includeClosed"> Per scaricare anche quelle chiuse o meno. Questo parametri ha effetto solo se non si danno indicazioni riguardanti lo stato </param>
        /// <returns></returns>
        [HttpGet("{id}/Scadenze")]
        [Authorize(Roles = UserPolicy.Mezzi_R)]
        public async Task<ActionResult<IEnumerable<ScadenzeMezziWithFile>>> GetScadenzeMezzi(int id, [FromQuery] string state, [FromQuery] int daysToGo = -1, [FromQuery] bool includeClosed = false)
        {
            var scadenze = _context.ScadenzeMezzi
                .Where(s => s.IdMezzi == id);

            if (state != null)
                scadenze = WhereStatus(scadenze, state);


            if (!includeClosed)  // Controllo se nello scaricarle tutte mi interessino anche quelle chiuse o meno
                scadenze = ExcludeClosed(scadenze); // Se non voglio includere quelle chiuse, le tolgo dalla ricerca


            if (daysToGo >= 0)
            {
                var maxDate = DateTime.Now.AddDays(daysToGo);
                scadenze = WhereExpiresBefore(scadenze, maxDate);
            }

            var ScadenzeMezziWithFile = await ToOrderedScadenzeMezziWithFile(scadenze);

            return ScadenzeMezziWithFile;  //.OrderBy(s => s.Nota.Nota.DueDate).ToList();
        }

        [HttpPost("UpdateScadenza/{id}")]
        [Authorize(Roles = UserPolicy.Mezzi_U)]
        public async Task<IActionResult> PutScadenzeMezzi(int id, ScadenzeMezzi scadenzeMezzi)
        {
            if (id != scadenzeMezzi.Id)
            {
                return BadRequest();
            }
            _context.Entry(scadenzeMezzi).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.ScadenzeMezzi.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            // Ora aggiorno la sottovariabile della nota

            var note = scadenzeMezzi.Nota;
            if (scadenzeMezzi.IdNote != note.Id)
            {
                return BadRequest();
            }

            _context.Entry(note).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Note.Any(e => e.Id == note.Id)) // Controllo che la nota esista davvero
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }



        [HttpPost("PostScadenza")]
        [Authorize(Roles = UserPolicy.Mezzi_U)]
        public async Task<ActionResult<ScadenzeMezziWithFile>> PostScadenzeMezzi(ScadenzeMezziWithFile scadenzeMezzi)
        {
            var sp = scadenzeMezzi.ScadenzeMezziWithFileToScadenzeMezzi();
            _context.ScadenzeMezzi.Add(sp);
            await _context.SaveChangesAsync();

            return new ScadenzeMezziWithFile(sp, _context);
        }

        [HttpPost("ChangeScadenzaStatus/{id}")]
        [Authorize(Roles = UserPolicy.Mezzi_U)]
        public async Task<ActionResult> UpdateScadenzaStatus([FromRoute] int id, [FromQuery] string new_state = "Chiusa")
        {

            if (!_context.ScadenzeMezzi.Any(e => e.Id == id))
            {
                return NotFound();
            }

            var sp = await _context.ScadenzeMezzi.Include(x => x.Nota).SingleAsync(x => x.Id == id);

            var nota = sp.Nota;
            nota.State = new_state;
            _context.Entry(nota).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Note.Any(e => e.Id == nota.Id)) // Controllo che la nota esista davvero
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpPost("DeleteScadenze")]
        [Authorize(Roles = UserPolicy.Mezzi_D)]
        public async Task<IActionResult> DeleteScadenzeMezzi(int[] ids)
        {
            foreach (int id in ids)
            {
                var scadenzeMezzi = await _context.ScadenzeMezzi.FindAsync(id);
                if (scadenzeMezzi == null)
                {
                    return NotFound();
                }
            }

            foreach (int id in ids)
            {
                var scadenzeMezzi = await _context.ScadenzeMezzi.FindAsync(id);
                var note = await _context.Note.FindAsync(scadenzeMezzi.IdNote);
                var files = await _context.AttachmentsNota.Where(x => x.IdNota == note.Id).Include(at => at.File).Select(an => an.File).ToListAsync();

                foreach (_File file in files)
                    FileManager.DeleteFile(file, _config);

                _context.File.RemoveRange(files);
                _context.Note.Remove(note);
                _context.ScadenzeMezzi.Remove(scadenzeMezzi);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("PostAttachmentsToScadenza/{idScadenza}")]
        [Authorize(Roles = UserPolicy.Mezzi_U)]
        public async Task<ActionResult<IEnumerable<AttachmentsNota>>> PostAttachmentsToNote([FromRoute] int idScadenza, [FromForm] IFormFile[] formFiles)
        {

            List<_File> files = new List<_File>();

            foreach (FormFile formFile in formFiles)
            {
                _File file = await FileManager.SaveNewFile(formFile, _config);
                await _context.File.AddAsync(file);
                files.Add(file);
            }
            await _context.SaveChangesAsync();

            List<AttachmentsNota> attachments = new List<AttachmentsNota>();
            foreach (_File f in files)
            {
                AttachmentsNota atcn = new AttachmentsNota();

                atcn.IdFile = f.Id;
                atcn.IdNota = (await _context.ScadenzeMezzi.FindAsync(idScadenza)).IdNote;

                await _context.AttachmentsNota.AddAsync(atcn);
                attachments.Add(atcn);
            }
            await _context.SaveChangesAsync();

            return attachments;
        }

        [HttpPost("DeleteAttachmentsScadenza")]
        [Authorize(Roles = UserPolicy.Mezzi_U)]
        public async Task<IActionResult> DeleteAttachmentsScadenzeMezzi(int[] ids)
        {
            foreach (int id in ids)
            {
                var file = await _context.File.FindAsync(id);
                if (file == null)
                {
                    return NotFound();
                }
            }

            foreach (int id in ids)
            {
                var file = await _context.File.FindAsync(id);

                FileManager.DeleteFile(file, _config);

                _context.File.Remove(file);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        ////////////////////////////////////////////
        ////     Cantieri Mezzi             ////
        ////////////////////////////////////////////


        [HttpGet("{id}/Cantieri")]
        [Authorize(Roles = UserPolicy.Cantieri_R)]
        public async Task<ActionResult<IEnumerable<Cantiere>>> GetCantieriMezzo(int id)
        {
            return await _context.ListaMezziDiCantiere.Where(s => s.IdMezzi == id)
                                                                   .Include(s => s.Cantiere)
                                                                   .Select(c => c.Cantiere)
                                                                   .ToListAsync();
        }

        private bool FileExists(int id)
        {
            return _context.File.Any(e => e.Id == id);
        }


        /// <summary>
        /// Stampa il dettaglio dei mezzi, scrivendo una riga ogni volta che un mezzo cambia cantiere
        /// Es:  <br></br>
        ///     - dal giorno 1 al 10 il mezzo x ha lavorato nel cantiere A <br></br>
        ///     - dal giorno 11 al 13 ha lavorato nel cantiere B <br></br>
        ///     - dal giorno 14 al 16 ha lavorato nel cantiere A <br></br>
        /// </summary>
        /// <param name="idsMezzi"></param>
        /// <param name="dateFrom"></param>
        /// <param name="dateTo"></param>
        /// <returns></returns>
        [Obsolete]
        [HttpPost("getDettagliMezziRaggruppati")]
        public async Task<IActionResult> GetDettagliMezziRaggruppati(int[] idsMezzi, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
        {
            var mezzi = _context.Mezzi.Where(x => idsMezzi.Contains(x.Id));
            if (!mezzi.Any())
                return base.BadRequest("Mezzi non esistenti");

            List<ReportDiCantiere> reportList = new();
            var idCantieri = _context.VehicleCard.Where(x => idsMezzi.Contains(x.MezzoId)).Select(x => x.ReportDiCantiere).Select(x => x.IdCantiere).Distinct();
            foreach (var idcantiere in idCantieri.AsParallel().AsUnordered())
                reportList.AddRange(ReportUtils.GetReportsBetweenDates(_context, idcantiere, dateFrom?.ToString("yyyy-MM-dd"), dateTo?.ToString("yyyy-MM-dd")));

            var idReports = reportList.Select(x => x.Id).Distinct();
            ImmutableArray<VehicleCard> vehicleCards = _context.VehicleCard.Where(x => idReports.Contains(x.IdReport) && idsMezzi.Contains(x.MezzoId)).ToImmutableArray();


            List<(string mezzo, string cantiere, DateTime dateFrom, DateTime dateTo, int giorniLavorati, double dailyCost, double totalCost)> toReturn = new();
            //ordino i report per data
            if (reportList.Count == 0)
                return Ok("Mezzo selezionato non presente in nessun report");

            ImmutableArray<Cantiere> cantieri = _context.Cantiere.Where(x => reportList.Select(x => x.IdCantiere).Distinct().Contains(x.Id)).ToImmutableArray();

            foreach (var m in mezzi)
            {
                idReports = vehicleCards.Where(x => x.MezzoId == m.Id).Select(x => x.IdReport).Distinct();
                if (!idReports.Any())
                    break;
                //ORDINO i report in base alla reference date
                var reportSubList = reportList.Where(x => idReports.Contains(x.Id)).OrderBy(x => DateTime.Parse(x.referenceDate)).ToList();
                int idCantiere = reportSubList[0].IdCantiere;
                int indexFrom = 0;

                for (int i = 0; i < reportSubList.Count; i++)
                {
                    //entro anche se mi trovo nell'ultimo elemento del reportList
                    if ((i == reportSubList.Count - 1 || (i < reportSubList.Count - 1) && reportSubList[i + 1].IdCantiere != reportSubList[i].IdCantiere))
                    {
                        var reportIds = CollectionsMarshal.AsSpan(reportSubList).Slice(indexFrom, i + 1 - indexFrom).ToArray().Select(x => x.Id);

                        var a = vehicleCards.Where(x => reportIds.Contains(x.IdReport) && x.MezzoId == m.Id);
                        var dailyCost = a.Select(x => x.Mezzo.DailyCost).First();
                        var fuelCost = a.Sum(x => x.FuelCost * x.LitersOfFuel);

                        var cantiere = cantieri.Single(x => x.Id == reportSubList[i].IdCantiere);

                        toReturn.Add(($"{m.Description} {m.Brand} {m.Model} {m.LicensePlate}", cantiere.ShortDescription, DateTime.Parse(reportSubList[indexFrom].referenceDate), DateTime.Parse(reportSubList[i].referenceDate), 0, dailyCost ?? 0.0, (dailyCost ?? 0.0) + fuelCost ));
                        indexFrom = i + 1;

                    }
                }

            }



            using (var memoryStream = new MemoryStream())
            {
                using (ExcelPackage p = new ExcelPackage(memoryStream))
                {
                    // Aggiungere i fogli di lavoro
                    ExcelWorksheet sheet = p.Workbook.Worksheets.Add("Riepilogo");

                    // Impostare le intestazioni
                    var headers = new[] { "Mezzo", "Cantiere", "Data Inizio", "Data Fine", "Giorni Lavorati", "Costo Giornaliero", "Costo Totale" };
                    for (int i = 0; i < headers.Length; i++)
                    {
                        sheet.Cells[1, i + 1].Value = headers[i];
                    }

                    // Formattazione delle celle per le intestazioni
                    using (var range = sheet.Cells[1, 1, 1, headers.Length])
                    {
                        range.Style.Font.Bold = true;
                    }

                    // Aggiungo i dati
                    int currentRow = 2;
                    foreach (var row in toReturn)
                    {
                        // Aggiungere i dati al foglio Excel
                        sheet.Cells[currentRow, 1].Value = row.mezzo;
                        sheet.Cells[currentRow, 2].Value = row.cantiere;
                        sheet.Cells[currentRow, 3].Value = row.dateFrom.ToString("dd/MM/yyyy");
                        sheet.Cells[currentRow, 4].Value = row.dateTo.ToString("dd/MM/yyyy");
                        sheet.Cells[currentRow, 5].Value = row.giorniLavorati;
                        sheet.Cells[currentRow, 6].Value = row.dailyCost;
                        sheet.Cells[currentRow, 7].Value = row.totalCost;
                        currentRow++;
                    }

                    // Convertire l'intervallo di celle in una tabella
                    var tableRange = sheet.Cells[1, 1, currentRow - 1, headers.Length];
                    var table = sheet.Tables.Add(tableRange, "DettagliMezzi");
                    table.ShowTotal = false;
                    table.TableStyle = OfficeOpenXml.Table.TableStyles.Medium13;


                    // Applicare la formattazione delle celle per i costi
                    sheet.Cells[2, 6, currentRow, 6].Style.Numberformat.Format = "€ #,##0.00";
                    sheet.Cells[2, 7, currentRow, 7].Style.Numberformat.Format = "€ #,##0.00";

                    // Auto-fit per le colonne
                    //sheet.Cells[sheet.Dimension.Address].AutoFitColumns();

                    // Salvare il file Excel
                    p.Save();
                    var file = memoryStream.ToArray();
                    //var path = @"C:\Users\finiz\Downloads\aaa.xlsx";
                    //System.IO.File.WriteAllBytes(path, file);
                    return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                }

            }

        }

        /// <summary>
        /// Stampa il dettaglio dei mezzi, scrivendo una riga per ogni singola giornata in cui un mezzo è stato adoperato
        /// Es:  <br></br>
        ///     - giorno 1 il mezzo x ha lavorato nel cantiere A <br></br>
        ///     - giorno 2 ha lavorato nel cantiere B <br></br>
        ///     - giorno 5 ha lavorato nel cantiere A <br></br>
        /// </summary>
        /// <param name="idsMezzi"></param>
        /// <param name="dateFrom"></param>
        /// <param name="dateTo"></param>
        /// <returns></returns>
        [HttpPost("getDettagliMezzi")]
        public async Task<IActionResult> GetDettagliMezzi(int[] idsMezzi, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo, [FromQuery] string exportType)
        {
            var mezzi = _context.Mezzi.Where(x => idsMezzi.Contains(x.Id));
            if (!mezzi.Any())
                return base.BadRequest("Mezzi non esistenti");

            List<ReportDiCantiere> reportList = new();
            var idCantieri = _context.VehicleCard.Where(x => idsMezzi.Contains(x.MezzoId)).Select(x => x.ReportDiCantiere).Select(x => x.IdCantiere).Distinct();
            foreach (var idcantiere in idCantieri.AsParallel().AsUnordered())
                reportList.AddRange(ReportUtils.GetReportsBetweenDates(_context, idcantiere, dateFrom?.ToString("yyyy-MM-dd"), dateTo?.ToString("yyyy-MM-dd")));

            var idReports = reportList.Select(x => x.Id).Distinct();
            ImmutableArray<VehicleCard> vehicleCards = _context.VehicleCard.Where(x => idReports.Contains(x.IdReport) && idsMezzi.Contains(x.MezzoId)).ToImmutableArray();


            List<(string mezzo, string cantiere, DateTime date, string dayOfWeek, double dailyCost, double totalCost)> toReturn = new();
            //ordino i report per data
            if (reportList.Count == 0)
                return Ok("Mezzo selezionato non presente in nessun report");

            ImmutableArray<Cantiere> cantieri = _context.Cantiere.Where(x => reportList.Select(x => x.IdCantiere).Distinct().Contains(x.Id)).ToImmutableArray();

            foreach (var m in mezzi)
            {
                idReports = vehicleCards.Where(x => x.MezzoId == m.Id).Select(x => x.IdReport).Distinct();
                if (!idReports.Any())
                    break;
                //ORDINO i report in base alla reference date
                var reportSubList = reportList.Where(x => idReports.Contains(x.Id)).OrderBy(x => DateTime.Parse(x.referenceDate)).ToList();

                foreach (var report in reportSubList)
                {
                    var a = vehicleCards.Where(x => report.Id == x.IdReport && x.MezzoId == m.Id);
                    var dailyCost = a.Select(x => x.Mezzo.DailyCost).First();
                    var fuelCost = a.Sum(x => x.FuelCost * x.LitersOfFuel);

                    var cantiere = cantieri.Single(x => x.Id == report.IdCantiere);

                    toReturn.Add(($"{m.Description} {m.Brand} {m.Model} {m.LicensePlate}", cantiere.ShortDescription, DateTime.Parse(report.referenceDate), DateTime.Parse(report.referenceDate).ToString("dddd"), dailyCost ?? 0.0, (dailyCost ?? 0.0) + fuelCost));

                }

            }


            #region Excel export
            if (exportType.Contains("xlsx", StringComparison.CurrentCultureIgnoreCase))
            {
                using (var memoryStream = new MemoryStream())
                {
                    using (ExcelPackage p = new ExcelPackage(memoryStream))
                    {
                        // Aggiungere i fogli di lavoro
                        ExcelWorksheet sheet = p.Workbook.Worksheets.Add("Riepilogo");

                        // Impostare le intestazioni
                        var headers = new[] { "Mezzo", "Cantiere", "Data", "Giorno", "Costo Giornaliero", "Costo Totale" };
                        for (int i = 0; i < headers.Length; i++)
                        {
                            sheet.Cells[1, i + 1].Value = headers[i];
                        }

                        // Formattazione delle celle per le intestazioni
                        using (var range = sheet.Cells[1, 1, 1, headers.Length])
                        {
                            range.Style.Font.Bold = true;
                        }

                        // Aggiungo i dati
                        int currentRow = 2;
                        foreach (var row in toReturn)
                        {
                            // Aggiungere i dati al foglio Excel
                            sheet.Cells[currentRow, 1].Value = row.mezzo;
                            sheet.Cells[currentRow, 2].Value = row.cantiere;
                            sheet.Cells[currentRow, 3].Value = row.date.ToString("dd/MM/yyyy");
                            sheet.Cells[currentRow, 4].Value = row.date.ToString("dddd");
                            sheet.Cells[currentRow, 5].Value = row.dailyCost;
                            sheet.Cells[currentRow, 6].Value = row.totalCost;
                            currentRow++;
                        }

                        // Convertire l'intervallo di celle in una tabella
                        var tableRange = sheet.Cells[1, 1, currentRow - 1, headers.Length];
                        var table = sheet.Tables.Add(tableRange, "DettagliMezzi");
                        table.ShowTotal = false;
                        table.TableStyle = OfficeOpenXml.Table.TableStyles.Medium13;


                        // Applicare la formattazione delle celle per i costi
                        sheet.Cells[2, 5, currentRow, 5].Style.Numberformat.Format = "€ #,##0.00";
                        sheet.Cells[2, 6, currentRow, 6].Style.Numberformat.Format = "€ #,##0.00";

                        // Auto-fit per le colonne
                        //sheet.Cells[sheet.Dimension.Address].AutoFitColumns();

                        // Salvare il file Excel
                        p.Save();
                        var file = memoryStream.ToArray();
                        //var path = @"C:\Users\finiz\Downloads\aaa.xlsx";
                        //System.IO.File.WriteAllBytes(path, file);
                        return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                    }

                }
            }
            #endregion
            #region PDF Export
            else
            {
                //export PDF

                string filename = Guid.NewGuid().ToString() + ".pdf";
                var rg = new ReportGenerator(/*new HomeController(null,_config,_context)*/this);
                string pathToFile = await rg.generatePDF(ReportsEnum.EstrazioneOreMezziReport, toReturn, filename);
                return File(System.IO.File.ReadAllBytes(pathToFile), "application/pdf");
            }
            #endregion

        }
    }
}
