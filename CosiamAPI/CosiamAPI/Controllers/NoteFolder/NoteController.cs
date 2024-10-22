using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CosiamAPI.Data;
using CosiamAPI.Models;
using CosiamAPI.Controllers;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using JWTAuthentication.Authentication;

namespace CosiamAPI.Controllers
{
    public static class NoteServices
    {
        ///////////////////////////////////////////////////////////////////////////
        //     FUNZIONI DEDICATE AL MANAGEMENT INTERNO DEL CONTROLLER      ///////
        ///////////////////////////////////////////////////////////////////////////

        /// <summary>
        /// Trova tutte le tag (personale) legate ad una nota specificata
        /// </summary>
        /// <param name="Id"></param>
        /// <param name="_context"></param>
        /// <returns></returns>
        public static async Task<List<Personale>> FindTaggedPersonale(int Id, ApplicationDbContext _context)
        {
            List<PersonaleResponsabileNota> tn = await _context.PersonaleResponsabileDiNota.Where(t => t.IdNote == Id).ToListAsync();
            return await _context.Personale.Where(p => tn.Select(tns => tns.IdPersonale).Contains(p.Id)).ToListAsync();
        }

        /// <summary>
        /// Finds all the files related to that note
        /// </summary>
        /// <param name="Id"></param>
        /// <param name="_context"></param>
        /// <param name="_config"></param>
        /// <returns></returns>
        public static async Task<List<_File>> FindAttachedFiles(int Id, ApplicationDbContext _context, IConfiguration _config)
        {
            List<AttachmentsNota> an = await _context.AttachmentsNota.Where(a => a.IdNota == Id).ToListAsync();
            return await _context.File.Where(f => an.Select(ans => ans.IdFile).Contains(f.Id)).ToListAsync();
        }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class NoteController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public NoteController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _config = configuration;
        }

       




        /////////////////////////////////////////////////////////////////////////////
        ///     API DI GET                                                   ////////
        /////////////////////////////////////////////////////////////////////////////


