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
    public class DPIController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DPIController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/DPI
        [HttpGet]
        [Authorize(Roles = UserPolicy.Attrezzatura_R)]
        public async Task<ActionResult<IEnumerable<DPI>>> GetRisorseStrumentali()
        {
            return await _context.DPI.ToListAsync();
        }

        // GET: api/DPI/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.Attrezzatura_R)]
        public async Task<ActionResult<DPI>> GetRisorseStrumentali(int id)
        {
            var DPI = await _context.DPI.FindAsync(id);

            if (DPI == null)
            {
                return NotFound();
            }

            return DPI;
        }

        // PUT: api/DPI/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("update/{id}")]
        [Authorize(Roles = UserPolicy.Attrezzatura_U)]
        public async Task<IActionResult> PutRisorseStrumentali(int id, DPI DPI)
        {
            if (id != DPI.Id)
            {
                return BadRequest();
            }

            _context.Entry(DPI).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RisorseStrumentaliExists(id))
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

        // POST: api/DPI
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.Attrezzatura_C)]
        public async Task<ActionResult<DPI>> PostRisorseStrumentali(DPI DPI)
        {
            _context.DPI.Add(DPI);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRisorseStrumentali", new { id = DPI.Id }, DPI);
        }

        // DELETE: api/DPI/5
        [HttpPost("Delete/{id}")]
        [Authorize(Roles = UserPolicy.Attrezzatura_D)]
        public async Task<IActionResult> DeleteRisorseStrumentali(int id)
        {
            var DPI = await _context.DPI.FindAsync(id);
            if (DPI == null)
            {
                return NotFound();
            }

            _context.DPI.Remove(DPI);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RisorseStrumentaliExists(int id)
        {
            return _context.DPI.Any(e => e.Id == id);
        }

        [HttpPost("import")]
        [Authorize(Roles = UserPolicy.Attrezzatura_C)]
        public async Task<DemoResponse<List<DPI>>> Import(IFormFile formFile, System.Threading.CancellationToken cancellationToken)
        {

            if (!System.IO.Path.GetExtension(formFile.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
            {
                return DemoResponse<List<DPI>>.GetResult(-1, "Not Support file extension");
            }

            var list = new List<DPI>();

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

                        DPI rs = new DPI();
                        try
                        {
                            rs.Position = worksheet.Cells[row, 2].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            rs.Position = null;
                        }

                        try
                        {
                            rs.Description = worksheet.Cells[row, 3].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            rs.Description = null;
                        }

                        try
                        {
                            rs.UM = worksheet.Cells[row, 4].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            rs.UM = null;
                        }

                        try
                        {
                            rs.Quantity = int.Parse(worksheet.Cells[row, 5].Value.ToString().Trim());
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            rs.Quantity = null;
                        }
                        catch (System.FormatException)
                        {
                            rs.Quantity = null;
                        }
                        try
                        {
                            rs.cost = double.Parse(worksheet.Cells[row, 6].Value.ToString().Trim());
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            rs.cost = null;
                        }
                        catch (System.FormatException)
                        {
                            rs.cost = null;
                        }
                        try
                        {
                            rs.MaintenanceExpiration = DateTime.Parse(worksheet.Cells[row, 7].Value.ToString().Trim());
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            rs.MaintenanceExpiration = null;
                        }
                        catch (System.FormatException)
                        {
                            rs.MaintenanceExpiration = null;
                        }
                        try
                        {
                            rs.Usable = bool.Parse(worksheet.Cells[row, 7].Value.ToString().Trim());
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            rs.Usable = null;
                        }
                        try
                        {
                            rs.Notes = worksheet.Cells[row, 7].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            rs.Notes = null;
                        }

                        if (changed == true)
                            list.Add(rs);

                    }
                }
            }
            for (int i = 0; i < list.Count - 1; i++)
            {
                DPI p = list[i];
                _context.DPI.Add(p);
            }
            await _context.SaveChangesAsync();

            return DemoResponse<List<DPI>>.GetResult(0, "OK", list);
        }
    }
}
