using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CosiamAPI.Data;
using CosiamAPI.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using JWTAuthentication.Authentication;


namespace CosiamAPI.Controllers
{
    /// <summary>
    /// Si tratta di una struct che va a comporre un oggetto più complesso rispetto a quelli di
    /// base in cui viene scomposto all'interno del database.
    /// La sua utilità è quella di fare da "view", ovvero raggrumare in maniera più leggibile
    /// e fruibile per il frontend (aka danilozzo) più informazioni assieme.
    /// </summary>
    public struct ScadenzeFornitoriWithFile
    {
        public int Id { get; set; }
        public DateTime? PerformingDate { get; set; }
        public int IdFornitori { get; set; }
        public int IdNote { get; set; }
        public NoteWithAttachmentsView Nota { get; set; }
        /// <summary>
        /// Crea una scadenza fornitori with file, partendo da un oggetto di tipo ScadenzeFornitori ed individuando
        /// tutti i file legati a siffatte scadenze.
        /// </summary>
        /// <param name="sp"></param>
        /// <param name="_context"></param>
        public ScadenzeFornitoriWithFile(ScadenzeFornitori sp, ApplicationDbContext _context)
        {

            this.Id = sp.Id;
            this.PerformingDate = sp.PerformingDate;
            this.IdFornitori = sp.IdFornitori;
            this.IdNote = sp.IdNote;
            this.Nota = new NoteWithAttachmentsView();
            this.Nota.Nota = sp.Nota;
            this.Nota.listFile = _context.AttachmentsNota.Where(atn => atn.IdNota == sp.IdNote).Include(atn => atn.File).Select(atn => atn.File).ToList();

        }
        /// <summary>
        /// Ritorna la ScadenzeFornitori normale a partire da questo oggetto più complesso.
        /// </summary>
        /// <returns></returns>
        public ScadenzeFornitori ScadenzeFornitoriWithFileToScadenzeFornitori()
        {
            ScadenzeFornitori sp = new ScadenzeFornitori();
            sp.Id = this.Id;
            sp.PerformingDate = this.PerformingDate;
            sp.IdFornitori = this.IdFornitori;
            sp.IdNote = this.IdNote;
            sp.Nota = this.Nota.Nota;
            return sp;

        }
    }
    