        // GET: api/Note
        [HttpGet]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_R)]
        public async Task<ActionResult<IEnumerable<Note>>> GetNote()
        {
            return await _context.Note.ToListAsync();
        }

        // GET: api/Note/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_R)]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            var note = await _context.Note.FindAsync(id);

            if (note == null)
            {
                return NotFound();
            }

            return note;
        }

        /// <summary>
        /// Ritorna tutte le tag (personale) legate ad una nota specificata
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        //GET: api/Cantiere/NoteDiCantiere
        [HttpGet("Tags/{Id}")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_R)]
        public async Task<ActionResult<IEnumerable<Personale>>> getTagsAsync(int Id)
        {
            return await NoteServices.FindTaggedPersonale(Id, _context);
        }


        /// <summary>
        /// Returns all the files related to the given note
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        [HttpGet("Attachments")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_R)]
        public async Task<ActionResult<IEnumerable<_File>>> findAttachedFilesAsync(int Id)
        {
            return await NoteServices.FindAttachedFiles(Id, _context, _config);
        }

        


        /////////////////////////////////////////////////////////////////////////////
        ///     API DI PUT                                                   ////////
        /////////////////////////////////////////////////////////////////////////////
        // PUT: api/Note/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_U)]
        public async Task<IActionResult> PutNote(int id, Note note)
        {
            if (id != note.Id)
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
                if (!NoteExists(id))
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





        /////////////////////////////////////////////////////////////////////////////
        ///     API DI POST                                                  ////////
        /////////////////////////////////////////////////////////////////////////////

        // POST: api/Note
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_C)]
        public async Task<ActionResult<Note>> PostNote(Note note)
        {
            _context.Note.Add(note);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetNote", new { id = note.Id }, note);
        }

        [HttpPost("PostAttachmentsToNote/{idNote}")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_U)]
        public async Task<ActionResult<IEnumerable< AttachmentsNota>>> PostAttachmentsToNote([FromRoute] int idNote, [FromForm] IFormFile[] formFiles)
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
                atcn.IdNota = idNote;

                await _context.AttachmentsNota.AddAsync(atcn);
                attachments.Add(atcn);
            }
            await _context.SaveChangesAsync();

            return attachments;
        }

        [HttpPost("PostResponsiblesToNote/{idNote}")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_U)]
        public async Task<IActionResult> PostResponsibleToNote([FromRoute] int idNote, List<int> idPersonale)
        {

            foreach(int p in idPersonale)
            {
                if(! await _context.Personale.AnyAsync(pp => pp.Id == p))
                {
                    return NoContent();
                }
            }

            foreach (int p in idPersonale)
            {
                PersonaleResponsabileNota prn = new PersonaleResponsabileNota();

                prn.IdPersonale = p;
                prn.IdNote = idNote;

                await _context.PersonaleResponsabileDiNota.AddAsync(prn);
            }
            await _context.SaveChangesAsync();

            return StatusCode(200);
        }


        //##########################################################################//
        //                      POST PER Update                                     //
        //##########################################################################//

        [HttpPost("UpdateNote")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_U)]
        public async Task<ActionResult<Note>> UpdateNote(Note note)
        {
            _context.Note.Update(note);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetNote", new { id = note.Id }, note);
        }
        /// <summary>
        /// Prima elimina i vecchi collegamenti poi ne crea di nuovi (metodo più svelto)
        /// </summary>
        /// <param name="idNote"></param>
        /// <param name="formFiles"></param>
        /// <returns></returns>
        [HttpPost("UpdateAttachmentsToNote/{idNote}")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_U)]
        public async Task<ActionResult<IEnumerable<AttachmentsNota>>> UpdateAttachmentsToNote([FromRoute] int idNote, [FromBody] List<IFormFile> formFiles)
        {

            List<_File> files = new List<_File>();

            List<AttachmentsNota> atcn = await _context.AttachmentsNota.Where(atc => atc.IdNota == idNote).ToListAsync();

            foreach( AttachmentsNota atc in atcn)
            {
                FileManager.DeleteFile(atc.File, _config);
                _context.File.Remove(atc.File);
                _context.AttachmentsNota.Remove(atc);
            }
            await _context.SaveChangesAsync();

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
                AttachmentsNota atcn1 = new AttachmentsNota();

                atcn1.IdFile = f.Id;
                atcn1.IdNota = idNote;

                await _context.AttachmentsNota.AddAsync(atcn1);
                attachments.Add(atcn1);
            }
            await _context.SaveChangesAsync();

            return attachments;
        }

        //##########################################################################//
        //                      POST PER ELIMINAZIONE                               //
        //##########################################################################//

        [HttpPost("/DeleteMultipleNotes")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_D)]
        public async Task<IEnumerable<int>> DeleteNoteRange(int[] listaId)
        {

            foreach (int id in listaId)
            {
                var note = await _context.Note.FindAsync(id);
                if (note == null)
                {
                    continue;
                }

                //Unlinking note from cantieri
                List<ListaNoteDiCantiere> lnc_to_remove = await _context.ListaNoteDiCantiere.Where(lnc => lnc.IdNote == id).ToListAsync();
                _context.ListaNoteDiCantiere.RemoveRange(lnc_to_remove);
                //Unlinking note from personale responsabile di nota
                List<PersonaleResponsabileNota> prn_to_remove = await _context.PersonaleResponsabileDiNota.Where(prn => prn.IdNote == id).ToListAsync();
                _context.PersonaleResponsabileDiNota.RemoveRange(prn_to_remove);
                //Unlinking note from files and deleting relative files 
                List<AttachmentsNota> attachmentsNotas_to_remvoe = await _context.AttachmentsNota.Where(atcn => atcn.IdNota == id).ToListAsync();

                foreach (AttachmentsNota atc in attachmentsNotas_to_remvoe)
                {
                    _File attachment = await _context.File.FindAsync(atc.IdFile);
                    FileManager.DeleteFile(attachment, _config);
                    _context.File.Remove(attachment);
                    _context.SaveChanges();
                }

                
                 _context.Note.RemoveRange(_context.ThreadNota.Where(t => t.IdReferredNote == id)
                                                   .Include(tt => tt.ReferringNote)
                                                   .Select(ttt => ttt.ReferringNote));
                

                _context.Note.Remove(note);
                await _context.SaveChangesAsync();
            }

            return listaId.ToList();
        }





        /////////////////////////////////////////////////////////////////////////////
        ///     API DI DELETE                                                ////////
        /////////////////////////////////////////////////////////////////////////////

        // DELETE: api/Note/5
        [HttpDelete("{id}")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_D)]
        public async Task<IActionResult> DeleteNote([FromRoute] int id)
        {
            var note = await _context.Note.FindAsync(id);
            if (note == null)
            {
                return NotFound();
            }

            //Unlinking note from cantieri
            List<ListaNoteDiCantiere> lnc_to_remove = await _context.ListaNoteDiCantiere.Where(lnc => lnc.IdNote == id).ToListAsync();
            _context.ListaNoteDiCantiere.RemoveRange(lnc_to_remove);
            //Unlinking note from personale responsabile di nota
            List<PersonaleResponsabileNota> prn_to_remove = await _context.PersonaleResponsabileDiNota.Where(prn => prn.IdNote == id).ToListAsync();
            _context.PersonaleResponsabileDiNota.RemoveRange(prn_to_remove);
            //Unlinking note from files and deleting relative files 
            List<AttachmentsNota> attachmentsNotas_to_remvoe = await _context.AttachmentsNota.Where(atcn => atcn.IdNota == id).ToListAsync();
            
            foreach(AttachmentsNota atc in attachmentsNotas_to_remvoe)
            {
                _File attachment = await _context.File.FindAsync(atc.IdFile);
                FileManager.DeleteFile(attachment, _config);
                _context.File.Remove(attachment);
                _context.SaveChanges();
            }

            _context.Note.Remove(note);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool NoteExists(int id)
        {
            return _context.Note.Any(e => e.Id == id);
        }
    }
}
