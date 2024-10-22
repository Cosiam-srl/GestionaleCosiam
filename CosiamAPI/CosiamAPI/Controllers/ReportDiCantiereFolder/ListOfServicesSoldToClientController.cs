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
    public class ListOfServicesSoldToClientController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ListOfServicesSoldToClientController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ListOfServicesSoldToClient
        [HttpGet]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
        public async Task<ActionResult<IEnumerable<ListOfServicesSoldToClient>>> GetListOfServicesSoldToClient()
        {
            return await _context.ListOfServicesSoldToClient.ToListAsync();
        }

        // GET: api/ListOfServicesSoldToClient/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
        public async Task<ActionResult<ListOfServicesSoldToClient>> GetListOfServicesSoldToClient(int id)
        {
            var listOfServicesSoldToClient = await _context.ListOfServicesSoldToClient.FindAsync(id);

            if (listOfServicesSoldToClient == null)
            {
                return NotFound();
            }

            return listOfServicesSoldToClient;
        }

        // PUT: api/ListOfServicesSoldToClient/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<IActionResult> PutListOfServicesSoldToClient(int id, ListOfServicesSoldToClient listOfServicesSoldToClient)
        {
            if (id != listOfServicesSoldToClient.Id)
            {
                return BadRequest();
            }

            _context.Entry(listOfServicesSoldToClient).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ListOfServicesSoldToClientExists(id))
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

        // POST: api/ListOfServicesSoldToClient
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<ActionResult<ListOfServicesSoldToClient>> PostListOfServicesSoldToClient(ListOfServicesSoldToClient listOfServicesSoldToClient)
        {
            _context.ListOfServicesSoldToClient.Add(listOfServicesSoldToClient);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetListOfServicesSoldToClient", new { id = listOfServicesSoldToClient.Id }, listOfServicesSoldToClient);
        }

        // DELETE: api/ListOfServicesSoldToClient/5
        [HttpDelete("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<IActionResult> DeleteListOfServicesSoldToClient(int id)
        {
            var listOfServicesSoldToClient = await _context.ListOfServicesSoldToClient.FindAsync(id);
            if (listOfServicesSoldToClient == null)
            {
                return NotFound();
            }

            _context.ListOfServicesSoldToClient.Remove(listOfServicesSoldToClient);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ListOfServicesSoldToClientExists(int id)
        {
            return _context.ListOfServicesSoldToClient.Any(e => e.Id == id);
        }
    }
}
