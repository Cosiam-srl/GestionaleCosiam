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
    public class ClientiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ClientiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = UserPolicy.Clienti_R)]
        public async Task<ActionResult<IEnumerable<Object>>> GetClienti()
        {
            var clientis= await _context.Clienti
                .Select(x => new
                    {
                        x.Id, 
                        x.Name, 
                        x.PIVA, 
                        x.Telephone, 
                        x.Email, 
                        x.Type, 
                        x.payments,
                        ContrattiTotalAmount = _context.Contratto.Where(c => c.IdCliente == x.Id).Sum(c => c.totalNetAmount),
                    }
                )
                .ToListAsync();
            return clientis;
        }

        // GET: api/Clienti/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.Clienti_R)]
        public async Task<ActionResult<Clienti>> GetClienti(int id)
        {
            var clienti = await _context.Clienti.FindAsync(id);

            if (clienti == null)
            {
                return NotFound();
            }

            return clienti;
        }

        // PUT: api/Clienti/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = UserPolicy.Clienti_U)]
        public async Task<IActionResult> PutClienti(int id, Clienti clienti)
        {
            if (id != clienti.Id)
            {
                return BadRequest();
            }

            _context.Entry(clienti).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClientiExists(id))
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

        // POST: api/Clienti
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.Clienti_C)]
        public async Task<ActionResult<Clienti>> PostClienti(Clienti clienti)
        {
            _context.Clienti.Add(clienti);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetClienti", new { id = clienti.Id }, clienti);
        }

        [HttpPost("UpdateClienti")]
        [Authorize(Roles = UserPolicy.Clienti_U)]
        public async Task<ActionResult<Clienti>> UpdateClienti(Clienti clienti)
        {
            _context.Clienti.Update(clienti);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetClienti", new { id = clienti.Id }, clienti);
        }

        // DELETE: api/Clienti/5
        [HttpDelete("{id}")]
        [Authorize(Roles = UserPolicy.Clienti_D)]
        public async Task<IActionResult> DeleteClienti(int id)
        {
            var clienti = await _context.Clienti.FindAsync(id);
            if (clienti == null)
            {
                return NotFound();
            }

            _context.Clienti.Remove(clienti);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("Delete/{id}")]
        [Authorize(Roles = UserPolicy.Clienti_D)]
        public async Task<IActionResult> DeleteClientiPost(int id)
        {
            var clienti = await _context.Clienti.FindAsync(id);
            if (clienti == null)
            {
                return NotFound();
            }

            _context.Clienti.Remove(clienti);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ClientiExists(int id)
        {
            return _context.Clienti.Any(e => e.Id == id);
        }
    }
}
