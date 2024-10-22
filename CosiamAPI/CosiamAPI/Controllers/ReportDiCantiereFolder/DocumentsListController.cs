using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CosiamAPI.Data;
using CosiamAPI.Models;
using Microsoft.AspNetCore.Authorization;
using JWTAuthentication.Authentication;

namespace CosiamAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsListController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DocumentsListController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/DocumentsList
        [HttpGet]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
        public async Task<ActionResult<IEnumerable<DocumentsList>>> GetDocumentsList()
        {
            return await _context.DocumentsList.ToListAsync();
        }

        // GET: api/DocumentsList/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
        public async Task<ActionResult<DocumentsList>> GetDocumentsList(int id)
        {
            var documentsList = await _context.DocumentsList.FindAsync(id);

            if (documentsList == null)
            {
                return NotFound();
            }

            return documentsList;
        }

        // PUT: api/DocumentsList/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<IActionResult> PutDocumentsList(int id, DocumentsList documentsList)
        {
            if (id != documentsList.Id)
            {
                return BadRequest();
            }

            _context.Entry(documentsList).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DocumentsListExists(id))
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

        // POST: api/DocumentsList
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<ActionResult<DocumentsList>> PostDocumentsList(DocumentsList documentsList)
        {
            _context.DocumentsList.Add(documentsList);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDocumentsList", new { id = documentsList.Id }, documentsList);
        }

        // DELETE: api/DocumentsList/5
        [HttpDelete("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<IActionResult> DeleteDocumentsList(int id)
        {
            var documentsList = await _context.DocumentsList.FindAsync(id);
            if (documentsList == null)
            {
                return NotFound();
            }

            _context.DocumentsList.Remove(documentsList);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DocumentsListExists(int id)
        {
            return _context.DocumentsList.Any(e => e.Id == id);
        }
    }
}
