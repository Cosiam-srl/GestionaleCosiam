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

namespace CosiamAPI.Controllers.CantiereFolder
{
    [Route("api/[controller]")]
    [ApiController]
    public class ListaNoteDiCantiereController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ListaNoteDiCantiereController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ListaNoteDiCantiere
        [HttpGet]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_R)]
        public async Task<ActionResult<IEnumerable<ListaNoteDiCantiere>>> GetListaNoteDiCantiere()
        {
            return await _context.ListaNoteDiCantiere.ToListAsync();
        }

        // GET: api/ListaNoteDiCantiere/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_R)]
        public async Task<ActionResult<ListaNoteDiCantiere>> GetListaNoteDiCantiere(int id)
        {
            var listaNoteDiCantiere = await _context.ListaNoteDiCantiere.FindAsync(id);

            if (listaNoteDiCantiere == null)
            {
                return NotFound();
            }

            return listaNoteDiCantiere;
        }

        // PUT: api/ListaNoteDiCantiere/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_U)]
        public async Task<IActionResult> PutListaNoteDiCantiere(int id, ListaNoteDiCantiere listaNoteDiCantiere)
        {
            if (id != listaNoteDiCantiere.Id)
            {
                return BadRequest();
            }

            _context.Entry(listaNoteDiCantiere).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ListaNoteDiCantiereExists(id))
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

        // POST: api/ListaNoteDiCantiere
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_C)]
        public async Task<ActionResult<ListaNoteDiCantiere>> PostListaNoteDiCantiere(ListaNoteDiCantiere listaNoteDiCantiere)
        {
            _context.ListaNoteDiCantiere.Add(listaNoteDiCantiere);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetListaNoteDiCantiere", new { id = listaNoteDiCantiere.Id }, listaNoteDiCantiere);
        }

        // DELETE: api/ListaNoteDiCantiere/5
        [HttpDelete("{id}")]
        [Authorize(Roles = UserPolicy.NoteDiCantiere_D)]
        public async Task<IActionResult> DeleteListaNoteDiCantiere(int id)
        {
            var listaNoteDiCantiere = await _context.ListaNoteDiCantiere.FindAsync(id);
            if (listaNoteDiCantiere == null)
            {
                return NotFound();
            }

            _context.ListaNoteDiCantiere.Remove(listaNoteDiCantiere);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ListaNoteDiCantiereExists(int id)
        {
            return _context.ListaNoteDiCantiere.Any(e => e.Id == id);
        }
    }
}
