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
    public class CommentiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CommentiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ThreadNota
        [HttpGet("{ReferredID}")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_R)]
        public async Task<ActionResult<IEnumerable<Note>>> GetThreadNota(int ReferredID)
        {
            return await _context.ThreadNota.Where(td => td.IdReferredNote == ReferredID)
                                            .Include(tdd => tdd.ReferringNote)
                                            .Select(tdd => tdd.ReferringNote)
                                            .ToListAsync();
        }

        // POST: api/ThreadNota
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("{IdReferredNote}")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_U)]
        public async Task<ActionResult<Note>> PostThreadNota([FromRoute]int IdReferredNote, Note nota)
        {
            _context.Note.Add(nota);
            await _context.SaveChangesAsync();

            ThreadNota td = new ThreadNota();
            td.IdReferredNote = IdReferredNote;
            td.IdReferringNote = nota.Id;
            _context.ThreadNota.Add(td);

            await _context.SaveChangesAsync();


            return nota;
        }

        private bool ThreadNotaExists(int id)
        {
            return _context.ThreadNota.Any(e => e.Id == id);
        }
    }
}
