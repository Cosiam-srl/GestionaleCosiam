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
    public class StrumentiDiMisuraController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StrumentiDiMisuraController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/StrumentiDiMisura
        [HttpGet]
        [Authorize(Roles = UserPolicy.Attrezzatura_R)]
        public async Task<ActionResult<IEnumerable<StrumentiDiMisura>>> GetStrumentiDiMisura()
        {
            return await _context.StrumentiDiMisura.ToListAsync();
        }

        // GET: api/StrumentiDiMisura/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.Attrezzatura_R)]
        public async Task<ActionResult<StrumentiDiMisura>> GetStrumentiDiMisura(int id)
        {
            var strumentiDiMisura = await _context.StrumentiDiMisura.FindAsync(id);

            if (strumentiDiMisura == null)
            {
                return NotFound();
            }

            return strumentiDiMisura;
        }

        // PUT: api/StrumentiDiMisura/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("update/{id}")]
        [Authorize(Roles = UserPolicy.Attrezzatura_U)]
        public async Task<IActionResult> PutStrumentiDiMisura(int id, StrumentiDiMisura strumentiDiMisura)
        {
            if (id != strumentiDiMisura.Id)
            {
                return BadRequest();
            }

            _context.Entry(strumentiDiMisura).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StrumentiDiMisuraExists(id))
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

        // POST: api/StrumentiDiMisura
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.Attrezzatura_C)]
        public async Task<ActionResult<StrumentiDiMisura>> PostStrumentiDiMisura(StrumentiDiMisura strumentiDiMisura)
        {
            _context.StrumentiDiMisura.Add(strumentiDiMisura);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetStrumentiDiMisura", new { id = strumentiDiMisura.Id }, strumentiDiMisura);
        }

        // DELETE: api/StrumentiDiMisura/5
        [HttpPost("Delete/{id}")]
        [Authorize(Roles = UserPolicy.Attrezzatura_D)]
        public async Task<IActionResult> DeleteStrumentiDiMisura(int id)
        {
            var strumentiDiMisura = await _context.StrumentiDiMisura.FindAsync(id);
            if (strumentiDiMisura == null)
            {
                return NotFound();
            }

            _context.StrumentiDiMisura.Remove(strumentiDiMisura);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("DeleteMultiple")]
        [Authorize(Roles = UserPolicy.Attrezzatura_D)]
        public async Task<IActionResult> DeleteMultipleStrumentiDiMisura(int[] ids)
        {
            foreach (int id in ids)
            {
                var strumentiDiMisura = await _context.StrumentiDiMisura.FindAsync(id);
                if (strumentiDiMisura == null)
                {
                    break;
                }

                _context.StrumentiDiMisura.Remove(strumentiDiMisura);
            }
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool StrumentiDiMisuraExists(int id)
        {
            return _context.StrumentiDiMisura.Any(e => e.Id == id);
        }

        [HttpPost("import")]
        [Authorize(Roles = UserPolicy.Attrezzatura_C)]
        public async Task<DemoResponse<List<StrumentiDiMisura>>> Import(IFormFile formFile, System.Threading.CancellationToken cancellationToken)
        {

            if (!System.IO.Path.GetExtension(formFile.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
            {
                return DemoResponse<List<StrumentiDiMisura>>.GetResult(-1, "Not Support file extension");
            }

            var list = new List<StrumentiDiMisura>();

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

                        StrumentiDiMisura sdm = new StrumentiDiMisura();
                        try
                        {
                            sdm.Type = worksheet.Cells[row, 2].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.Type = null;
                        }

                        try
                        {
                            sdm.Brand = worksheet.Cells[row, 3].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.Brand = null;
                        }

                        try
                        {
                            sdm.Model = worksheet.Cells[row, 4].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.Model = null;
                        }

                        try
                        {
                            sdm.SerialNumber = worksheet.Cells[row, 5].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.SerialNumber = null;
                        }
                        try
                        {
                            sdm.Registration = worksheet.Cells[row, 6].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.Registration = null;
                        }
                        try
                        {
                            sdm.Notes = worksheet.Cells[row, 7].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.Notes = null;
                        }
                        try
                        {
                            sdm.Status = worksheet.Cells[row, 7].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.Status = null;
                        }
                        try
                        {
                            sdm.Invoice = worksheet.Cells[row, 7].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.Invoice = null;
                        }
                        try
                        {
                            sdm.Idoneity = worksheet.Cells[row, 7].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.Idoneity = null;
                        }
                        try
                        {
                            sdm.TecSpecs = worksheet.Cells[row, 7].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.TecSpecs = null;
                        }
                        try
                        {
                            sdm.CalibrationExpiration = DateTime.Parse(worksheet.Cells[row, 7].Value.ToString().Trim());
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.CalibrationExpiration = null;
                        }
                        
                        if (changed == true)
                            list.Add(sdm);

                    }
                }
            }
            for (int i = 0; i < list.Count - 1; i++)
            {
                StrumentiDiMisura p = list[i];
                _context.StrumentiDiMisura.Add(p);
            }
            await _context.SaveChangesAsync();

            return DemoResponse<List<StrumentiDiMisura>>.GetResult(0, "OK", list);
        }
    }
}
