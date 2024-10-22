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
    public class ListOfGoodsAndServicesInUseController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ListOfGoodsAndServicesInUseController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ListOfGoodsAndServicesInUse
        [HttpGet]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
        public async Task<ActionResult<IEnumerable<ListOfGoodsAndServicesInUse>>> GetListOfGoodsAndServicesInUse()
        {
            return await _context.ListOfGoodsAndServicesInUse.ToListAsync();
        }

        // GET: api/ListOfGoodsAndServicesInUse/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
        public async Task<ActionResult<ListOfGoodsAndServicesInUse>> GetListOfGoodsAndServicesInUse(int id)
        {
            var listOfGoodsAndServicesInUse = await _context.ListOfGoodsAndServicesInUse.FindAsync(id);

            if (listOfGoodsAndServicesInUse == null)
            {
                return NotFound();
            }

            return listOfGoodsAndServicesInUse;
        }

        // PUT: api/ListOfGoodsAndServicesInUse/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<IActionResult> PutListOfGoodsAndServicesInUse(int id, ListOfGoodsAndServicesInUse listOfGoodsAndServicesInUse)
        {
            if (id != listOfGoodsAndServicesInUse.Id)
            {
                return BadRequest();
            }

            _context.Entry(listOfGoodsAndServicesInUse).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ListOfGoodsAndServicesInUseExists(id))
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

        // POST: api/ListOfGoodsAndServicesInUse
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<ActionResult<ListOfGoodsAndServicesInUse>> PostListOfGoodsAndServicesInUse(ListOfGoodsAndServicesInUse listOfGoodsAndServicesInUse)
        {
            _context.ListOfGoodsAndServicesInUse.Add(listOfGoodsAndServicesInUse);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetListOfGoodsAndServicesInUse", new { id = listOfGoodsAndServicesInUse.Id }, listOfGoodsAndServicesInUse);
        }

        // DELETE: api/ListOfGoodsAndServicesInUse/5
        [HttpDelete("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<IActionResult> DeleteListOfGoodsAndServicesInUse(int id)
        {
            var listOfGoodsAndServicesInUse = await _context.ListOfGoodsAndServicesInUse.FindAsync(id);
            if (listOfGoodsAndServicesInUse == null)
            {
                return NotFound();
            }

            _context.ListOfGoodsAndServicesInUse.Remove(listOfGoodsAndServicesInUse);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ListOfGoodsAndServicesInUseExists(int id)
        {
            return _context.ListOfGoodsAndServicesInUse.Any(e => e.Id == id);
        }
    }
}
