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
    public class ContrattoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ContrattoController(ApplicationDbContext context)
        {
            _context = context;
        }

        private double calcAdditionalNetImport(double grossAdditionalImport, double additionalChargesImport, double discount)
        {
            return grossAdditionalImport * (1 - discount / 100) + additionalChargesImport;
        }

        [HttpGet]
        [Authorize(Roles = UserPolicy.Clienti_R)]
        public async Task<ActionResult<IEnumerable<Object>>> GetSimpleContratto()
        {
            // if(!multiplePrezziari)
            //     return await _context.Contratto
            //         .Select(x => new {
            //             Id = x.Id,
            //             ShortDescription = x.shortDescription,
            //             Place = x.Place,
            //             ClienteId = x.Cliente.Id,
            //             ClienteName = x.Cliente.Name,
            //             SOA = x.soa,
            //             EndingDate = x.endingDate != DateTime.MinValue ? x.endingDate : null,
            //             x.totalNetAmount,
            //             OrderedContractImport = x.totalNetAmount - _context.Cantiere.Where(c => c.IdContratto == x.Id).
            //                                                         Sum(c => c.finalAmount),
            //             ResidualContractAmount = _context.Cantiere.Where(c => c.IdContratto == x.Id).
            //                                                         Sum(c => c.finalAmount),
            //         })
            //         .ToListAsync();
            return await _context.Contratto
                .Select(x => new
                {
                    Id = x.Id,
                    ShortDescription = x.shortDescription,
                    Place = x.Place,
                    ClienteId = x.Cliente.Id,
                    ClienteName = x.Cliente.Name,
                    SOA = x.soa,
                    EndingDate = x.endingDate != DateTime.MinValue ? x.endingDate : null,
                    x.totalNetAmount,
                    OrderedContractImport = x.totalNetAmount - _context.Cantiere.Where(c => c.IdContratto == x.Id).
                                                                Sum(c => c.finalAmount),
                    ResidualContractAmount = _context.Cantiere.Where(c => c.IdContratto == x.Id).
                                                                Sum(c => c.finalAmount),
                    prezzari_id = _context.ListaPrezzariContratto.Where(x2 => x2.IdContratto == x.Id).Select(x2 => x2.IdPrezziario).ToArray(),
                    status = x.status,
                })
                .ToListAsync();

        }

        // GET: api/Contratto/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.Contratti_R)]
        public async Task<ActionResult<ContrattoView>> GetContratto(int id)
        {
            ContrattoView contratto = new ContrattoView();
            contratto.setContratto(await _context.Contratto.Include(x => x.ValoriAggiuntivi).SingleOrDefaultAsync(x => x.Id == id));

            if (contratto == null)
            {
                return NotFound();
            }

            contratto.setPrezzariIds(await _context.ListaPrezzariContratto.Where(x2 => x2.IdContratto == contratto.Id).Select(x2 => x2.IdPrezziario).ToArrayAsync());
            contratto.additionalNetAmount = calcAdditionalNetImport(contratto.additionalGrossWorkAmount, contratto.additionalChargesAmount, contratto.discount);
            return contratto;
        }

        // PUT: api/Contratto/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("Update/{id}")]
        [Authorize(Roles = UserPolicy.Contratti_U)]
        public async Task<IActionResult> PutContratto([FromRoute] int id, [FromBody] ContrattoView contrattoToModify)
        {
            if (id != contrattoToModify.Id)
            {
                return BadRequest();
            }

            Contratto contratto = contrattoToModify.getContratto();
            contratto.additionalNetAmount = calcAdditionalNetImport(contratto.additionalGrossWorkAmount, contratto.additionalChargesAmount, contratto.discount);

            await UpdateValoriAggiuntiviContrattoAsyncNoSave(contratto.Id, contratto.ValoriAggiuntivi);

            if (contrattoToModify.isMultiPrezziario())
            {

                int[] prezziari_id = contrattoToModify.getPrezzariIds();

                if (_context.PrezziarioCliente.Where(x => prezziari_id.Any(x2 => x2 == x.Id)).Count() != prezziari_id.Count()) //controllo che esistano tutti i prezzari indicati
                    return NotFound();

                _context.Entry(contratto).State = EntityState.Modified;

                var existing_prezziari_to_delete = await _context.ListaPrezzariContratto.Where(x => x.IdContratto == id)
                                                                                .Where(x => !prezziari_id.Any(x2 => x2 == x.Id))
                                                                                .ToArrayAsync();

                var prezzari_to_create = prezziari_id.Where(x => !_context.ListaPrezzariContratto.Any(x2 => x2.Id == x)).ToArray();

                _context.ListaPrezzariContratto.RemoveRange(existing_prezziari_to_delete);

                await _context.ListaPrezzariContratto.AddRangeAsync(
                                                prezziari_id.Select(x => new ListaPrezzariContratto()
                                                {
                                                    IdContratto = id,
                                                    IdPrezziario = x
                                                }).ToList()
                                                );
            }
            try
            {

                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ContrattoExists(id))
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

        private async Task UpdateValoriAggiuntiviContrattoAsyncNoSave(int idContratto, ICollection<ValoriAggiuntivi> valoriAggiuntivi)
        {
            foreach (var valAgg in valoriAggiuntivi)
            {
                valAgg.Id = 0;
                valAgg.IdContratto = idContratto;
                valAgg.Contratto = null;
                valAgg.Cantiere = null;
            }

            var existingValAggiuntiviContratto = _context.ValoriAggiuntiviCantiereContratto.Where(x => x.IdContratto == idContratto);
            _context.ValoriAggiuntiviCantiereContratto.RemoveRange(existingValAggiuntiviContratto);
            await _context.AddRangeAsync(valoriAggiuntivi);
        }

        // POST: api/Contratto
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.Contratti_C)]
        public async Task<ActionResult<Contratto>> PostContratto(ContrattoView newContratto)
        {
            Contratto contratto = newContratto.getContratto();

            var valoriAggiuntiviCantiere = contratto.ValoriAggiuntivi;
            contratto.ValoriAggiuntivi = null;


            _context.Contratto.Add(contratto);

            contratto.additionalNetAmount = calcAdditionalNetImport(contratto.additionalGrossWorkAmount, contratto.additionalChargesAmount, contratto.discount);
            await _context.SaveChangesAsync();


            foreach (var va in valoriAggiuntiviCantiere)
                va.IdContratto = contratto.Id;
            await _context.ValoriAggiuntiviCantiereContratto.AddRangeAsync(valoriAggiuntiviCantiere);
            await _context.SaveChangesAsync();


            if (newContratto.isMultiPrezziario())
            {
                int[] prezziari_id = newContratto.getPrezzariIds();

                if (_context.PrezziarioCliente.Where(x => prezziari_id.Any(x2 => x2 == x.Id)).Count() != prezziari_id.Count()) //controllo che esistano tutti i prezzari indicati
                    return NotFound();

                await _context.ListaPrezzariContratto.AddRangeAsync(
                                                prezziari_id.Select(x => new ListaPrezzariContratto()
                                                {
                                                    IdContratto = contratto.Id,
                                                    IdPrezziario = x
                                                }).ToList()
                                                );

                await _context.SaveChangesAsync();
            }
            return CreatedAtAction("GetContratto", new { id = contratto.Id }, contratto);
        }

        // DELETE: api/Contratto/5
        [HttpPost("Delete/{id}")]
        [Authorize(Roles = UserPolicy.Contratti_D)]
        public async Task<IActionResult> DeleteContratto(int id)
        {
            var contratto = await _context.Contratto.FindAsync(id);
            if (contratto == null)
            {
                return NotFound();
            }

            var valoriAggiuntiviContratto = _context.ValoriAggiuntiviCantiereContratto.Where(x => x.IdContratto == id).AsEnumerable();
            _context.ValoriAggiuntiviCantiereContratto.RemoveRange(valoriAggiuntiviContratto);
            
            _context.Contratto.Remove(contratto);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ContrattoExists(int id)
        {
            return _context.Contratto.Any(e => e.Id == id);
        }
    }
}
