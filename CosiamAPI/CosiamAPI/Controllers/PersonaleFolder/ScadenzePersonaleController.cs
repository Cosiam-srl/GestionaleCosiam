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

namespace CosiamAPI.Controllers.PersonaleFolder
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScadenzePersonaleController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public ScadenzePersonaleController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _config = configuration;
        }

        // GET: api/ScadenzePersonale
        [HttpGet]
        [Authorize(Roles = UserPolicy.Personale_R)]
        public async Task<ActionResult<IEnumerable<ScadenzePersonale>>> GetScadenzePersonale()
        {
            return await _context.ScadenzePersonale.ToListAsync();
        }

        // GET: api/ScadenzePersonale/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.Personale_R)]
        public async Task<ActionResult<ScadenzePersonale>> GetScadenzePersonale(int id)
        {
            var scadenzePersonale = await _context.ScadenzePersonale.FindAsync(id);

            if (scadenzePersonale == null)
            {
                return NotFound();
            }

            return scadenzePersonale;
        }

        // PUT: api/ScadenzePersonale/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("Update/{id}")]
        [Authorize(Roles = UserPolicy.Personale_U)]
        public async Task<IActionResult> PutScadenzePersonale(int id, ScadenzePersonale scadenzePersonale)
        {
            if (id != scadenzePersonale.Id)
            {
                return BadRequest();
            }
            _context.Entry(scadenzePersonale).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.ScadenzePersonale.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            // Ora aggiorno la sottovariabile della nota

            var note = scadenzePersonale.Nota;
            if (scadenzePersonale.IdNote != note.Id)
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
                if (!_context.ScadenzePersonale.Any(e => e.Id == id)) // Controllo che la nota esista davvero
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

        // POST: api/ScadenzePersonale
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.Personale_U)]
        public async Task<ActionResult<ScadenzePersonale>> PostScadenzePersonale(ScadenzePersonale scadenzePersonale)
        {
            _context.ScadenzePersonale.Add(scadenzePersonale);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetScadenzePersonale", new { id = scadenzePersonale.Id }, scadenzePersonale);
        }

        // DELETE: api/ScadenzePersonale/5
        [HttpPost("Delete")]
        [Authorize(Roles = UserPolicy.Personale_U)]
        public async Task<IActionResult> DeleteScadenzePersonale(int[] ids)
        {
            foreach(int id in ids)
            {
                var scadenzePersonale = await _context.ScadenzePersonale.FindAsync(id);
                if (scadenzePersonale == null)
                {
                    return NotFound();
                }
            }

            foreach (int id in ids)
            {
                var scadenzePersonale = await _context.ScadenzePersonale.FindAsync(id);
                var note = await _context.Note.FindAsync(scadenzePersonale.IdNote);
                var files = await _context.AttachmentsNota.Where(x => x.IdNota == note.Id).Include(at => at.File).Select(an => an.File).ToListAsync();

                foreach(_File file in files)
                    FileManager.DeleteFile(file, _config);

                _context.File.RemoveRange(files);
                _context.Note.Remove(note);
                _context.ScadenzePersonale.Remove(scadenzePersonale);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool ScadenzePersonaleExists(int id)
        {
            return _context.ScadenzePersonale.Any(e => e.Id == id);
        }

        [HttpPost("PostAttachmentsToScadenza/{idScadenza}")]
        [Authorize(Roles = UserPolicy.Personale_U + UserPolicy.Documenti_C)]
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
                atcn.IdNota = (await _context.ScadenzePersonale.FindAsync(idScadenza)).IdNote;

                await _context.AttachmentsNota.AddAsync(atcn);
                attachments.Add(atcn);
            }
            await _context.SaveChangesAsync();

            return attachments;
        }

        [HttpPost("DeleteAttachments")]
        [Authorize(Roles = UserPolicy.Personale_U + UserPolicy.Documenti_D)]
        public async Task<IActionResult> DeleteAttachmentsScadenzePersonale(int[] ids)
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
    }
}
