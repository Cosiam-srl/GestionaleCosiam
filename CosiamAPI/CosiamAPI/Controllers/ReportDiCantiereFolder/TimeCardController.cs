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
    public class TimeCardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TimeCardController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/TimeCard
        [HttpGet]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
        public async Task<ActionResult<IEnumerable<TimeCard>>> GetTimeCard()
        {
            return await _context.TimeCard.ToListAsync();
        }

        // GET: api/TimeCard/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
        public async Task<ActionResult<TimeCard>> GetTimeCard(int id)
        {
            var timeCard = await _context.TimeCard.FindAsync(id);

            if (timeCard == null)
            {
                return NotFound();
            }

            return timeCard;
        }

        // PUT: api/TimeCard/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<IActionResult> PutTimeCard(int id, TimeCard timeCard)
        {
            if (id != timeCard.Id)
            {
                return BadRequest();
            }

            _context.Entry(timeCard).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TimeCardExists(id))
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

        // POST: api/TimeCard
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<ActionResult<TimeCard>> PostTimeCard(TimeCard timeCard)
        {
            _context.TimeCard.Add(timeCard);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTimeCard", new { id = timeCard.Id }, timeCard);
        }

        // DELETE: api/TimeCard/5
        [HttpDelete("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<IActionResult> DeleteTimeCard(int id)
        {
            var timeCard = await _context.TimeCard.FindAsync(id);
            if (timeCard == null)
            {
                return NotFound();
            }

            _context.TimeCard.Remove(timeCard);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TimeCardExists(int id)
        {
            return _context.TimeCard.Any(e => e.Id == id);
        }
    }
}
