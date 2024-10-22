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
    public class VehicleCardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VehicleCardController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/VehicleCard
        [HttpGet]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
        public async Task<ActionResult<IEnumerable<VehicleCard>>> GetVehicleCard()
        {
            return await _context.VehicleCard.ToListAsync();
        }

        // GET: api/VehicleCard/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
        public async Task<ActionResult<VehicleCard>> GetVehicleCard(int id)
        {
            var vehicleCard = await _context.VehicleCard.FindAsync(id);

            if (vehicleCard == null)
            {
                return NotFound();
            }

            return vehicleCard;
        }

        // PUT: api/VehicleCard/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<IActionResult> PutVehicleCard(int id, VehicleCard vehicleCard)
        {
            if (id != vehicleCard.Id)
            {
                return BadRequest();
            }

            _context.Entry(vehicleCard).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VehicleCardExists(id))
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

        // POST: api/VehicleCard
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<ActionResult<VehicleCard>> PostVehicleCard(VehicleCard vehicleCard)
        {
            _context.VehicleCard.Add(vehicleCard);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetVehicleCard", new { id = vehicleCard.Id }, vehicleCard);
        }

        // DELETE: api/VehicleCard/5
        [HttpDelete("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<IActionResult> DeleteVehicleCard(int id)
        {
            var vehicleCard = await _context.VehicleCard.FindAsync(id);
            if (vehicleCard == null)
            {
                return NotFound();
            }

            _context.VehicleCard.Remove(vehicleCard);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool VehicleCardExists(int id)
        {
            return _context.VehicleCard.Any(e => e.Id == id);
        }
    }
}
