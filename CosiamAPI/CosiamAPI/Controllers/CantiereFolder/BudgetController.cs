using CosiamAPI.Data;
using CosiamAPI.Models;
using JWTAuthentication.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CosiamAPI.Controllers.CantiereFolder
{
    [Route("api/[controller]")]
    [ApiController]
    public class BudgetController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public BudgetController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            this._config = configuration;
        }

        // GET: api/Budget
        [HttpGet]
        [Authorize(Roles = UserPolicy.Cantieri_R)]
        public async Task<ActionResult<IEnumerable<BudgetModel>>> GetBudget()
        {
            return await _context.Budget.Include(x => x.Capitoli).ThenInclude(x => x.Attivita).AsSplitQuery().ToListAsync();
        }

        // GET: api/Budget/5
        [HttpGet("{idCantiere}")]
        [Authorize(Roles = UserPolicy.Cantieri_R)]
        public async Task<ActionResult<BudgetModel>> GetBudgetByCantiereId(int idCantiere)
        {
            //con una sola chiamata includo tutto. Per evitare cicli nella serializzazione del risultato allo Startup è stato aggiunto l'IgnoreCycles
            //con lo SplitQuery esegue 3 query invece che una sola contenente dei join (dovrebbe essere più veloce)
            var budget = await _context.Budget.Include(x => x.Capitoli).ThenInclude(x => x.Attivita).AsSplitQuery().SingleOrDefaultAsync(x => x.IdCantiere == idCantiere);

            if (budget == null)
            {
                return NotFound();
            }

            return Ok(budget);
        }

        // PUT: api/Budget/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /// <summary>
        /// NON VIENE UTILIZZATA
        /// </summary>
        /// <param name="id"></param>
        /// <param name="budget"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        [Authorize(Roles = UserPolicy.Cantieri_U)]
        [Obsolete]
        public async Task<IActionResult> PutBudget(int id, BudgetModel budget)
        {
            if (id != budget.Id)
            {
                return BadRequest();
            }

            _context.Entry(budget).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BudgetExists(id))
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

        // POST: api/Budget
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /// <summary>
        /// Per CREAZIONE e UPDATE
        /// </summary>
        /// <param name="budget"></param>
        /// <returns></returns>
        [HttpPost]
        [Authorize(Roles = UserPolicy.Cantieri_U)]
        public async Task<ActionResult<BudgetModel>> PostBudget(BudgetModel budget)
        {

            bool containB = _context.Budget.Any(x => x.Id == budget.Id);

            if (!containB)
            {
                _context.Budget.Add(budget);

            }


            foreach (var cap in budget.Capitoli)
            {

                cap.IdBudget = budget.Id;

                foreach (var a in cap.Attivita)
                {

                    a.IdCapitolo = cap.Id;

                }

            }


            //L'ID DEI CAPITOLI E GLI ID DELLE ATTIVITA VENGONO SETTATI A 0, cioè vengono ricreati tutte le volte per ogni chiamata
            foreach (var cap in budget.Capitoli)
            {
                bool contain = _context.CapitoloBudget.Any(x => x.Id == cap.Id);

                if (contain)
                {

                    _context.CapitoloBudget.Update(cap);

                }
                else
                {

                    _context.CapitoloBudget.Add(cap);

                }

            }

            await _context.SaveChangesAsync();

            return CreatedAtAction("GetBudget", new { id = budget.Id }, budget);
        }

        // DELETE: api/Budget/5
        /// <summary>
        /// NON UTILIZZATA
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = UserPolicy.Cantieri_D)]
        [Obsolete]
        public async Task<IActionResult> DeleteBudget(int id)
        {
            //ATTUALMENTE IN UN CANTIERE NON PUò ESSERE ELIMINATO IL BUDGET
            var budget = await _context.Budget.FindAsync(id);
            if (budget == null)
            {
                return NotFound();
            }

            //TODO: BISOGNEREBBE ELIMINARE ANCHE FISICAMENTE I FILE
            _context.Budget.Remove(budget);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("getBudgetAttachments/{IdBudget}")]
        [Authorize(Roles = UserPolicy.Cantieri_R)]
        public async Task<ActionResult<IEnumerable<AttachmentsBudget>>> GetAllBudgetAttachments([FromRoute] int IdBudget)
        {
            var idsCapitoliBudget = _context.CapitoloBudget.Include(x => x.Attivita).Where(x => x.IdBudget == IdBudget).Select(x => x.Id);
            var idsAttivita = await _context.AttivitaBudget.Where((x) => idsCapitoliBudget.Contains(x.IdCapitolo)).Select(x => x.Id).ToArrayAsync();

            var attachments = _context.AttachmentsBudget.Include(x => x.File).Where(x => idsAttivita.Contains(x.IdAttivitaBudget));
            // var attachments = _context.AttachmentsBudget.Where(x => idsAttivita.Contains(x.IdAttivitaBudget)).Select(x => x.File);

            return await attachments.ToListAsync();

        }
        [HttpPost("postBudgetAttachments/{IdAttivita}")]
        [Authorize(Roles = UserPolicy.Cantieri_R)]
        public async Task<ActionResult> PostBudgetAttachments([FromForm] IFormFile[] formFiles, [FromRoute] int IdAttivita)
        {


            foreach (FormFile formFile in formFiles.Cast<FormFile>())
            {
                _File file = await FileManager.SaveNewFile(formFile, _config);
                var f = await _context.File.AddAsync(file);

                await _context.SaveChangesAsync(); //salvo per ottenere l'id del file appena creato
                AttachmentsBudget atb = new()
                {
                    IdFile = f.Entity.Id,
                    IdAttivitaBudget = IdAttivita
                };
                _context.AttachmentsBudget.Add(atb);

            }

            await _context.SaveChangesAsync();

            return Ok();

        }


        [HttpPost("deleteCapitoli")]
        [Authorize(Roles = UserPolicy.Cantieri_R)]
        public async Task<ActionResult> DeleteCapitoli(IEnumerable<int> IdCapitoli)
        {

            //TODO elimina manualmente gli allegati relativi alle attività
            foreach (var id in IdCapitoli)
            {
                _context.CapitoloBudget.Remove(new CapitoloBudgetModel() { Id = id });
            }

            var idsAttivitaCapitoli = await _context.AttivitaBudget.Where(x => IdCapitoli.Contains(x.IdCapitolo)).Select(x => x.Id).ToArrayAsync();
            var idFilesToDel = _context.AttachmentsBudget.Where(x => idsAttivitaCapitoli.Contains(x.IdAttivitaBudget)).Select(x => x.IdFile).ToArray();

            _ = Task.Run(() => new FileController(_config, new ApplicationDbContext()).DeleteFiles(idFilesToDel))
               .ContinueWith(x => { throw new Exception("Fallita eliminazione di un file:", x.Exception); }, TaskContinuationOptions.OnlyOnFaulted);

            _context.SaveChanges();

            return Ok();

        }

        [HttpPost("deleteAttivita")]
        [Authorize(Roles = UserPolicy.Cantieri_R)]
        public async Task<ActionResult> deleteAttivita(IEnumerable<int> IdAttivita)
        {

            var filesToDel = _context.AttachmentsBudget.Where(x => IdAttivita.Contains(x.IdAttivitaBudget)).Select(x => x.IdFile).ToArray();

            foreach (var id in IdAttivita)
            {
                _context.AttivitaBudget.Remove(new AttivitaBudgetModel() { Id = id });
            }

            //cancello fisicamente i file in un task in background
            _ = Task.Run(() => new FileController(_config, new ApplicationDbContext()).DeleteFiles(filesToDel))
                       .ContinueWith(x => { throw new Exception("Fallita eliminazione di un file:", x.Exception); }, TaskContinuationOptions.OnlyOnFaulted);

            _context.SaveChanges();


            return Ok();
        }


        private bool BudgetExists(int id)
        {
            return _context.Budget.Any(e => e.Id == id);
        }
    }
}
