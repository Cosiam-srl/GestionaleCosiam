using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CosiamAPI.Data;
using CosiamAPI.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using JWTAuthentication.Authentication;

namespace CosiamAPI.Controllers
{
    public static class FileManager
    {
        public static string filePathGetter(string base_path, _File file)
        {
            return System.IO.Path.Combine(base_path, file.UploadDateTime.Year.ToString() + "-" +
                                                                            file.UploadDateTime.Month.ToString() + "-" +
                                                                            file.UploadDateTime.Day.ToString() + "-" +
                                                                            file.HashCode.ToString());
        }
        public static async Task<_File> SaveNewFile(IFormFile formFile, IConfiguration _config)
        {
            _File file = new _File();
            file.FileName = formFile.FileName;
            file.URL = _config["fileURL"];
            file.UploadDateTime = DateTime.Now;
            file.Type = formFile.ContentType;
            file.HashCode = formFile.GetHashCode();
            //IFormFile formFile = formFiles[0];

            //Controllo l'esistenza di tale cartella
            if (!System.IO.Directory.Exists(_config["folderPath"]))
            {
                System.IO.Directory.CreateDirectory(_config["folderPath"]);
            }
            //Creo il nome del file compreso di path
            string filePath = filePathGetter(_config["folderPath"], file);
            //Scrivo il file
            using (var stream = System.IO.File.Create(filePath))
            {
                await formFile.CopyToAsync(stream);
            }

            return file;
        }

        public static int DeleteFile(_File file, IConfiguration _config)
        {
            
            if (file == null)
            {
                return 1;
            }

            var filePath = System.IO.Path.Combine(_config["folderPath"], file.UploadDateTime.Year.ToString() + "-" +
                                                                            file.UploadDateTime.Month.ToString() + "-" +
                                                                            file.UploadDateTime.Day.ToString() 
                                                                           + "-" + file.HashCode.ToString());
            System.IO.File.Delete(filePath);
            
            return 0;
        }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        public FileController(IConfiguration configuration, ApplicationDbContext context)
        {
            _context = context;
            _config = configuration;
        }

        // GET: api/File
        /// <summary>
        /// Scarica solamente i record non dal filesystem
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Authorize(Roles = UserPolicy.Documenti_R)]
        public async Task<ActionResult<IEnumerable<_File>>> GetFile()
        {
            return await _context.File.Where(f => f.URL == _config["fileURL"]).ToListAsync();
            // L'ultimo where serve a controllare che si stiano scaricando i file per la versione corretta del programma (se si usa dev.demo.e38.it 
            // si scaricheranno solamente i file caricati su https://localhost:5001)
        }

        // GET: api/File/5
        [HttpGet("{id}")]
        [Authorize(Roles = UserPolicy.Documenti_R)]
        public async Task<IActionResult> GetFile(int id, System.Threading.CancellationToken cancellationToken)
        {
            var file = await _context.File.FindAsync(id);

            if (file == null)
            {
                return NotFound();
            }

            var filePath = System.IO.Path.Combine(_config["folderPath"], file.UploadDateTime.Year.ToString() + "-" +
                                                                            file.UploadDateTime.Month.ToString() + "-" +
                                                                            file.UploadDateTime.Day.ToString()
                                                                           + "-" + file.HashCode.ToString());

            System.IO.Stream stream = System.IO.File.OpenRead(filePath);
            
            return File(stream, "application/octet-stream", file.FileName);
            
        }

        //// PUT: api/File/5
        //// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPut("{id}")]
        //public async Task<IActionResult> PutFile(int id, File file)
        //{
        //    if (id != file.Id)
        //    {
        //        return BadRequest();
        //    }

        //    _context.Entry(file).State = EntityState.Modified;

        //    try
        //    {
        //        await _context.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!FileExists(id))
        //        {
        //            return NotFound();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return NoContent();
        //}



        // POST: api/File
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        /// <summary>
        /// To post 1 file
        /// </summary>
        /// <param name="formFile"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        [HttpPost("upload")]
        [Authorize(Roles = UserPolicy.Documenti_C)]
        public async Task<ActionResult<_File>> PostFile(IFormFile formFile, 
                                                        System.Threading.CancellationToken cancellationToken)
        {
            _File file = await FileManager.SaveNewFile(formFile, _config);
            //Salvo i riferimenti sul database
            _context.File.Add(file);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetFile", new { id = file.Id }, file);
        }

        /// <summary>
        /// L'update serve solo per cambiarne le informazioni, non per modificare il contenuto del file.
        /// </summary>
        /// <param name="file"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        [HttpPost("update")]
        [Authorize(Roles = UserPolicy.Documenti_U)]
        public async Task<ActionResult<_File>> UpdateFile(_File file,
                                                        System.Threading.CancellationToken cancellationToken)
        {
            //Salvo i riferimenti sul database
            _context.File.Update(file);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetFile", new { id = file.Id }, file);
        }

        /// <summary>
        /// To post a shitload of files
        /// </summary>
        /// <param name="formFiles"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        [HttpPost("uploadMultiple")]
        [Authorize(Roles = UserPolicy.Documenti_C)]
        public async Task<ActionResult<IEnumerable<_File>>> PostFile(IEnumerable<IFormFile> formFiles,
                                                        System.Threading.CancellationToken cancellationToken)
        {
            List<_File> files = new List<_File>();
            foreach (IFormFile formFile in formFiles)
            {
                _File file = await FileManager.SaveNewFile(formFile, _config);
                //Salvo i riferimenti sul database
                _context.File.Add(file);
                files.Add(file);
            }


            await _context.SaveChangesAsync();
            return files;
        }

        [HttpPost("deleteMultiple")]
        [Authorize(Roles = UserPolicy.Documenti_D)]
        public async Task<ActionResult<int>> DeleteFiles(IEnumerable<int> files)
        {
            return await DeleteFilesByIds(files);
        }

        private async Task<ActionResult<int>> DeleteFilesByIds(IEnumerable<int> files)
        {
            foreach (int id in files)
            {
                _File file = await _context.File.FindAsync(id);
                FileManager.DeleteFile(file, _config);
                _context.File.Remove(file);
            }

            await _context.SaveChangesAsync();
            return files.Count();
        }



        // DELETE: api/File/5
        [HttpDelete("{id}")]
        [Authorize(Roles = UserPolicy.Documenti_D)]
        public async Task<IActionResult> DeleteFile(int id)
        {

            _File file = await _context.File.FindAsync(id);

            if(file == null)
            {
                return NotFound();
            }

            int returnValue = FileManager.DeleteFile(file, _config);

            _context.File.Remove(file);
            await _context.SaveChangesAsync();

            if ( returnValue == 1)
                return NotFound();

            return NoContent();
        }

        private bool FileExists(int id)
        {
            return _context.File.Any(e => e.Id == id);
        }
    }
}
