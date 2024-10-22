using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
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
    /// Saltura = SAL/Fattura
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class SalturaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        public SalturaController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _config = configuration;
        }

        private static int checkDelayDaysFattura(Saltura x)
        {
            if(x.fatturaState != null){
                if(((string) x.fatturaState).ToLower().Contains("incassata"))
                    return x.dataIncassoFattura > x.dataScadenzaFattura ?  (int) ((DateTime) x.dataIncassoFattura).Subtract((DateTime) x.dataScadenzaFattura).TotalDays : 0;
            }
            return (DateTime.Now > x.dataScadenzaFattura) ? (int) (DateTime.Now).Subtract((DateTime) x.dataScadenzaFattura).TotalDays : 0;
        }
        ///
        /// // GET: api/Saltura
        /// <summary>
        /// Permette di ottenere tutte le salture riguardanti il determinato cantiere
        /// </summary>
        /// <param name="idCantiere"></param>
        /// <returns></returns>
        [HttpGet]
        [Authorize(Roles = UserPolicy.Cantieri_R)]
        public async Task<ActionResult<IEnumerable<Object>>> GetSaltura([FromQuery] int idCantiere)
        {
            return await _context.Saltura.Where(s => s.IdCantiere == idCantiere)
                                .Select(x => new {
                                    Id = x.Id,
                                    dataEmissioneFattura = x.dataEmissioneFattura,
                                    descriptionNumberFattura = x.descriptionNumberFattura,
                                    fatturaState = x.fatturaState,
                                    delayDaysFattura = checkDelayDaysFattura(x),
                                    dataScadenzaFattura = x.dataScadenzaFattura,
                                    dataIncassoFattura = x.dataIncassoFattura,
                                    netAmountFattura = x.netAmountFattura,
                                    netAmountCP = x.netAmountCP,
                                    netAmountSAL = x.netAmountSAL,
                                    ivaAmountFattura = x.ivaAmountFattura,
                                })
                                .ToListAsync();
        }
        [HttpGet("{idSaltura}")]
        [Authorize(Roles = UserPolicy.Cantieri_R)]
        public async Task<ActionResult<Object>> GetSingleSaltura(int idSaltura)
        {
            return await _context.Saltura.Select( x =>
                                    new{
                                        Id = x.Id,
                                        descriptionNumberSal = x.descriptionNumberSal,
                                        descriptionNumberCP = x.descriptionNumberCP,
                                        descriptionNumberFattura = x.descriptionNumberFattura,
                                        dataEmissioneSAL = x.dataEmissioneSAL,
                                        dataEmissioneCP = x.dataEmissioneCP,
                                        dataEmissioneFattura = x.dataEmissioneFattura,
                                        dataScadenzaFattura = x.dataScadenzaFattura,
                                        dataIncassoFattura = x.dataIncassoFattura,
                                        netAmountSAL = x.netAmountSAL,
                                        netAmountCP = x.netAmountCP,
                                        netAmountFattura = x.netAmountFattura,
                                        ivaAmountFattura = x.ivaAmountFattura,
                                        salState = x.salState,
                                        cpState = x.cpState,
                                        fatturaState = x.fatturaState,
                                        contractualAdvance = x.contractualAdvance,
                                        accidentsWithholding = x.accidentsWithholding,
                                        iva = x.iva,
                                        startingReferralPeriodDate = x.startingReferralPeriodDate,
                                        endingReferralPeriodDate = x.endingReferralPeriodDate,
                                        IdCantiere = x.IdCantiere,
                                        delayDaysFattura = checkDelayDaysFattura(x),
                                    })
                                .SingleAsync(s => s.Id == idSaltura);
        }

        // PUT: api/Saltura/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /// <summary>
        /// Permette di aggiornare una saltura
        /// </summary>
        /// <param name="id"></param>
        /// <param name="saltura"></param>
        /// <returns></returns>
        [HttpPost("Update/{id}")]
        [Authorize(Roles = UserPolicy.Cantieri_U)]
        public async Task<IActionResult> PutSaltura(int id, Saltura saltura)
        {
            if (id != saltura.Id)
            {
                return BadRequest();
            }

            _context.Entry(saltura).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SalturaExists(id))
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

        // POST: api/Saltura
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /// <summary>
        /// Permette di creare una saltura
        /// </summary>
        /// <param name="saltura"></param>
        /// <returns></returns>
        [HttpPost]
        [Authorize(Roles = UserPolicy.Cantieri_U)]
        public async Task<ActionResult<Saltura>> PostSaltura(Saltura saltura)
        {
            _context.Saltura.Add(saltura);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetSaltura", new { id = saltura.Id }, new {
                                    dataEmissioneFattura = saltura.dataEmissioneFattura,
                                    descriptionNumberFattura = saltura.descriptionNumberFattura,
                                    fatturaState = saltura.fatturaState,
                                    delayDaysFattura = checkDelayDaysFattura(saltura),
                                    dataScadenzaFattura = saltura.dataScadenzaFattura,
                                    dataIncassoFattura = saltura.dataIncassoFattura,
                                    netAmountFattura = saltura.netAmountFattura,
                                    netAmountCP = saltura.netAmountCP,
                                    netAmountSAL = saltura.netAmountSAL,
                                    ivaAmountFattura = saltura.ivaAmountFattura,
                                    saltura.Id,
            });
        }


        // ///////////////////////////
        /// <summary>
        /// Permette di aggiungere un allegato alla saltura
        /// </summary>
        /// <param name="idSaltura"></param>
        /// <param name="formFiles"></param>
        /// <returns></returns>
        [HttpPost("PostAttachmentToSaltura/{idSaltura}")]
        [Authorize(Roles = UserPolicy.Cantieri_U)]
        public async Task<ActionResult<IEnumerable<_File>>> PostAttachmentsToNote([FromRoute] int idSaltura, [FromForm] IFormFile[] formFiles)
        {

            List<_File> files = new List<_File>();

            foreach (FormFile formFile in formFiles)
            {
                _File file = await FileManager.SaveNewFile(formFile, _config);
                await _context.File.AddAsync(file);
                files.Add(file);
            }
            await _context.SaveChangesAsync();
            
            int i = 0;
            List<AttachmentsSaltura> attachments = new List<AttachmentsSaltura>();
            foreach (_File f in files)
            {
                AttachmentsSaltura atcs = new AttachmentsSaltura();
                atcs.IdFile = f.Id;
                atcs.IdSaltura = idSaltura;
                atcs.order = i++; //Notare il POST ICREMENTO

                await _context.AttachmentsSaltura.AddAsync(atcs);
                attachments.Add(atcs);
            }
            await _context.SaveChangesAsync();

            return attachments.Select(f=>f.File).ToList();
        }

        /// <summary>
        /// Permette di ottenre gli allegati di una saltura
        /// </summary>
        /// <param name="idSaltura"></param>
        /// <returns></returns>
        [HttpGet("GetAttachments/{idSaltura}")]
        [Authorize(Roles = UserPolicy.Cantieri_U)]
        public async Task<ActionResult<IEnumerable<_File>>> findAttachedFilesAsync([FromRoute] int idSaltura)
        {
            return await _context.AttachmentsSaltura.Where(atcs => atcs.IdSaltura == idSaltura)
                                                    .Include(atcs => atcs.File)
                                                    .OrderBy(x => x.order)
                                                    .Select(atcs => atcs.File)
                                                    .ToListAsync();
        }

        // ////////////////////////////////

        // DELETE: api/Saltura/5
        /// <summary>
        /// Permette di eliminare una saltura
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost("Delete/{id}")]
        [Authorize(Roles = UserPolicy.Cantieri_U)]
        public async Task<IActionResult> DeleteSaltura(int id)
        {
            var saltura = await _context.Saltura.FindAsync(id);
            if (saltura == null)
            {
                return NotFound();
            }

            //Otteniamo la lista degli allegati
            List<AttachmentsSaltura> attachmentsSaltura_to_remvoe = await _context.AttachmentsSaltura.Where(atcs => atcs.IdSaltura == id).ToListAsync();
            //Cancelliamo gli allegati
            foreach (AttachmentsSaltura atc in attachmentsSaltura_to_remvoe)
            {
                _File attachment = await _context.File.FindAsync(atc.IdFile);
                try {
                    FileManager.DeleteFile(attachment, _config);
                } catch(System.IO.DirectoryNotFoundException){
                    ;//ok
                }
                //La cancellazione dei file comporta la cencellazione dalla tabella di pivto quindi tutto bene
                _context.File.Remove(attachment);
            }
            //Ora possiamo cancellare la saltura
            _context.Saltura.Remove(saltura);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        private bool SalturaExists(int id)
        {
            return _context.Saltura.Any(e => e.Id == id);
        }
    }
}
