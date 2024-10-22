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
    public class FinancialCardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FinancialCardController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/FinancialCard
        [HttpGet]
        [Authorize(Roles = UserPolicy.Cantieri_R)]
        public async Task<ActionResult<IEnumerable<FinancialCard>>> GetFinancialCard()
        {
            return await _context.FinancialCard.ToListAsync();
        }

        // GET: api/FinancialCard/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.Cantieri_R)]
        public async Task<ActionResult<FinancialCard>> GetFinancialCard(int id)
        {
            var financialCard = await _context.FinancialCard.FindAsync(id);

            if (financialCard == null)
            {
                return NotFound();
            }

            return financialCard;
        }

        // PUT: api/FinancialCard/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("{id}/Update")]
        [Authorize(Roles = UserPolicy.Cantieri_U)]
        public async Task<IActionResult> PutFinancialCard(int id, FinancialCard financialCard)
        {
            if (id != financialCard.Id)
            {
                return BadRequest();
            }

            _context.Entry(financialCard).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FinancialCardExists(id))
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

        // POST: api/FinancialCard
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.Cantieri_U)]
        public async Task<ActionResult<FinancialCard>> PostFinancialCard(FinancialCard financialCard)
        {
            _context.FinancialCard.Add(financialCard);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetFinancialCard", new { id = financialCard.Id }, financialCard);
        }

        // DELETE: api/FinancialCard/5
        [HttpDelete("{id}")]
        [Authorize(Roles = UserPolicy.Cantieri_U)]
        public async Task<IActionResult> DeleteFinancialCard(int id)
        {
            var financialCard = await _context.FinancialCard.FindAsync(id);
            if (financialCard == null)
            {
                return NotFound();
            }

            _context.FinancialCard.Remove(financialCard);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FinancialCardExists(int id)
        {
            return _context.FinancialCard.Any(e => e.Id == id);
        }
    }
}
