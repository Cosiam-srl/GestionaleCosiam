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
#nullable enable

namespace CosiamAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemParametersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SystemParametersController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet("getByKey/{key}")]
        public async Task<SystemParameters?> GetByKey([FromRoute] string key)
        {
            return await _context.Parameters.SingleOrDefaultAsync(x => x.Key == key);
        }
        [HttpPost("createOrUpdate")]
        public async Task<IActionResult> SetParameter(SystemParameters obj)
        {
            SystemParameters? oldParam = await _context.Parameters.SingleOrDefaultAsync(x => x.Key == obj.Key);
            if (oldParam is not null)
            {
                oldParam.Value = obj.Value;
            }
            else
            {
                await _context.Parameters.AddAsync(obj);
            }
            await _context.SaveChangesAsync();

            return base.Ok();
        }
        [HttpGet("deleteByKey/key")]
        public async Task<IActionResult> DeleteParameter(string key)
        {
            var obj = await _context.Parameters.SingleOrDefaultAsync(x => x.Key == key);
            if(obj is null)
                return base.BadRequest($"Il parametro con la chiave {key} non esiste!");

            _context.Parameters.Remove(obj);
            await _context.SaveChangesAsync();
            return base.Ok();
        }

    }
}
