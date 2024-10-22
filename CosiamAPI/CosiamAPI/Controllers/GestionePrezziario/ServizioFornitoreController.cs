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

namespace CosiamAPI.Controllers.GestionePrezziario
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServizioFornitoreController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ServizioFornitoreController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ServizioFornitore
        /// <summary>
        /// Ritorna tutti i servizi forniti da tutti i fornitori
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Authorize(Roles = UserPolicy.Fornitori_R)]
        public async Task<ActionResult<IEnumerable<ServizioFornitore>>> GetServizioFornitore()
        {
            return await _context.ServizioFornitore.ToListAsync();
        }

        // GET: api/ServizioFornitore/5
        /// <summary>
        /// Ritorna tutti i servizi forniti da un determinato fornitore
        /// </summary>
        /// <param name="idFornitore"></param>
        /// <returns></returns>
        [HttpGet("{idFornitore}")]
        [Authorize(Roles = UserPolicy.Fornitori_R)]
        public async Task<ActionResult<IEnumerable<ServizioFornitore>>> GetServizioFornitore([FromRoute] int idFornitore)
        {
            return await _context.ServizioFornitore.Where(sf => sf.IdFornitore == idFornitore).ToListAsync();
        }

        // PUT: api/ServizioFornitore/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("Update/{id}")]
        [Authorize(Roles = UserPolicy.Fornitori_U)]
        public async Task<IActionResult> PutServizioFornitore(int id, ServizioFornitore servizioFornitore)
        {
            if (id != servizioFornitore.Id)
            {
                return BadRequest();
            }

            _context.Entry(servizioFornitore).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ServizioFornitoreExists(id))
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

        // POST: api/ServizioFornitore
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]        
        [Authorize(Roles = UserPolicy.Fornitori_C)]
        public async Task<ActionResult<ServizioFornitore>> PostServizioFornitore(ServizioFornitore servizioFornitore)
        {
            _context.ServizioFornitore.Add(servizioFornitore);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetServizioFornitore", new { id = servizioFornitore.Id }, servizioFornitore);
        }

        // DELETE: api/ServizioFornitore/5
        [HttpPost("Delete")]
        [Authorize(Roles = UserPolicy.Fornitori_D)]
        public async Task<IActionResult> DeleteServizioFornitore(int[] ids)
        {
            foreach (int id in ids)
            {
                var servizioFornitore = await _context.ServizioFornitore.FindAsync(id);
                if (servizioFornitore == null)
                {
                    return NotFound();
                }
            }

            foreach (int id in ids)
            {
                var servizioFornitore = await _context.ServizioFornitore.FindAsync(id);
                _context.ServizioFornitore.Remove(servizioFornitore);
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }

        private bool ServizioFornitoreExists(int id)
        {
            return _context.ServizioFornitore.Any(e => e.Id == id);
        }
    }
}
