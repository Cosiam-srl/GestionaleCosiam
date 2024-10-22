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

namespace CosiamAPI.Controllers.ReportDiCantiereFolder
{
    [Route("api/[controller]")]
    [ApiController]
    public class AllegatiEQuestionarioReportModelController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AllegatiEQuestionarioReportModelController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/AllegatiEQuestionarioReportModel
        [HttpGet]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
        public async Task<ActionResult<IEnumerable<AllegatiEQuestionarioReportModel>>> GetAllegatiEQuestionarioReportModel()
        {
            return await _context.AllegatiEQuestionarioReportModel.ToListAsync();
        }

        // GET: api/AllegatiEQuestionarioReportModel/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
        public async Task<ActionResult<AllegatiEQuestionarioReportModel>> GetAllegatiEQuestionarioReportModel(int id)
        {
            var allegatiEQuestionarioReportModel = await _context.AllegatiEQuestionarioReportModel.FindAsync(id);

            if (allegatiEQuestionarioReportModel == null)
            {
                return NotFound();
            }

            return allegatiEQuestionarioReportModel;
        }

        // PUT: api/AllegatiEQuestionarioReportModel/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<IActionResult> PutAllegatiEQuestionarioReportModel(int id, AllegatiEQuestionarioReportModel allegatiEQuestionarioReportModel)
        {
            if (id != allegatiEQuestionarioReportModel.Id)
            {
                return BadRequest();
            }

            _context.Entry(allegatiEQuestionarioReportModel).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AllegatiEQuestionarioReportModelExists(id))
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

        // POST: api/AllegatiEQuestionarioReportModel
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<ActionResult<AllegatiEQuestionarioReportModel>> PostAllegatiEQuestionarioReportModel(AllegatiEQuestionarioReportModel allegatiEQuestionarioReportModel)
        {
            _context.AllegatiEQuestionarioReportModel.Add(allegatiEQuestionarioReportModel);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAllegatiEQuestionarioReportModel", new { id = allegatiEQuestionarioReportModel.Id }, allegatiEQuestionarioReportModel);
        }

        // DELETE: api/AllegatiEQuestionarioReportModel/5
        [HttpDelete("{id}")]
        [Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
        public async Task<IActionResult> DeleteAllegatiEQuestionarioReportModel(int id)
        {
            var allegatiEQuestionarioReportModel = await _context.AllegatiEQuestionarioReportModel.FindAsync(id);
            if (allegatiEQuestionarioReportModel == null)
            {
                return NotFound();
            }

            _context.AllegatiEQuestionarioReportModel.Remove(allegatiEQuestionarioReportModel);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AllegatiEQuestionarioReportModelExists(int id)
        {
            return _context.AllegatiEQuestionarioReportModel.Any(e => e.Id == id);
        }
    }
}
