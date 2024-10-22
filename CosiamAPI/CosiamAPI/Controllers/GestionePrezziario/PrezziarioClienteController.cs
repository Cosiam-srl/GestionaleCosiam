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
    public class PrezziarioClienteController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PrezziarioClienteController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/PrezziarioCliente
        /// <summary>
        /// Ritorna tutti i preziari
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Authorize(Roles = UserPolicy.Clienti_R)]
        public async Task<ActionResult<IEnumerable<Object>>> GetPrezziarioCliente()
        {
            return await _context.PrezziarioCliente.Select(
                x => new
                {
                    x.Id,
                    x.Name,
                    x.IdCliente,
                    x.Type,
                    x.ValidationYear,
                    x.DiscountPercentage,
                    clienteName = x.Cliente.Name,
                }
            ).ToListAsync();
        }

        // GET: api/PrezziarioCliente/5
        /// <summary>
        /// api/PrezziarioCliente/5
        /// Ritorna il singolo prezziario in base all'id passato.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.Clienti_R)]
        public async Task<ActionResult<PrezziarioCliente>> GetPrezziarioCliente(int id)
        {
            var prezziarioCliente = await _context.PrezziarioCliente.FindAsync(id);

            if (prezziarioCliente == null)
            {
                return NotFound();
            }

            return prezziarioCliente;
        }
        [HttpPost("getMultiple")]
        [Authorize(Roles = UserPolicy.Clienti_R)]
        public async Task<ActionResult<IEnumerable<PrezziarioCliente>>> GetPrezziarioCliente([FromBody] int[] ids)
        {
            var prezzariGenerali = await _context.PrezziarioCliente.Where(x => ids.Contains(x.Id)).ToArrayAsync();
            return prezzariGenerali;
        }

        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /// <summary>
        /// Aggiorna il prezziario con l'id combaciante a quello passato
        /// </summary>
        /// <param name="id"></param>
        /// <param name="prezziarioCliente"></param>
        /// <returns></returns>
        [HttpPost("Update/{id}")]
        [Authorize(Roles = UserPolicy.Clienti_U)]
        public async Task<IActionResult> PutPrezziarioCliente(int id, PrezziarioCliente prezziarioCliente)
        {
            if (id != prezziarioCliente.Id)
            {
                return BadRequest();
            }

            _context.Entry(prezziarioCliente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PrezziarioClienteExists(id))
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

        // POST: api/PrezziarioCliente
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /// <summary>
        /// Crea un nuovo prezziario
        /// </summary>
        /// <param name="prezziarioCliente"></param>
        /// <returns></returns>
        [HttpPost]
        [Authorize(Roles = UserPolicy.Clienti_C)]
        public async Task<ActionResult<PrezziarioCliente>> PostPrezziarioCliente(PrezziarioCliente prezziarioCliente)
        {
            _context.PrezziarioCliente.Add(prezziarioCliente);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPrezziarioCliente", new { id = prezziarioCliente.Id }, prezziarioCliente);
        }

        // DELETE: api/PrezziarioCliente/5
        /// <summary>
        /// Elimina il prezziario con l'id passato
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost("Delete/{id}")]
        [Authorize(Roles = UserPolicy.Clienti_D)]
        public async Task<IActionResult> DeletePrezziarioCliente(int id)
        {
            var prezziarioCliente = await _context.PrezziarioCliente.FindAsync(id);
            if (prezziarioCliente == null)
            {
                return NotFound();
            }

            _context.PrezziarioCliente.Remove(prezziarioCliente);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        /// ///////////////////// GESTIONE SCONTI CLIENTE /////////////////////

        /// <summary>
        /// Ritorna lo sconto relativo al prezziario con l'id passato a cui ha accesso il cliente con l'id = idCliente
        /// Se il cliente non ha accesso ad alcuno sconto, ritorna zero.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="idCLiente"></param>
        /// <returns></returns>
        [HttpGet("GetSconto/{id}")]
        public async Task<ActionResult<int>> GetScontoCliente(int id, [FromBody] int idCLiente)
        {
            ScontoCliente sc = await _context.ScontoCliente.Where(x => x.IdPrezziarioCliente == id).SingleAsync(x => x.IdCliente == idCLiente);
            if (sc == null)
                return 0;
            else
                return sc.Sconto;
        }

        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /// <summary>
        /// Imposta uno sconto su un determinato prezziario per un determinato cliente.
        /// Se non ci sono sconti impostati per quel prezziario per quel cliente, ne crea uno nuovo,
        /// altrimenti sovrascrive quello esistente.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="idCLiente"></param>
        /// <param name="sconto"></param>
        /// <returns></returns>
        [HttpPost("SetSconto/{id}/{idCliente}")]
        public async Task<IActionResult> PutScontoCliente([FromRoute] int id, [FromRoute] int idCLiente, int sconto)
        {
            {   // Se esiste già uno sconto per questo cliente lo aggiorno, altrimenti lo creo
                ScontoCliente sc = await _context.ScontoCliente.Where(x => x.IdPrezziarioCliente == id).SingleAsync(x => x.IdCliente == idCLiente);
                if (sc != null)
                {
                    sc.Sconto = sconto;
                    _context.Entry(sc).State = EntityState.Modified;

                    try
                    {
                        await _context.SaveChangesAsync();
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        if (!ScontoClienteExists(sc.Id))
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

            }

            {
                // A sto punto lo creo, stugaz
                ScontoCliente sc = new ScontoCliente();
                sc.IdCliente = idCLiente;
                sc.IdPrezziarioCliente = id;
                sc.Sconto = sconto;
                _context.ScontoCliente.Add(sc);

                return NoContent();
            }

        }

        /// <summary>
        /// Permette di ottenere tutti i servizi legati ad un determinato prezziario
        /// </summary>
        /// <param name="IdPrezziarioCliente"></param>
        /// <returns></returns>
        [HttpGet("Servizi/{IdPrezziarioCliente}")]
        public async Task<ActionResult<IEnumerable<ServizioCliente>>> GetServizioCliente([FromRoute] int IdPrezziarioCliente)
        {
            return await _context.ServizioCliente.Where(s => s.IdPrezziario == IdPrezziarioCliente).ToListAsync();
        }

        /// <summary>
        /// Permette di aggiornare le informazioni di un servizio
        /// </summary>
        /// <param name="id"></param>
        /// <param name="servizioCliente"></param>
        /// <returns></returns>
        [HttpPost("UpdateServizio/{id}")]
        public async Task<IActionResult> PutServizioCliente(int id, ServizioCliente servizioCliente)
        {
            if (id != servizioCliente.ID)
            {
                return BadRequest();
            }

            _context.Entry(servizioCliente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ServizioClienteExists(id))
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

        /// <summary>
        /// Permette di aggiungere un servizio ad un prezziario
        /// </summary>
        /// <param name="servizioCliente"></param>
        /// <returns></returns>
        [HttpPost("AggiungiServizio")]
        public async Task<ActionResult<ServizioCliente>> PostServizioCliente(ServizioCliente servizioCliente)
        {
            _context.ServizioCliente.Add(servizioCliente);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetServizioCliente", new { id = servizioCliente.ID }, servizioCliente);
        }

        /// <summary>
        /// P3rm3tt3 di eliminare un servizio da un prezziario
        /// </summary>
        /// <param name="idServizioCliente"></param>
        /// <returns></returns>
        [HttpPost("DeleteServizio/{idServizioCLiente}")]
        public async Task<IActionResult> DeleteServizioCliente(int idServizioCliente)
        {
            var servizioCliente = await _context.ServizioCliente.FindAsync(idServizioCliente);
            if (servizioCliente == null)
            {
                return NotFound();
            }

            _context.ServizioCliente.Remove(servizioCliente);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        // DELETE: api/ScontoCliente/5
        /// <summary>
        /// Elimina lo sconto per il cliente sul determinato prezziario
        /// </summary>
        /// <param name="id"></param>
        /// <param name="idCliente"></param>
        /// <returns></returns>
        [HttpPost("DeleteScontoCliente/{id}")]
        public async Task<IActionResult> DeleteScontoCliente(int id, int idCliente)
        {
            var scontoCliente = await _context.ScontoCliente.Where(sc => sc.IdPrezziarioCliente == id).SingleAsync(sc => sc.IdCliente == idCliente);
            if (scontoCliente == null)
            {
                return NotFound();
            }

            _context.ScontoCliente.Remove(scontoCliente);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// ALTRO
        private bool PrezziarioClienteExists(int id)
        {
            return _context.PrezziarioCliente.Any(e => e.Id == id);
        }
        private bool ScontoClienteExists(int id)
        {
            return _context.ScontoCliente.Any(e => e.Id == id);
        }

        private bool ServizioClienteExists(int id)
        {
            return _context.ServizioCliente.Any(e => e.ID == id);
        }
    }
}