    /// <summary>
    /// Classe che permette il controllo degli endpoint riguarduanti i fornitori (comprese le scadenze)
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class FornitoriController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        public FornitoriController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _config = configuration;
        }

        // GET: api/Fornitori
        /// <summary>
        /// Va beh ritorna tutti i fornitori
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Authorize(Roles = UserPolicy.Fornitori_R)]
        public async Task<ActionResult<IEnumerable<Fornitori>>> GetFornitori()
        {
            return await _context.Fornitori.ToListAsync();
        }

        // GET: api/Fornitori/5
        /// <summary>
        /// Ritorna uno specifico fornitore
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.Fornitori_R)]
        public async Task<ActionResult<Fornitori>> GetFornitori(int id)
        {
            var fornitori = await _context.Fornitori.FindAsync(id);

            if (fornitori == null)
            {
                return NotFound();
            }

            return fornitori;
        }

        // PUT: api/Fornitori/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /// <summary>
        /// Aggiorna uno specifico fornitore
        /// </summary>
        /// <param name="id"></param>
        /// <param name="fornitori"></param>
        /// <returns></returns>
        [HttpPost("{id}/Update")]
        [Authorize(Roles = UserPolicy.Fornitori_U)]
        public async Task<IActionResult> PutFornitori(int id, Fornitori fornitori)
        {
            if (id != fornitori.Id)
            {
                return BadRequest();
            }

            _context.Entry(fornitori).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FornitoriExists(id))
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

        // POST: api/Fornitori
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /// <summary>
        /// Crea un nuovo fornitore
        /// </summary>
        /// <param name="fornitori"></param>
        /// <returns></returns>
        [HttpPost]
        [Authorize(Roles = UserPolicy.Fornitori_C)]
        public async Task<ActionResult<Fornitori>> PostFornitori(Fornitori fornitori)
        {
            _context.Fornitori.Add(fornitori);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetFornitori", new { id = fornitori.Id }, fornitori);
        }


        // DELETE: api/Fornitori/5
        /// <summary>
        /// Delete di un fornitore. Deprecata
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = UserPolicy.Fornitori_D)]
        public async Task<IActionResult> DeleteFornitori(int id)
        {
            var fornitori = await _context.Fornitori.FindAsync(id);
            if (fornitori == null)
            {
                return NotFound();
            }

            _context.Fornitori.Remove(fornitori);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        /// <summary>
        /// Delete di un fornitore
        /// </summary>
        /// <param name="id"> id del fornitore</param>
        /// <returns></returns>
        [HttpPost("Delete/{id}")]
        [Authorize(Roles = UserPolicy.Fornitori_D)]
        public async Task<IActionResult> DeleteFornitoriPost(int id)
        {
            var fornitori = await _context.Fornitori.FindAsync(id);
            if (fornitori == null)
            {
                return NotFound();
            }

            _context.Fornitori.Remove(fornitori);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FornitoriExists(int id)
        {
            return _context.Fornitori.Any(e => e.Id == id);
        }
        
        ////////////////////////////////////////////
        ////     Cantieri Fornitori             ////
        ////////////////////////////////////////////

        /// <summary>
        /// Ritorna tutti i cantieri dei quali il fornitore è fornitore
        /// </summary>
        /// <param name="id"> id del fornitore </param>
        /// <returns></returns>
        [HttpGet("{id}/Cantieri")]
        [Authorize(Roles = UserPolicy.Fornitori_R + UserPolicy.Cantieri_R)]
        public async Task<ActionResult<IEnumerable<Cantiere>>> GetCantieriFornitori(int id)
        {
            return await _context.ListaFornitoriCantiere.Where(s => s.IdFornitore == id)
                                                                   .Include(s => s.Cantiere)
                                                                   .Select(c => c.Cantiere)
                                                                   .ToListAsync();
        }

    ////////////////////////////////////////////
        // GESTIONE SCADENZE Fornitori //
        ///////////////////////////////////////////


        private IQueryable<ScadenzeFornitori> WhereDueDateExpired(IQueryable<ScadenzeFornitori> initialQuery) {
            return initialQuery.Where(d => d.Nota.DueDate <= DateTime.Now);              // controllo che sia nel timespan indicato
        }
        private IQueryable<ScadenzeFornitori> WhereStatus(IQueryable<ScadenzeFornitori> initialQuery, string status) {
            if(status.CompareTo("Scaduta") == 0)
                initialQuery = WhereDueDateExpired(initialQuery);
            return initialQuery.Where(n => n.Nota.State.CompareTo(status) == 0);
        }
        private IQueryable<ScadenzeFornitori> WhereExpiresBefore(IQueryable<ScadenzeFornitori> initialQuery, DateTime exp) {
            return initialQuery.Where(d => d.Nota.DueDate <= exp);              // controllo che sia nel timespan indicato
        }
        private IQueryable<ScadenzeFornitori> ExcludeClosed(IQueryable<ScadenzeFornitori> initialQuery) {
            return initialQuery.Where(n => n.Nota.State.CompareTo("Chiusa") != 0);
        }
        /// <summary>
        /// Riordina i fornitori nella query attuale e ritorna una lista ordinata
        /// </summary>
        /// <param name="initialQuery"></param>
        /// <returns></returns>
        private async Task<List<ScadenzeFornitoriWithFile>> ToOrderedScadenzeFornitoriWithFile(IQueryable<ScadenzeFornitori> initialQuery) {

            initialQuery = initialQuery.Include(s => s.Nota);
            initialQuery = initialQuery.OrderBy(s => s.Nota.DueDate);
            
            var finalQuery = initialQuery.Select(x => new ScadenzeFornitoriWithFile(x, _context));

            return await finalQuery.ToListAsync();
        }

        /// <summary>
        /// Endpoint che permette di scaricare e filtrare le scadenze di un Fornitori.
        /// Se il parametro includeClosed == true, andrà a scaricare quelle chiuse. 
        /// </summary>
        /// <param name="id"> id del record Fornitori </param>
        /// <param name="state"> filtro riguardante lo "stato" della scadenza</param>
        /// <param name="daysToGo"> filtro riguardante i giorni entro i quali scadrà la scadenza </param>
        /// <param name="includeClosed"> Per scaricare anche quelle chiuse o meno. Questo parametri ha effetto solo se non si danno indicazioni riguardanti lo stato </param>
        /// <returns></returns>
        [HttpGet("{id}/Scadenze")]
        [Authorize(Roles = UserPolicy.Fornitori_R)]
        public async Task<ActionResult<IEnumerable<ScadenzeFornitoriWithFile>>> GetScadenzeFornitori(int id, [FromQuery] string state, [FromQuery] int daysToGo = -1, [FromQuery] bool includeClosed = false)
        {   
            var scadenze = _context.ScadenzeFornitori
                .Where(s => s.IdFornitori == id);
            
            if(state != null)
                scadenze = WhereStatus(scadenze, state);


            if(!includeClosed)  // Controllo se nello scaricarle tutte mi interessino anche quelle chiuse o meno
                scadenze = ExcludeClosed(scadenze); // Se non voglio includere quelle chiuse, le tolgo dalla ricerca


            if(daysToGo >= 0){
                var maxDate = DateTime.Now.AddDays(daysToGo);
                scadenze = WhereExpiresBefore(scadenze, maxDate);
            }

            var ScadenzeFornitoriWithFile = await ToOrderedScadenzeFornitoriWithFile(scadenze);

            return ScadenzeFornitoriWithFile;  //.OrderBy(s => s.Nota.Nota.DueDate).ToList();
        }

        [HttpPost("UpdateScadenza/{id}")]
        [Authorize(Roles = UserPolicy.Fornitori_U)]
        public async Task<IActionResult> PutScadenzeFornitori(int id, ScadenzeFornitori scadenzeFornitori)
        {
            if (id != scadenzeFornitori.Id)
            {
                return BadRequest();
            }
            _context.Entry(scadenzeFornitori).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.ScadenzeFornitori.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            // Ora aggiorno la sottovariabile della nota

            var note = scadenzeFornitori.Nota;
            if (scadenzeFornitori.IdNote != note.Id)
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
        [Authorize(Roles = UserPolicy.Fornitori_U)]
        public async Task<ActionResult<ScadenzeFornitoriWithFile>> PostScadenzeFornitori(ScadenzeFornitoriWithFile scadenzeFornitori)
        {
            var sp = scadenzeFornitori.ScadenzeFornitoriWithFileToScadenzeFornitori();
            _context.ScadenzeFornitori.Add(sp);
            await _context.SaveChangesAsync();

            return new ScadenzeFornitoriWithFile(sp, _context);
        }

        [HttpPost("ChangeScadenzaStatus/{id}")]
        [Authorize(Roles = UserPolicy.Fornitori_U)]
        public async Task<ActionResult> UpdateScadenzaStatus([FromRoute] int id,  [FromQuery] string new_state = "Chiusa")
        {

            if (!_context.ScadenzeFornitori.Any(e => e.Id == id))
            {
                return NotFound();
            }

            var sp = await _context.ScadenzeFornitori.Include(x => x.Nota).SingleAsync(x => x.Id == id);
            
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
        [Authorize(Roles = UserPolicy.Fornitori_U)]
        public async Task<IActionResult> DeleteScadenzeFornitori(int[] ids)
        {
            foreach (int id in ids)
            {
                var scadenzeFornitori = await _context.ScadenzeFornitori.FindAsync(id);
                if (scadenzeFornitori == null)
                {
                    return NotFound();
                }
            }

            foreach (int id in ids)
            {
                var scadenzeFornitori = await _context.ScadenzeFornitori.FindAsync(id);
                var note = await _context.Note.FindAsync(scadenzeFornitori.IdNote);
                var files = await _context.AttachmentsNota.Where(x => x.IdNota == note.Id).Include(at => at.File).Select(an => an.File).ToListAsync();

                foreach (_File file in files)
                    FileManager.DeleteFile(file, _config);

                _context.File.RemoveRange(files);
                _context.Note.Remove(note);
                _context.ScadenzeFornitori.Remove(scadenzeFornitori);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("PostAttachmentsToScadenza/{idScadenza}")]
        [Authorize(Roles = UserPolicy.Fornitori_U + UserPolicy.Documenti_C)]
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
                atcn.IdNota = (await _context.ScadenzeFornitori.FindAsync(idScadenza)).IdNote;

                await _context.AttachmentsNota.AddAsync(atcn);
                attachments.Add(atcn);
            }
            await _context.SaveChangesAsync();

            return attachments;
        }

        [HttpPost("DeleteAttachmentsScadenza")]
        [Authorize(Roles = UserPolicy.Fornitori_U + UserPolicy.Documenti_D)]
        public async Task<IActionResult> DeleteAttachmentsScadenzeFornitori(int[] ids)
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


        private bool FileExists(int id)
        {
            return _context.File.Any(e => e.Id == id);
        }

    }
}
