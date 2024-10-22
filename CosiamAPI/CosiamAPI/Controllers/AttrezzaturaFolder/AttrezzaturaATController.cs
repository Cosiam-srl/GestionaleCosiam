using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CosiamAPI.Data;
using CosiamAPI.Models;
using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using JWTAuthentication.Authentication;

#nullable enable
namespace CosiamAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttrezzaturaATController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private IHostEnvironment CurrentEnvironment{ get; } 
        public AttrezzaturaATController(ApplicationDbContext context, IHostEnvironment env, IConfiguration configuration)
        {
            _context = context;
            CurrentEnvironment = env;
            _config = configuration;

        }

        /// /////// ADAPTERS //////////////////
        /// 
        // public async Task<IEnumerable<AttrezzaturaAT>> GetInventoryToAttrezzaturaAsync()
        // {
        //     return null;
        // }


        ////////////////////////// APIS

        // GET: api/AttrezzaturaAT
        [HttpGet]
        [Authorize(Roles = UserPolicy.Attrezzatura_R)]
        public async Task<ActionResult<IEnumerable<AttrezzaturaAT>>> GetAttrezzaturaAT()
        {
            return await _context.AttrezzaturaAT.ToListAsync();
        }


        public struct attrezzaturaAtView
        {
            public int Id { get; set; }
            public string? Type { get; set; }
            public string? Description { get; set; }
            public string? Builder { get; set; }
            public string? Model { get; set; }
            public string? LicensePlate { get; set; }
            public string? ProductionDate { get; set; }
            public string? PropertyOf { get; set; }
            public string? Idoneity { get; set; }
            public string? TechnicalSpecs { get; set; }
            public double? EstimatedValue { get; set; }
            public string? Position { get; set; }
            public string? Compatibility { get; set; }
            public string? Notes { get; set; }
            public string? Status { get; set; }
            public List<_File?>? listFile { get; set; }


            /// <summary>
            /// Questo codice è un cancro è da rifare ma sono a lezione
            /// </summary>
            /// <param name="attrezzo"></param>
            /// <param name="listFIle"></param>
            public attrezzaturaAtView(AttrezzaturaAT attrezzo, List<_File?> listFIle)
            {

                this.Id = attrezzo.Id;
                this.Type = attrezzo.Type;
                this.Description = attrezzo.Description;
                this.Builder = attrezzo.Builder;
                this.Model = attrezzo.Model;
                this.LicensePlate = attrezzo.LicensePlate;
                this.ProductionDate = attrezzo.ProductionDate;
                this.PropertyOf = attrezzo.PropertyOf;
                this.Idoneity = attrezzo.Idoneity;
                this.TechnicalSpecs = attrezzo.TechnicalSpecs;
                this.EstimatedValue = attrezzo.EstimatedValue;
                this.Position = attrezzo.Position;
                this.Compatibility = attrezzo.Compatibility;
                this.Notes = attrezzo.Notes;
                this.Status = attrezzo.Status;

                this.listFile = listFIle;
            }
        }
        // GET: api/AttrezzaturaAT/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.Attrezzatura_R)]
        public async Task<ActionResult<Object>> GetAttrezzaturaAT(int id)
        {
            var AttachmentsattrezzaturaAT = await _context.attachementsAttrezzatura.Where(x => x.IdAttrezzaturaAt == id)
                                                                .Select(x => x.File).ToListAsync();
            var attrezzo = await _context.AttrezzaturaAT.SingleAsync(x => x.Id == id);

            var returnValue = new attrezzaturaAtView(attrezzo, AttachmentsattrezzaturaAT);
            return returnValue;
        }

        // PUT: api/AttrezzaturaAT/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("update/{id}")]
        [Authorize(Roles = UserPolicy.Attrezzatura_U)]
        public async Task<IActionResult> PutAttrezzaturaAT(int id, AttrezzaturaAT attrezzaturaAT)
        {
            if (id != attrezzaturaAT.Id)
            {
                return BadRequest();
            }

            _context.Entry(attrezzaturaAT).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AttrezzaturaATExists(id))
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

        // POST: api/AttrezzaturaAT
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.Attrezzatura_C)]
        public async Task<ActionResult<AttrezzaturaAT>> PostAttrezzaturaAT(AttrezzaturaAT attrezzaturaAT)
        {
            _context.AttrezzaturaAT.Add(attrezzaturaAT);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAttrezzaturaAT", new { id = attrezzaturaAT.Id }, attrezzaturaAT);
        }

        [HttpPost("PostAttachmentsToAttrezzatura/{idAt}")]
        [Authorize(Roles = UserPolicy.Attrezzatura_U)]
        public async Task<ActionResult<IEnumerable<_File>>> PostAttachmentsToNote([FromRoute] int idAt, [FromForm] IFormFile[] formFiles)
        {

            List<_File> files = new List<_File>();

            foreach (FormFile formFile in formFiles)
            {
                _File file = await FileManager.SaveNewFile(formFile, _config);
                await _context.File.AddAsync(file);
                files.Add(file);
            }
            await _context.SaveChangesAsync();

            foreach (_File f in files)
            {
                attachementsAttrezzatura atcn = new attachementsAttrezzatura();

                atcn.IdFile = f.Id;
                atcn.IdAttrezzaturaAt = idAt;

                await _context.attachementsAttrezzatura.AddAsync(atcn);
            }
            await _context.SaveChangesAsync();

            return files;
        }


        // DELETE: api/AttrezzaturaAT/5
        [HttpPost("Delete/{id}")]
        [Authorize(Roles = UserPolicy.Attrezzatura_D)]
        public async Task<IActionResult> DeleteAttrezzaturaAT(int id)
        {
            var attrezzaturaAT = await _context.AttrezzaturaAT.FindAsync(id);
            if (attrezzaturaAT == null)
            {
                return NotFound();
            }

            _context.AttrezzaturaAT.Remove(attrezzaturaAT);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        [HttpPost("DeleteMultiple")]
        [Authorize(Roles = UserPolicy.Attrezzatura_D)]
        public async Task<IActionResult> DeleteMultipleAttrezzaturaAT([FromBody] int[] ids)
        {
            foreach (int id in ids)
            {
                var attrezzaturaAT = await _context.AttrezzaturaAT.FindAsync(id);
                if (attrezzaturaAT == null)
                {
                    continue;
                }

                _context.AttrezzaturaAT.Remove(attrezzaturaAT);
            }
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AttrezzaturaATExists(int id)
        {
            return _context.AttrezzaturaAT.Any(e => e.Id == id);
        }



        [HttpGet("export")]
        [Authorize(Roles = UserPolicy.Attrezzatura_R)]
        public async Task<IActionResult> Export(System.Threading.CancellationToken cancellationToken)
        {
            // query data from database  
            await Task.Yield();
            List<AttrezzaturaAT> list = await _context.AttrezzaturaAT.ToListAsync();
            var stream = new System.IO.MemoryStream();

            using (var package = new OfficeOpenXml.ExcelPackage(stream))
            {
                var workSheet = package.Workbook.Worksheets.Add("Sheet1");
                workSheet.Cells.LoadFromCollection(list, true);
            }
            stream.Position = 0;
            string excelName = $"Attrezzatura AT aggiornata al {DateTime.Now.ToString("yyyyMMddHHmmssfff")}.xlsx";

            //return File(stream, "application/octet-stream", excelName);  
            return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelName);
        }

        //[HttpPost("import")]
        //public async Task<DemoResponse<List<AttrezzaturaAT>>> Import(IFormFile formFile, System.Threading.CancellationToken cancellationToken)
        //{

        //    if (!System.IO.Path.GetExtension(formFile.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
        //    {
        //        return DemoResponse<List<AttrezzaturaAT>>.GetResult(-1, "Not Support file extension");
        //    }

        //    var list = new List<AttrezzaturaAT>();

        //    using (var stream = new System.IO.MemoryStream())
        //    {
        //        await formFile.CopyToAsync(stream, cancellationToken);

        //        using (var package = new OfficeOpenXml.ExcelPackage(stream))
        //        {
        //            OfficeOpenXml.ExcelWorksheet worksheet = package.Workbook.Worksheets[1];
        //            var rowCount = worksheet.Dimension.Rows;

        //            for (int row = 2; row <= rowCount; row++)
        //            {
        //                bool changed = false;

        //                AttrezzaturaAT at = new AttrezzaturaAT();
        //                try
        //                {
        //                    at.Type = worksheet.Cells[row, 2].Value.ToString().Trim();
        //                    changed = true;
        //                }
        //                catch (System.NullReferenceException)
        //                {
        //                    at.Type = null;
        //                }
        //                try
        //                {
        //                    at.Description = worksheet.Cells[row, 3].Value.ToString().Trim();
        //                    changed = true;
        //                }
        //                catch (System.NullReferenceException)
        //                {
        //                    at.Description = null;
        //                }

        //                try
        //                {
        //                    at.Builder = worksheet.Cells[row, 4].Value.ToString().Trim();
        //                    changed = true;
        //                }
        //                catch (System.NullReferenceException)
        //                {
        //                    at.Builder = null;
        //                }

        //                try
        //                {
        //                    at.Model = worksheet.Cells[row, 5].Value.ToString().Trim();
        //                    changed = true;
        //                }
        //                catch (System.NullReferenceException)
        //                {
        //                    at.Model = null;
        //                }

        //                try
        //                {
        //                    at.LicensePlate = worksheet.Cells[row, 6].Value.ToString().Trim();
        //                    changed = true;
        //                }
        //                catch (System.NullReferenceException)
        //                {
        //                    at.LicensePlate = null;
        //                }
        //                try
        //                {
        //                    at.ProductionDate = worksheet.Cells[row, 7].Value.ToString().Trim();
        //                    changed = true;
        //                }
        //                catch
        //                {
        //                    at.ProductionDate = null;
        //                }
        //                try
        //                {
        //                    at.PropertyOf = worksheet.Cells[row, 8].Value.ToString().Trim();
        //                    changed = true;
        //                }
        //                catch (System.NullReferenceException)
        //                {
        //                    at.PropertyOf = null;
        //                }

        //                try
        //                {
        //                    at.Idoneity = worksheet.Cells[row, 9].Value.ToString().Trim();
        //                    changed = true;
        //                }
        //                catch (System.NullReferenceException)
        //                {
        //                    at.Idoneity = null;
        //                }

        //                try
        //                {
        //                    at.Status = worksheet.Cells[row, 10].Value.ToString().Trim();
        //                    changed = true;
        //                }
        //                catch (System.NullReferenceException)
        //                {
        //                    at.Status = null;
        //                }

        //                try
        //                {
        //                    at.TechnicalSpecs = worksheet.Cells[row, 11].Value.ToString().Trim();
        //                    changed = true;
        //                }
        //                catch (System.NullReferenceException)
        //                {
        //                    at.TechnicalSpecs = null;
        //                }
        //                try
        //                {
        //                    at.EstimatedValue = Double.Parse(worksheet.Cells[row, 12].Value.ToString().Trim());
        //                    changed = true;
        //                }
        //                catch (System.NullReferenceException)
        //                {
        //                    at.EstimatedValue = null;
        //                }
        //                try
        //                {
        //                    at.Position = worksheet.Cells[row, 13].Value.ToString().Trim();
        //                    changed = true;
        //                }
        //                catch (System.NullReferenceException)
        //                {
        //                    at.Position = null;
        //                }

        //                try
        //                {
        //                    at.Compatibility = worksheet.Cells[row, 14].Value.ToString().Trim();
        //                    changed = true;
        //                }
        //                catch (System.NullReferenceException)
        //                {
        //                    at.Compatibility = null;
        //                }

        //                try
        //                {
        //                    at.Notes = worksheet.Cells[row, 15].Value.ToString().Trim();
        //                    changed = true;
        //                }
        //                catch (System.NullReferenceException)
        //                {
        //                    at.Notes = null;
        //                }

        //                if (changed == true)
        //                {
        //                    list.Add(at);
        //                }
                        
        //            }
        //        }
        //    }
        //    for (int i = 0; i < list.Count - 1; i++)
        //    {
        //        AttrezzaturaAT p = list[i];
        //        _context.AttrezzaturaAT.Add(p);
        //    }
        //    await _context.SaveChangesAsync();

        //    return DemoResponse<List<AttrezzaturaAT>>.GetResult(0, "OK", list);
        //}
    }
}
