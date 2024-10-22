using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CosiamAPI.Data;
using CosiamAPI.Models;
using JWTAuthentication.Authentication;
using Microsoft.AspNetCore.Authorization;

namespace CosiamAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventarioGeneraleController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InventarioGeneraleController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/InventarioGenerale
        [HttpGet]
        [Authorize(Roles = UserPolicy.Attrezzatura_R)]
        public async Task<ActionResult<IEnumerable<InventarioGenerale>>> GetInventarioGenerale()
        {
            return await _context.InventarioGenerale.ToListAsync();
        }

        // GET: api/InventarioGenerale/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.Attrezzatura_R)]
        public async Task<ActionResult<InventarioGenerale>> GetInventarioGenerale(int id)
        {
            var inventarioGenerale = await _context.InventarioGenerale.FindAsync(id);

            if (inventarioGenerale == null)
            {
                return NotFound();
            }

            return inventarioGenerale;
        }

        // PUT: api/InventarioGenerale/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("update/{id}")]
        [Authorize(Roles = UserPolicy.Attrezzatura_U)]
        public async Task<IActionResult> PutInventarioGenerale(int id, InventarioGenerale inventarioGenerale)
        {
            if (id != inventarioGenerale.Id)
            {
                return BadRequest();
            }

            _context.Entry(inventarioGenerale).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InventarioGeneraleExists(id))
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

        // POST: api/InventarioGenerale
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.Attrezzatura_C)]
        public async Task<ActionResult<InventarioGenerale>> PostInventarioGenerale(InventarioGenerale inventarioGenerale)
        {
            _context.InventarioGenerale.Add(inventarioGenerale);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetInventarioGenerale", new { id = inventarioGenerale.Id }, inventarioGenerale);
        }

        // DELETE: api/InventarioGenerale/5
        [HttpPost("Delete/{id}")]
        [Authorize(Roles = UserPolicy.Attrezzatura_D)]
        public async Task<IActionResult> DeleteInventarioGenerale(int id)
        {
            var inventarioGenerale = await _context.InventarioGenerale.FindAsync(id);
            if (inventarioGenerale == null)
            {
                return NotFound();
            }

            _context.InventarioGenerale.Remove(inventarioGenerale);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("DeleteMultiple")]
        [Authorize(Roles = UserPolicy.Attrezzatura_D)]
        public async Task<IActionResult> DeleteInventarioGenerale([FromBody] int[] ids)
        {
            foreach (int id in ids)
            {
                var inventarioGenerale = await _context.InventarioGenerale.FindAsync(id);
                if (inventarioGenerale == null)
                {
                    continue;
                }

                _context.InventarioGenerale.Remove(inventarioGenerale);
            }
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InventarioGeneraleExists(int id)
        {
            return _context.InventarioGenerale.Any(e => e.Id == id);
        }

        [HttpPost("import")]
        [Authorize(Roles = UserPolicy.Attrezzatura_C)]
        public async Task<DemoResponse<List<InventarioGenerale>>> Import(IFormFile formFile, System.Threading.CancellationToken cancellationToken)
        {

            if (!System.IO.Path.GetExtension(formFile.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
            {
                return DemoResponse<List<InventarioGenerale>>.GetResult(-1, "Not Support file extension");
            }

            var list = new List<InventarioGenerale>();

            using (var stream = new System.IO.MemoryStream())
            {
                await formFile.CopyToAsync(stream, cancellationToken);

                using (var package = new OfficeOpenXml.ExcelPackage(stream))
                {
                    OfficeOpenXml.ExcelWorksheet worksheet = package.Workbook.Worksheets[1];
                    var rowCount = worksheet.Dimension.Rows;

                    for (int row = 2; row <= rowCount; row++)
                    {
                        bool changed = false;

                        InventarioGenerale ig = new InventarioGenerale();
                        try
                        {
                            ig.Position = worksheet.Cells[row, 2].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            ig.Position = null;
                        }

                        try
                        {
                            ig.Description = worksheet.Cells[row, 3].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            ig.Description = null;
                        }

                        try
                        {
                            ig.Category = worksheet.Cells[row, 4].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            ig.Category = null;
                        }

                        try
                        {
                            ig.UM = worksheet.Cells[row, 5].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            ig.UM= null;
                        }

                        try
                        {
                            ig.Quantity = int.Parse(worksheet.Cells[row, 6].Value.ToString().Trim());
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            ig.Quantity = null;
                        }
                        catch (System.FormatException)
                        {
                            ig.Quantity = null;
                        }
                        try
                        {
                            ig.InventoryValue = float.Parse(worksheet.Cells[row, 7].Value.ToString().Trim());
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            ig.InventoryValue = null;
                        }
                        
                        if(changed == true)
                            list.Add(ig);

                    }
                }
            }
            for (int i = 0; i < list.Count - 1; i++)
            {
                InventarioGenerale p = list[i];
                _context.InventarioGenerale.Add(p);
            }
            await _context.SaveChangesAsync();

            return DemoResponse<List<InventarioGenerale>>.GetResult(0, "OK", list);
        }
    }
}
