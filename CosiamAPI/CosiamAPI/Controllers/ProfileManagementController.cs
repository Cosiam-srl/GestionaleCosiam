using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CosiamAPI.Data;
using CosiamAPI.Models.Security;

namespace CosiamAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileManagementController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProfileManagementController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ProfileManagement
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProfileManagement>>> GetProfileManagement()
        {
            return await _context.ProfileManagement.ToListAsync();
        }

        // GET: api/ProfileManagement/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProfileManagement>> GetProfileManagement(int id)
        {
            var profileManagement = await _context.ProfileManagement.FindAsync(id);

            if (profileManagement == null)
            {
                return NotFound();
            }

            return profileManagement;
        }

        // PUT: api/ProfileManagement/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProfileManagement(int id, ProfileManagement profileManagement)
        {
            if (id != profileManagement.Id)
            {
                return BadRequest();
            }

            _context.Entry(profileManagement).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProfileManagementExists(id))
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

        // POST: api/ProfileManagement
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ProfileManagement>> PostProfileManagement(ProfileManagement profileManagement)
        {
            _context.ProfileManagement.Add(profileManagement);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetProfileManagement", new { id = profileManagement.Id }, profileManagement);
        }

        // DELETE: api/ProfileManagement/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProfileManagement(int id)
        {
            var profileManagement = await _context.ProfileManagement.FindAsync(id);
            if (profileManagement == null)
            {
                return NotFound();
            }

            _context.ProfileManagement.Remove(profileManagement);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProfileManagementExists(int id)
        {
            return _context.ProfileManagement.Any(e => e.Id == id);
        }
    }
}
