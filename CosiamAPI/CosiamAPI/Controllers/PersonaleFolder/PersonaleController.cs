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
using Microsoft.AspNetCore.Identity;
using CosiamAPI.Common;
using Microsoft.AspNetCore.Identity.UI.Services;
using CosiamAPI.Models.Security;
using System.Collections.Immutable;
using System.Runtime.InteropServices;
using OfficeOpenXml;
using System.IO;
using System.Reflection;
using System.Diagnostics;
using System.Globalization;
using Org.BouncyCastle.Asn1.X509;
using OfficeOpenXml.FormulaParsing.Excel.Functions.RefAndLookup;
using OfficeOpenXml.Style;
using System.Drawing;
using CosiamAPI.Reports;
using CosiamAPI.Controllers.PersonaleFolder;

#nullable enable

namespace CosiamAPI.Controllers
{
	/// <summary>
	/// Classe che permette la crazione di un oggetto di tipo "Response",
	/// ovvero costruisce la risposta da mandare al cliente dopo aver eseguito l'import di un excel
	/// </summary>
	/// <typeparam name="T"></typeparam>
	public class DemoResponse<T>
	{
		public int Code { get; set; }

		public string? Msg { get; set; }

		public T? Data { get; set; }

		public static DemoResponse<T> GetResult(int code, string msg, T data = default(T)!)
		{
			return new DemoResponse<T>
			{
				Code = code,
				Msg = msg,
				Data = data
			};
		}
	}

	public struct ScadenzePersonaleWithFile
	{
		public int Id { get; set; }
		public DateTime? PerformingDate { get; set; }
		public int IdPersonale { get; set; }
		public int IdNote { get; set; }
		public NoteWithAttachmentsView Nota { get; set; }

		public ScadenzePersonaleWithFile(ScadenzePersonale sp, ApplicationDbContext _context)
		{

			this.Id = sp.Id;
			this.PerformingDate = sp.PerformingDate;
			this.IdPersonale = sp.IdPersonale;
			this.IdNote = sp.IdNote;
			this.Nota = new NoteWithAttachmentsView();
			this.Nota.Nota = sp.Nota;
			this.Nota.listFile = _context.AttachmentsNota.Where(atn => atn.IdNota == sp.IdNote).Include(atn => atn.File).Select(atn => atn.File).ToList();

		}
		public ScadenzePersonale ScadenzePersonaleWithFileToScadenzePersonale()
		{
			ScadenzePersonale sp = new ScadenzePersonale();
			sp.Id = this.Id;
			sp.PerformingDate = this.PerformingDate;
			sp.IdPersonale = this.IdPersonale;
			sp.IdNote = this.IdNote;
			sp.Nota = this.Nota.Nota;
			return sp;

		}
	}

	[Route("api/[controller]")]
	[ApiController]
	public class PersonaleController : Controller
	{
		private readonly ApplicationDbContext _context;
		private readonly IConfiguration _config;
		private readonly UserManager<IdentityUser> _userManager;
		private readonly RoleManager<IdentityRole> _roleManager;
		private readonly Utils _utils;

		public UserManager<IdentityUser> UserManager => _userManager;
		public RoleManager<IdentityRole> RoleManager => _roleManager;

		public PersonaleController(
			ApplicationDbContext context,
			IConfiguration configuration,
			UserManager<IdentityUser> userManager,
			RoleManager<IdentityRole> roleManager,
			IEmailSender sender)
		{
			_context = context;
			_config = configuration;
			_userManager = userManager;
			_roleManager = roleManager;
			_utils = new Utils(configuration, userManager, roleManager, sender);
		}

		// GET: api/Personale
		/// <summary>
		/// Endpoint che ritorna tutti gli oggetti di tipo personale all'interno del database,
		/// Includendo le rispettive informaizoni riguardo al ruolo.
		/// </summary>
		/// <returns></returns>
		[HttpGet]
		[Authorize(Roles = UserPolicy.Personale_R)]
		public async Task<ActionResult<IEnumerable<Object>>> GetPersonale()
		{
			var Personales = await _context.Personale
				.Select(x => new
				{
					x.Id,
					x.Name,
					x.Surname,
					x.email,
					x.telephone,
					x.birthday,
					x.CF,
					x.job,
					x.ordinaryPrice,
					x.extraordinaryPrice,
					x.travelPrice
				}
				)
				.ToListAsync();
			return Personales;
		}
		/// <summary>
		/// Ritorna il personale associato all'username passato.
		/// L'email è la chiave che correla le due tabelle
		/// </summary>
		/// <param name="username"></param>
		/// <returns></returns>
		[HttpGet("getPersonaleFromUsername/{username}")]
		public async Task<ActionResult<Personale>> GetPersonaleFromUserName(string username)
		{
			var user = await _userManager.Users.SingleOrDefaultAsync(x => x.UserName == username);
			if (user is not null)
			{
				var personale = await _context.Personale.SingleAsync(x => x.email == user.Email);
				return Ok(personale);
			}
			return BadRequest("Username non esistente/non associato a nessun personale");
		}

		// GET: api/Personale/5
		[HttpGet("{idPersonale}")]
		[Authorize(Roles = UserPolicy.Personale_R)]
		public async Task<ActionResult<Object>> GetPersonaleProfile(int idPersonale)
		{
			bool canLogin = true;
			IEnumerable<string>? role = null;
			try
			{
				var profile = await _context.ProfileManagement.Include(x => x.User)
															.SingleAsync(x => x.IdPersonale == idPersonale);

				if (profile == null)
				{
					canLogin = false;
				}
				else
				{
					role = await _userManager.GetRolesAsync(profile.User!);
					if (!profile.isEnabled)
						canLogin = false;
				}
			}
			catch (System.InvalidOperationException)
			{ // The sequence is empty! (in the single async)
				canLogin = false;
				role = null;
			}

			string single_role;
			if (role == null || role.Count() == 0)
				single_role = "Nessun Ruolo";
			else
				single_role = role.First(); //ce ne dovrebbe essere uno solo

			var personale = await _context.Personale.SingleAsync(p => p.Id == idPersonale);

			if (personale == null)
			{
				return NotFound();
			}

			return new
			{
				personale.Address,
				personale.birthday,
				personale.BirthPlace,
				personale.CF,
				personale.ConsegnaDPI,
				personale.ConsegnaTesserino,
				personale.contract,
				personale.email,
				personale.Employed,
				personale.extraordinaryPrice,
				personale.HiringEndDate,
				personale.HiringStartDate,
				personale.Id,
				personale.inStrenght,
				personale.job,
				personale.level,
				personale.medicalIdoneity,
				personale.Name,
				personale.ordinaryPrice,
				personale.OrganizationRole,
				personale.skills,
				personale.Surname,
				personale.telephone,
				personale.Title,
				personale.travelPrice,
				personale.File,
				canLogin = canLogin,
				role = single_role,
			};
		}

		// PUT: api/Personale/5
		// To protect from overposting attacks, see https://go.microsft.com/fwlink/?linkid=2123754
		//[HttpPut("{id}")]
		//[Authorize(Roles = UserPolicy.Personale_U)]
		//public async Task<IActionResult> PutPersonale(int id, Personale personale)
		//{
		//    if (id != personale.Id)
		//    {
		//        return BadRequest();
		//    }

		//    _context.Entry(personale).State = EntityState.Modified;

		//    try
		//    {
		//        await _context.SaveChangesAsync();
		//    }
		//    catch (DbUpdateConcurrencyException)
		//    {
		//        if (!PersonaleExists(id))
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

		private async Task<string> userNameCreator(string name, string surname)
		{
			var rnd = new Random();
			bool userExists = true;
			string new_username;

			do
			{
				new_username = name + surname[0] + "." + rnd.Next(0, 9999).ToString();
				var existingUser = await _userManager.FindByNameAsync(new_username);
				if (existingUser == null)
					userExists = false;

			} while (userExists);

			return new_username;
		}

		private string passwordGenerator()
		{
			string password = Guid.NewGuid().ToString();
			password = password.Replace("-", "T!%$");
			return password;
		}

		private async Task<bool> checkUserEmailExists(string? email)
		{
			if (email == null)
				return false;
			var user = await _userManager.FindByEmailAsync(email);
			if (user != null)
				return true;
			else
				return false;
		}

		private async Task<bool> createUserAndUserProfile(Personale personale, string r = UserRoles.Foreman, bool user_exists = false)
		{
			IdentityUser user;
			if (!user_exists)
			{
				string new_username = await userNameCreator(personale.Name, personale.Surname);

				user = new IdentityUser()
				{
					Email = personale.email,
					SecurityStamp = Guid.NewGuid().ToString(),
					UserName = new_username
				};

				var result = await _userManager.CreateAsync(user, passwordGenerator());
				if (!result.Succeeded)
					return false;
			}
			else
			{
				user = await _userManager.FindByEmailAsync(personale.email);
				var res = await UserManager.SetLockoutEnabledAsync(user, false);
				var res2 = await UserManager.SetLockoutEndDateAsync(user, DateTime.Now);
			}
			// Adding user to role
			var role = await RoleManager.FindByNameAsync(r);
			if (role != null)
			{
				if (!(await _userManager.IsInRoleAsync(user, r)))
				{
					IdentityResult res;
					try
					{
						string active_role = (await _userManager.GetRolesAsync(user!)).First();
						await _userManager.RemoveFromRoleAsync(user!, active_role);
					}
					catch (InvalidOperationException)
					{

					}
					finally
					{
						res = await _userManager.AddToRoleAsync(user!, r);
					}
					if (!res.Succeeded)
						return false;
				}
			}

			await _utils.SendResetPasswordEmailAsync(user);

			var new_profile = new CosiamAPI.Models.Security.ProfileManagement();
			new_profile.IdPersonale = personale.Id;
			new_profile.IdUser = user.Id;
			new_profile.isEnabled = true;
			await _context.ProfileManagement.AddAsync(new_profile);
			await _context.SaveChangesAsync();

			return true;
		}

		[HttpPost]
		[Authorize(Roles = UserPolicy.Personale_C)]
		public async Task<ActionResult<Personale>> PostPersonale(Personale personale, [FromQuery] string? role, [FromQuery] bool canLogin = false)
		{
			bool user_exists = false;
			try
			{
				if (!string.IsNullOrWhiteSpace(personale.email))
				{
					var personale_with_same_email = await _context.Personale.SingleAsync(x => x.email == personale.email);
					if (personale_with_same_email != null)  // Personale's email must be unique
						return StatusCode(StatusCodes.Status409Conflict, new Response { Status = "Error", Message = "Another Personale is already registred with the same email!" });

				}
				// At this point, we already checked if there is any other personale with same email. If there is not
				//the existence of an user with same email comports just that we need to link 'em!
				if ((await checkUserEmailExists(personale.email)))
					user_exists = true;
				//return StatusCode(StatusCodes.Status409Conflict, new Response { Status = "Error", Message = "Another User is already registred with the same email!" });

			}
			catch (InvalidOperationException) { } // Nothing found with single async

			_context.Personale.Add(personale);
			await _context.SaveChangesAsync();

			IdentityUser user = await new TokenHelper(_userManager)
				.GetUserFromRequestAsync(HttpContext.Request);

			if (await _userManager.IsInRoleAsync(user, "HeadOfOrder"))
			{
				return CreatedAtAction("GetPersonale", new { id = personale.Id }, personale);
			}

			// Only admin users reach for this section of the API
			if (canLogin)
			{
				// The user email exists already called earlier.
				//bool check1 = await checkUserEmailExists(personale.email); // returns true if the email exists
				// return false if something goes wrong 

				if (user_exists)
				{
					bool check1 = await createUserAndUserProfile(personale, role!, true);
					if (check1)
					{
						_context.Personale.Remove(personale);
						await _context.SaveChangesAsync(); //Rollback
						return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User creation failed! Unable to reactivate existing user" });
					}
				}
				else
				{
					bool check2 = await createUserAndUserProfile(personale, role!);
					if (!check2)
					{
						_context.Personale.Remove(personale);
						await _context.SaveChangesAsync(); //Rollback
						return StatusCode(StatusCodes.Status409Conflict, new Response { Status = "Error", Message = "Another user is already registred with the same email!" });
					}
				}
			}

			return CreatedAtAction("GetPersonale", new { id = personale.Id }, personale);
		}

		[HttpPost("UpdatePersonale")]
		[Authorize(Roles = UserPolicy.Utenti_on_User_U)] // Same as before
		public async Task<ActionResult<Personale>> UpdatePersonale(Personale personale, [FromQuery] string? role, [FromQuery] bool canLogin = true)
		{
			_context.Personale.Update(personale);
			await _context.SaveChangesAsync();

			IdentityUser user = await new TokenHelper(_userManager)
				.GetUserFromRequestAsync(HttpContext.Request);

			if (await _userManager.IsInRoleAsync(user, "HeadOfOrder"))
			{
				return CreatedAtAction("GetPersonale", new { id = personale.Id }, personale);
			}

			CosiamAPI.Models.Security.ProfileManagement? profile;
			try
			{
				profile = await _context.ProfileManagement.Include(x => x.User)
														.SingleAsync(x => x.IdPersonale == personale.Id);
			}
			catch (InvalidOperationException)
			{ // There is no profile yet
				profile = null;
			}
			if (profile != null)
			{
				if (canLogin == true && role == null)
					return BadRequest("Il ruolo non può essere nullo!");

				bool roleCheck = (await _userManager.IsInRoleAsync(profile.User!, role));

				if (canLogin && role != null && roleCheck != true)
				{
					string active_role = (await _userManager.GetRolesAsync(profile.User!)).First();

					await _userManager.RemoveFromRoleAsync(profile.User!, active_role);

					await _userManager.AddToRoleAsync(profile.User!, role);

					if (profile.isEnabled == false)
					{
						var res = await _userManager.SetLockoutEnabledAsync(profile.User!, false);
						if (!res.Succeeded)
							return new StatusCodeResult((int)StatusCodes.Status500InternalServerError);
						profile.isEnabled = true;
						_context.ProfileManagement.Update(profile);
						await _context.SaveChangesAsync();
					}
				}

				if (canLogin && role != null && roleCheck == true)
				{
					if (profile.isEnabled == false)
					{
						var res = await _userManager.SetLockoutEnabledAsync(profile.User!, false);
						if (!res.Succeeded)
							return new StatusCodeResult((int)StatusCodes.Status500InternalServerError);
						profile.isEnabled = true;
						_context.ProfileManagement.Update(profile);
						await _context.SaveChangesAsync();
					}
				}

				if (profile.isEnabled && canLogin == false)
				{
					var res = await _userManager.SetLockoutEnabledAsync(profile.User!, true);
					var res2 = await _userManager.SetLockoutEndDateAsync(profile.User!, DateTime.MaxValue);

					if (!res.Succeeded || !res2.Succeeded)
						return new StatusCodeResult((int)StatusCodes.Status500InternalServerError);

					profile.isEnabled = false;
					_context.ProfileManagement.Update(profile);
					await _context.SaveChangesAsync();
				}

				//updating email if it has been changed
				if (profile!.User.Email != personale.email)
				{
					// we need to update the fucking email
					profile.User.Email = personale.email;
					await _userManager.UpdateAsync(profile.User);
					await _context.SaveChangesAsync();
				}
			}
			else
			{
				if (canLogin)
				{
					// The user email exists already called earlier.
					//bool check1 = await checkUserEmailExists(personale.email); // returns true if the email exists
					// return false if something goes wrong 
					bool user_exists = false;

					if ((await checkUserEmailExists(personale.email)))
						user_exists = true;

					if (!(await createUserAndUserProfile(personale, role!, user_exists)))
					{
						_context.Personale.Remove(personale);
						await _context.SaveChangesAsync(); //Rollback
						return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User creation failed! Link user with Personale" });
					}
				}
			}

			return CreatedAtAction("GetPersonale", new { id = personale.Id }, personale);
		}

		// DELETE: api/Personale/5
		/// <summary>
		/// Va beh è una delete fai i tuoi conti cosa potrà mai fare
		/// </summary>
		/// <param name="id"></param>
		/// <returns></returns>
		//[HttpDelete("{id}")]
		//public async Task<IActionResult> DeletePersonale(int id)
		//{
		//    var personale = await _context.Personale.FindAsync(id);
		//    if (personale == null)
		//    {
		//        return NotFound();
		//    }

		//    _context.Personale.Remove(personale);
		//    await _context.SaveChangesAsync();

		//    return NoContent();
		//}

		[HttpPost("Delete/{id}")]
		[Authorize(Roles = UserPolicy.Personale_D)]
		public async Task<IActionResult> DeletePersonale([FromRoute] int id)
		{
			var personale = await _context.Personale.FindAsync(id);
			if (personale == null)
			{
				return NotFound();
			}

			_context.Personale.Remove(personale);

			try
			{
				var linkedUser = await _context.ProfileManagement
					.Include(x => x.User)
					.SingleAsync(x => x.IdPersonale == personale.Id);
				if (linkedUser != null && linkedUser.User != null)
				{
					await _utils.DisableUserLogin(linkedUser.User);
				}
			}
			catch (InvalidOperationException)
			{
				//Nothing to do, there is no linked user
				;
			}

			await _context.SaveChangesAsync();

			return NoContent();
		}

		private bool PersonaleExists(int id)
		{
			return _context.Personale.Any(e => e.Id == id);
		}

		[HttpPost("EmailExists/{email}")]
		public async Task<bool> emailExist([FromRoute] string email)
		{
			//var emails = _context.Personale.Select(x => x.email);
			var user = await UserManager.FindByEmailAsync(email);
			if (user != null)
				return true;
			var mail = await _context.Personale.SingleOrDefaultAsync(x => x.email == email);
			if (mail != null || user != null)
				return true;
			return false;

		}

		/// <summary>
		/// Ritorna un file .xlsx in cui nella prima pagina si trovano le informazioni 
		/// riguardanti al personale e ai ruoli
		/// </summary>
		/// <param name="cancellationToken"></param>
		/// <returns></returns>
		[HttpGet("export")]
		[Authorize(Roles = UserPolicy.Personale_R)]
		public async Task<IActionResult> Export(System.Threading.CancellationToken cancellationToken)
		{
			// query data from database  
			await Task.Yield();
			List<Personale> list = await _context.Personale.ToListAsync();
			var stream = new System.IO.MemoryStream();

			using (var package = new OfficeOpenXml.ExcelPackage(stream))
			{
				var workSheet = package.Workbook.Worksheets.Add("Sheet1");
				workSheet.Cells.LoadFromCollection(list, true);
			}
			stream.Position = 0;
			string excelName = $"Personale aggiornato al {DateTime.Now.ToString("yyyyMMddHHmmssfff")}.xlsx";

			//return File(stream, "application/octet-stream", excelName);  
			return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelName);
		}

		/// <summary>
		/// Permette di importare una tabella personale da un file excel
		/// </summary>
		/// <param name="formFile"></param>
		/// <param name="cancellationToken"></param>
		/// <returns></returns>
		[HttpPost("import")]
		[Authorize(Roles = UserPolicy.Personale_C)]
		public async Task<DemoResponse<List<Personale>>> Import(IFormFile formFile, System.Threading.CancellationToken cancellationToken)
		{

			if (!System.IO.Path.GetExtension(formFile.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
			{
				return DemoResponse<List<Personale>>.GetResult(-1, "Not Support file extension");
			}

			var list = new List<Personale>();

			using (var stream = new System.IO.MemoryStream())
			{
				await formFile.CopyToAsync(stream, cancellationToken);

				using (var package = new OfficeOpenXml.ExcelPackage(stream))
				{
					OfficeOpenXml.ExcelWorksheet worksheet = package.Workbook.Worksheets[1];
					var rowCount = worksheet.Dimension.Rows;

					for (int row = 2; row <= rowCount; row++)
					{
						var name = (worksheet.Cells[row, 2].Value == null ? "" : worksheet.Cells[row, 2].Value.ToString()!.Trim());
						var cf = (worksheet.Cells[row, 3].Value == null ? "" : worksheet.Cells[row, 2].Value.ToString()!.Trim());
						var surname = (worksheet.Cells[row, 4].Value == null ? "" : worksheet.Cells[row, 2].Value.ToString()!.Trim());
						var Telephone = (worksheet.Cells[row, 6].Value == null ? "" : worksheet.Cells[row, 2].Value.ToString()!.Trim());
						var Email = (worksheet.Cells[row, 7].Value == null ? "" : worksheet.Cells[row, 2].Value.ToString()!.Trim());
						var Birthday = (worksheet.Cells[row, 8].Value == null ? "" : worksheet.Cells[row, 2].Value.ToString()!.Trim());

						list.Add(new Personale
						{
							Name = name,
							CF = cf,
							Surname = surname,
							telephone = Telephone,
							email = Email,
							birthday = Birthday
						});
					}
				}
			}
			for (int i = 0; i < list.Count; i++)
			{
				Personale p = list[i];
				_context.Personale.Add(p);
			}
			await _context.SaveChangesAsync();

			return DemoResponse<List<Personale>>.GetResult(0, "OK", list);
		}


		// Now time for some good old note disguised as Alert Personale

		[HttpGet("GetAlertPersonale/{Id}")]
		[Authorize(Roles = UserPolicy.Personale_R)]
		public async Task<IEnumerable<Note?>> GetAlertPersonale([FromRoute] int Id)
		{
			return await _context.PersonaleResponsabileDiNota.Where(prdn => prdn.IdPersonale == Id).Select(prn => prn.Note).ToListAsync();
		}

		[HttpPost("PostAlertPersonale/{Id}")]
		[Authorize(Roles = UserPolicy.Personale_U)]
		public async Task<ActionResult<Note>> PostAlertPersonale([FromRoute] int Id, Note note)
		{
			//salvo la nota nel database
			await _context.Note.AddAsync(note);
			await _context.SaveChangesAsync();

			//creo un tag sulla nota relativa al personale
			PersonaleResponsabileNota prn = new PersonaleResponsabileNota();
			prn.IdNote = note.Id;
			prn.IdPersonale = Id;
			await _context.PersonaleResponsabileDiNota.AddAsync(prn);

			await _context.SaveChangesAsync();
			//ritorno la nota caso mai @danilozzozozzo volesse usarla per postare un documento
			return note;
		}

		//L'update la può fare direttamente sulla nota stessa (note controller), uguale per la delete
		////////////////////////////////////////////
		// GESTIONE SCADENZE PERSONALE //
		///////////////////////////////////////////


		private IQueryable<ScadenzePersonale> WhereDueDateExpired(IQueryable<ScadenzePersonale> initialQuery)
		{
			return initialQuery.Where(d => d.Nota!.DueDate <= DateTime.Now);              // controllo che sia nel timespan indicato
		}
		private IQueryable<ScadenzePersonale> WhereStatus(IQueryable<ScadenzePersonale> initialQuery, string status)
		{
			if (status.CompareTo("Scaduta") == 0)
				initialQuery = WhereDueDateExpired(initialQuery);
			return initialQuery.Where(n => n.Nota!.State.CompareTo(status) == 0);
		}
		private IQueryable<ScadenzePersonale> WhereExpiresBefore(IQueryable<ScadenzePersonale> initialQuery, DateTime exp)
		{
			return initialQuery.Where(d => d.Nota!.DueDate <= exp);              // controllo che sia nel timespan indicato
		}
		private IQueryable<ScadenzePersonale> ExcludeClosed(IQueryable<ScadenzePersonale> initialQuery)
		{
			return initialQuery.Where(n => n.Nota!.State.CompareTo("Chiusa") != 0);
		}

		private async Task<List<ScadenzePersonaleWithFile>> ToOrderedScadenzePersonaleWithFile(IQueryable<ScadenzePersonale> initialQuery)
		{

			initialQuery = initialQuery.Include(s => s.Nota);
			initialQuery = initialQuery.OrderBy(s => s.Nota!.DueDate);

			var finalQuery = initialQuery.Select(x => new ScadenzePersonaleWithFile(x, _context));

			return await finalQuery.ToListAsync();
		}

		/// <summary>
		/// Endpoint che permette di scaricare e filtrare le scadenze di un personale.
		/// Se il parametro includeClosed == true, andrà a scaricare quelle chiuse. 
		/// </summary>
		/// <param name="id"> id del record personale </param>
		/// <param name="state"> filtro riguardante lo "stato" della scadenza</param>
		/// <param name="daysToGo"> filtro riguardante i giorni entro i quali scadrà la scadenza </param>
		/// <param name="includeClosed"> Per scaricare anche quelle chiuse o meno. Questo parametri ha effetto solo se non si danno indicazioni riguardanti lo stato </param>
		/// <returns></returns>
		[HttpGet("{id}/Scadenze")]
		[Authorize(Roles = UserPolicy.Personale_R)]
		public async Task<ActionResult<IEnumerable<ScadenzePersonaleWithFile>>> GetScadenzePersonale(int id, [FromQuery] string? state, [FromQuery] int daysToGo = -1, [FromQuery] bool includeClosed = false)
		{
			var scadenze = _context.ScadenzePersonale
				.Where(s => s.IdPersonale == id);

			if (state != null)
				scadenze = WhereStatus(scadenze, state);


			if (!includeClosed)  // Controllo se nello scaricarle tutte mi interessino anche quelle chiuse o meno
				scadenze = ExcludeClosed(scadenze); // Se non voglio includere quelle chiuse, le tolgo dalla ricerca


			if (daysToGo >= 0)
			{
				var maxDate = DateTime.Now.AddDays(daysToGo);
				scadenze = WhereExpiresBefore(scadenze, maxDate);
			}

			var ScadenzePersonaleWithFile = await ToOrderedScadenzePersonaleWithFile(scadenze);

			return ScadenzePersonaleWithFile;  //.OrderBy(s => s.Nota.Nota.DueDate).ToList();
		}

		[HttpPost("UpdateScadenza/{id}")]
		[Authorize(Roles = UserPolicy.Personale_U)]
		public async Task<IActionResult> PutScadenzePersonale(int id, ScadenzePersonale scadenzePersonale)
		{
			if (id != scadenzePersonale.Id)
			{
				return BadRequest();
			}
			_context.Entry(scadenzePersonale).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!_context.ScadenzePersonale.Any(e => e.Id == id))
				{
					return NotFound();
				}
				else
				{
					throw;
				}
			}

			// Ora aggiorno la sottovariabile della nota

			var note = scadenzePersonale.Nota;
			if (note == null || scadenzePersonale.IdNote != note.Id)
			{
				return BadRequest();
			}

			_context.Entry(note).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!_context.Note.Any(e => e.Id == note.Id)) // Controllo che la nota esista davvero
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



		[HttpPost("PostScadenza")]
		[Authorize(Roles = UserPolicy.Personale_U)]
		public async Task<ActionResult<ScadenzePersonaleWithFile>> PostScadenzePersonale(ScadenzePersonaleWithFile scadenzePersonale)
		{
			var sp = scadenzePersonale.ScadenzePersonaleWithFileToScadenzePersonale();
			_context.ScadenzePersonale.Add(sp);
			await _context.SaveChangesAsync();

			return new ScadenzePersonaleWithFile(sp, _context);
		}

		[HttpPost("ChangeScadenzaStatus/{id}")]
		[Authorize(Roles = UserPolicy.Personale_U)]
		public async Task<ActionResult> UpdateScadenzaStatus([FromRoute] int id, [FromQuery] string new_state = "Chiusa")
		{

			if (!_context.ScadenzePersonale.Any(e => e.Id == id))
			{
				return NotFound();
			}

			var sp = await _context.ScadenzePersonale.Include(x => x.Nota).SingleAsync(x => x.Id == id);

			var nota = sp.Nota;
			nota!.State = new_state;
			_context.Entry(nota).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!_context.Note.Any(e => e.Id == nota.Id)) // Controllo che la nota esista davvero
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

		[HttpPost("DeleteScadenze")]
		[Authorize(Roles = UserPolicy.Personale_U)]
		public async Task<IActionResult> DeleteScadenzePersonale(int[] ids)
		{
			foreach (int id in ids)
			{
				var scadenzePersonale = await _context.ScadenzePersonale.FindAsync(id);
				if (scadenzePersonale == null)
				{
					return NotFound();
				}
			}

			foreach (int id in ids)
			{
				var scadenzePersonale = await _context.ScadenzePersonale.FindAsync(id);
				var note = await _context.Note.FindAsync(scadenzePersonale.IdNote);
				var files = await _context.AttachmentsNota.Where(x => x.IdNota == note.Id).Include(at => at.File).Select(an => an.File).ToListAsync();

				foreach (_File? file in files)
					FileManager.DeleteFile(file!, _config);

				_context.File.RemoveRange(files);
				_context.Note.Remove(note);
				_context.ScadenzePersonale.Remove(scadenzePersonale);
			}

			await _context.SaveChangesAsync();
			return NoContent();
		}

		[HttpPost("PostAttachmentsToScadenza/{idScadenza}")]
		[Authorize(Roles = UserPolicy.Personale_U)]
		public async Task<ActionResult<IEnumerable<AttachmentsNota>>> PostAttachmentsToNote([FromRoute] int idScadenza, [FromForm] IFormFile[] formFiles)
		{

			List<_File> files = new List<_File>();

			foreach (FormFile formFile in formFiles)
			{
				_File file = await FileManager.SaveNewFile(formFile, _config);
				await _context.File.AddAsync(file);
				files.Add(file);
			}
			await _context.SaveChangesAsync();

			List<AttachmentsNota> attachments = new List<AttachmentsNota>();
			foreach (_File f in files)
			{
				AttachmentsNota atcn = new AttachmentsNota();

				atcn.IdFile = f.Id;
				atcn.IdNota = (await _context.ScadenzePersonale.FindAsync(idScadenza)).IdNote;

				await _context.AttachmentsNota.AddAsync(atcn);
				attachments.Add(atcn);
			}
			await _context.SaveChangesAsync();

			return attachments;
		}

		[HttpPost("DeleteAttachmentsScadenza")]
		[Authorize(Roles = UserPolicy.Personale_U)]
		public async Task<IActionResult> DeleteAttachmentsScadenzePersonale(int[] ids)
		{
			foreach (int id in ids)
			{
				var file = await _context.File.FindAsync(id);
				if (file == null)
				{
					return NotFound();
				}
			}

			foreach (int id in ids)
			{
				var file = await _context.File.FindAsync(id);

				FileManager.DeleteFile(file, _config);

				_context.File.Remove(file);
			}

			await _context.SaveChangesAsync();
			return NoContent();
		}


		private bool FileExists(int id)
		{
			return _context.File.Any(e => e.Id == id);
		}



		////////////////////////////////////////////
		////     Cantieri Personale             ////
		////////////////////////////////////////////


		[HttpGet("{id}/Cantieri")]
		[Authorize(Roles = UserPolicy.Personale_R + UserPolicy.Cantieri_R)]
		public async Task<ActionResult<IEnumerable<Cantiere>>> GetCantieriPersonale(int id)
		{
			return await _context.ListaPersonaleAssegnatoDiCantiere.Where(s => s.IdPersonale == id)
																   .Where(d => d.ToDate < DateTime.Now || d.ToDate == null && d.Cantiere.State != "Chiuso")
																   .Include(s => s.Cantiere)
																   .Select(c => c.Cantiere)
																   .ToListAsync();
		}

		////////////////////////////////////////////
		////     Gestione TimeCards             ////
		////////////////////////////////////////////

		[HttpGet("{idPersonale}/TimeCards")]
		[Authorize(Roles = UserPolicy.Personale_R + UserPolicy.ReportDiCantiere_R)]
		public async Task<ActionResult<IEnumerable<TimeCard>>> GetTimeCard([FromRoute] int idPersonale, [FromQuery] DateTime? beginningDate, [FromQuery] DateTime? endDate, [FromQuery] bool? sum)
		{
			var initialQuery = _context.TimeCard.Where(x => x.PersonaleId == idPersonale);
			if (beginningDate != null)
			{
				initialQuery = initialQuery.Where(x => x.BeginningDate == null ? x.ReportDiCantiere!.date >= beginningDate : x.BeginningDate >= beginningDate);
			}
			if (endDate != null)
			{
				initialQuery = initialQuery.Where(x => x.EndDate <= endDate || x.EndDate == null);
			}
			initialQuery = initialQuery.OrderBy(x => x.Type).ThenBy(x => x.BeginningDate == null ? x.ReportDiCantiere!.date : x.BeginningDate);
			if (sum != null && sum == true)
			{
				initialQuery = initialQuery.GroupBy(x => x.Type)
											.Select(x => new TimeCard(
												x.Key,
												x.Sum(t => t.NumberOfHours),
												//x.First().PersonaleId, 
												idPersonale,
												0,
												beginningDate,
												endDate)
											);
			}
			return await initialQuery.ToArrayAsync();
		}

		/// <summary>
		/// Controlla se l'utente attuale coincide col personale, tramite la mail
		/// </summary>
		/// <param name="personaleEmail"></param>
		/// <returns></returns>
		[HttpGet("checkPersonaleEmail/{personaleEmail}")]
		public async Task<bool> UserIsPersonale([FromRoute] string personaleEmail)
		{
			IdentityUser user = await new TokenHelper(_userManager)
				.GetUserFromRequestAsync(HttpContext.Request);

			return user.Email.Equals(personaleEmail, StringComparison.CurrentCultureIgnoreCase);
		}


		[HttpPost("getDettagliPersonale")]
		public async Task<IActionResult> GetDettagliPersonale(int[] idsPersonale, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo, [FromQuery] string exportType)
		{
			//if (idsPersonale.Length != 1)
			//    return base.BadRequest("È possibile estrarre i dati di un solo personale");
			if (string.IsNullOrWhiteSpace(exportType) || !new string[] { "XLSX", "PDF" }.Contains(exportType, StringComparer.CurrentCultureIgnoreCase))
				return base.BadRequest("Specificare il tipo di export (xlsx o pdf)");

			var personale = _context.Personale.Where(x => idsPersonale.Contains(x.Id));
			if (!personale.Any())
				return base.BadRequest("Personale non esistente");

			List<ReportDiCantiere> reportList = [];
			var idCantieri = _context.TimeCard.Where(x => idsPersonale.Contains(x.PersonaleId)).Select(x => x.ReportDiCantiere).Select(x => x.IdCantiere).Distinct();
			foreach (var idcantiere in idCantieri.AsParallel().AsUnordered())
				reportList.AddRange(ReportUtils.GetReportsBetweenDates(_context, idcantiere, dateFrom?.ToString("yyyy-MM-dd"), dateTo?.ToString("yyyy-MM-dd")));

			var idReports = reportList.Select(x => x.Id).Distinct();
			ImmutableArray<TimeCard> timeCards = _context.TimeCard.Where(x => idReports.Contains(x.IdReport) && idsPersonale.Contains(x.PersonaleId)).ToImmutableArray();


            List<(string cantiere, DateTime date, string dayOfWeek, double ordinaryHours, double ordinaryCost, double extraordinaryHours, double extraordinaryCost, double travelHours, double travelCost, double totalCost, double absenceHours, string? absenceReasons, Personale personale)> toReturn = [];
            //ordino i report per data
            if (reportList.Count == 0)
                return NoContent();

			ImmutableArray<Cantiere> cantieri = [.. _context.Cantiere.Where(x => reportList.Select(x => x.IdCantiere).Distinct().Contains(x.Id))];

			#region Data Preparation

			foreach (var p in personale)
			{
				idReports = timeCards.Where(x => x.PersonaleId == p.Id).Select(x => x.IdReport).Distinct();
				if (!idReports.Any())
					break;
				//ORDINO i report in base alla reference date
				//TODO: GESTIRE I REPORT SENZA REFERENCEDATE
                var reportSubList = reportList.Where(x => idReports.Contains(x.Id)).OrderBy(x => DateTime.Parse(x.referenceDate)).ToList();
				int idCantiere = reportSubList[0].IdCantiere;

                #region Dati giorno per giorno
                foreach (var report in reportSubList)
                {
                    var cantiere = cantieri.Single(x => x.Id == report.IdCantiere);
                    var a = timeCards.Where(x => x.IdReport == report.Id && x.PersonaleId == p.Id && x.Type == TimeCardsTypes.Ordinary).SingleOrDefault();
                    var b = timeCards.Where(x => x.IdReport == report.Id && x.PersonaleId == p.Id && x.Type == TimeCardsTypes.ExtraOrdinary).SingleOrDefault();
                    var c = timeCards.Where(x => x.IdReport == report.Id && x.PersonaleId == p.Id && x.Type == TimeCardsTypes.Travel).SingleOrDefault();
                    var absence = timeCards.Where(x => x.IdReport == report.Id && x.PersonaleId == p.Id && x.Type == TimeCardsTypes.Absence).SingleOrDefault();


                    double ordinaryCost = (a?.NumberOfHours ?? 0) * (p.ordinaryPrice ?? 0);
                    double extraordinaryCost = (b?.NumberOfHours ?? 0) * (p.extraordinaryPrice ?? 0);
                    double travelCost = (c?.NumberOfHours ?? 0) * (p.travelPrice ?? 0);

                    toReturn.Add((cantiere.ShortDescription, DateTime.Parse(report.referenceDate), DateTime.Parse(report.referenceDate).ToString("dddd"), a?.NumberOfHours ?? 0, ordinaryCost, b?.NumberOfHours ?? 0, extraordinaryCost, c?.NumberOfHours ?? 0, travelCost, ordinaryCost + extraordinaryCost + travelCost, absence?.NumberOfHours ?? 0, absence?.AbsenceReason, p));
                }
            }
            #endregion


			#endregion

			#region Excel writing
			if (exportType.Contains("xlsx", StringComparison.CurrentCultureIgnoreCase))
			{
				var file = new PersonaleHelper().ExportEstrazioneOreExcel(toReturn);
				return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
			}
			#endregion
			#region PDF Export
			else
			{
				//export PDF

				string filename = Guid.NewGuid().ToString() + ".pdf";
				var rg = new ReportGenerator(/*new HomeController(null,_config,_context)*/this);
				string pathToFile = await rg.generatePDF(ReportsEnum.EstrazioneOrePersonaleReport, toReturn, filename);
				return File(System.IO.File.ReadAllBytes(pathToFile), "application/pdf");
			}
			#endregion




		}

		[Obsolete]
		[HttpPost("getDettagliPersonaleMultiple")]
		public async Task<IActionResult> GetDettagliPersonaleMultiple(int[] idsPersonale, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
		{
			var personale = _context.Personale.Where(x => idsPersonale.Contains(x.Id));
			if (!personale.Any())
				return base.BadRequest("Personale non esistente");

			List<ReportDiCantiere> reportList = new();
			var idCantieri = _context.TimeCard.Where(x => idsPersonale.Contains(x.PersonaleId)).Select(x => x.ReportDiCantiere).Select(x => x.IdCantiere).Distinct();
			foreach (var idcantiere in idCantieri.AsParallel().AsUnordered())
				reportList.AddRange(ReportUtils.GetReportsBetweenDates(_context, idcantiere, dateFrom?.ToString("yyyy-MM-dd"), dateTo?.ToString("yyyy-MM-dd")));

			var idReports = reportList.Select(x => x.Id).Distinct();
			ImmutableArray<TimeCard> timeCards = _context.TimeCard.Where(x => idReports.Contains(x.IdReport) && idsPersonale.Contains(x.PersonaleId)).ToImmutableArray();


			List<(string personale, string cantiere, DateTime date, double ordinaryHours, double ordinaryCost, double extraordinaryHours, double extraordinaryCost, double travelHours, double travelCost, double totalCost)> toReturn = new();
			//ordino i report per data
			if (reportList.Count == 0)
				return Ok("Personale selezionato non presente in nessun report");

			ImmutableArray<Cantiere> cantieri = _context.Cantiere.Where(x => reportList.Select(x => x.IdCantiere).Distinct().Contains(x.Id)).ToImmutableArray();

			#region Data Preparation
			foreach (var p in personale)
			{
				idReports = timeCards.Where(x => x.PersonaleId == p.Id).Select(x => x.IdReport).Distinct();
				if (!idReports.Any())
					break;
				//ORDINO i report in base alla reference date
				var reportSubList = reportList.Where(x => idReports.Contains(x.Id)).OrderBy(x => DateTime.Parse(x.referenceDate)).ToList();
				int idCantiere = reportSubList[0].IdCantiere;

				#region Dati giorno per giorno
				foreach (var report in reportSubList)
				{
					var cantiere = cantieri.Single(x => x.Id == report.IdCantiere);
					var a = timeCards.Where(x => x.IdReport == report.Id && x.PersonaleId == p.Id && x.Type == TimeCardsTypes.Ordinary).SingleOrDefault();
					var b = timeCards.Where(x => x.IdReport == report.Id && x.PersonaleId == p.Id && x.Type == TimeCardsTypes.ExtraOrdinary).SingleOrDefault();
					var c = timeCards.Where(x => x.IdReport == report.Id && x.PersonaleId == p.Id && x.Type == TimeCardsTypes.Travel).SingleOrDefault();

					double ordinaryCost = (a?.NumberOfHours ?? 0) * (p.ordinaryPrice ?? 0);
					double extraordinaryCost = (b?.NumberOfHours ?? 0) * (p.extraordinaryPrice ?? 0);
					double travelCost = (c?.NumberOfHours ?? 0) * (p.travelPrice ?? 0);

					toReturn.Add((p.Name + (p.Surname ?? string.Empty), cantiere.ShortDescription, DateTime.Parse(report.referenceDate), a?.NumberOfHours ?? 0, ordinaryCost, b?.NumberOfHours ?? 0, extraordinaryCost, c?.NumberOfHours ?? 0, travelCost, ordinaryCost + extraordinaryCost + travelCost));
				}
				#endregion

			}
			#endregion

			#region Excel writing

			using (var memoryStream = new MemoryStream())
			{
				using (ExcelPackage p = new ExcelPackage(memoryStream))
				{
					// Aggiungere i fogli di lavoro
					ExcelWorksheet sheet = p.Workbook.Worksheets.Add("Riepilogo");

					// Impostare le intestazioni
					var headers = new[] { "Nome e Cognome", "Cantiere", "Data", "Ore Ordinarie", "Costo Ore Ordinarie", "Ore Straordinarie", "Costo Ore Straordinarie", "Ore Spostamento", "Costo Ore Spostamento", "Costo Totale" };
					for (int i = 0; i < headers.Length; i++)
					{
						sheet.Cells[1, i + 1].Value = headers[i];
					}

					// Formattazione delle celle per le intestazioni
					using (var range = sheet.Cells[1, 1, 1, headers.Length])
					{
						range.Style.Font.Bold = true;
					}

					// Aggiungo i dati
					int currentRow = 2;
					foreach (var row in toReturn)
					{
						// Aggiungere i dati al foglio Excel
						sheet.Cells[currentRow, 1].Value = row.personale;
						sheet.Cells[currentRow, 2].Value = row.cantiere;
						sheet.Cells[currentRow, 3].Value = $"{row.date:dd/MM/yyyy} - {row.date:dddd}";
						sheet.Cells[currentRow, 4].Value = row.ordinaryHours;
						sheet.Cells[currentRow, 5].Value = row.ordinaryCost;
						sheet.Cells[currentRow, 6].Value = row.extraordinaryHours;
						sheet.Cells[currentRow, 7].Value = row.extraordinaryCost;
						sheet.Cells[currentRow, 8].Value = row.travelHours;
						sheet.Cells[currentRow, 9].Value = row.travelCost;
						sheet.Cells[currentRow, 10].Value = row.totalCost;
						currentRow++;
					}

					// Convertire l'intervallo di celle in una tabella
					var tableRange = sheet.Cells[1, 1, currentRow - 1, headers.Length];
					var table = sheet.Tables.Add(tableRange, "DettagliPersonale");
					table.ShowTotal = false;
					table.TableStyle = OfficeOpenXml.Table.TableStyles.Medium13;


					// Applicare la formattazione delle celle per i costi
					sheet.Cells[2, 5, currentRow, 5].Style.Numberformat.Format = "€ #,##0.00";
					sheet.Cells[2, 7, currentRow, 7].Style.Numberformat.Format = "€ #,##0.00";
					sheet.Cells[2, 9, currentRow, 9].Style.Numberformat.Format = "€ #,##0.00";
					sheet.Cells[2, 10, currentRow, 10].Style.Numberformat.Format = "€ #,##0.00";

					// Auto-fit per le colonne
					//sheet.Cells[sheet.Dimension.Address].AutoFitColumns();

					// Salvare il file Excel
					p.Save();
					var file = memoryStream.ToArray();
					//var path = @"C:\Users\finiz\Downloads\aaa.xlsx";
					//System.IO.File.WriteAllBytes(path, file);
					return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
				}

			}
			#endregion

		}

		[Obsolete]
		[HttpPost("getDettagliPersonaleV2")]
		public async Task<IActionResult> GetDettagliPersonaleRaggruppatiPerCantiere(int[] idsPersonale, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
		{
			var personale = _context.Personale.Where(x => idsPersonale.Contains(x.Id));
			if (!personale.Any())
				return base.BadRequest("Personale non esistente");

			List<ReportDiCantiere> reportList = new();
			var idCantieri = _context.TimeCard.Where(x => idsPersonale.Contains(x.PersonaleId)).Select(x => x.ReportDiCantiere).Select(x => x.IdCantiere).Distinct();
			foreach (var idcantiere in idCantieri.AsParallel().AsUnordered())
				reportList.AddRange(ReportUtils.GetReportsBetweenDates(_context, idcantiere, dateFrom?.ToString("yyyy-MM-dd"), dateTo?.ToString("yyyy-MM-dd")));

			var idReports = reportList.Select(x => x.Id).Distinct();
			ImmutableArray<TimeCard> timeCards = _context.TimeCard.Where(x => idReports.Contains(x.IdReport) && idsPersonale.Contains(x.PersonaleId)).ToImmutableArray();


			List<(string personale, string cantiere, DateTime dateFrom, DateTime dateTo, double ordinaryHours, double ordinaryCost, double extraordinaryHours, double extraordinaryCost, double travelHours, double travelCost, double totalCost)> toReturn = new();
			//ordino i report per data
			if (reportList.Count == 0)
				return Ok("Personale selezionato non presente in nessun report");

			ImmutableArray<Cantiere> cantieri = _context.Cantiere.Where(x => reportList.Select(x => x.IdCantiere).Distinct().Contains(x.Id)).ToImmutableArray();


			#region Data Preparation
			foreach (var p in personale)
			{
				idReports = timeCards.Where(x => x.PersonaleId == p.Id).Select(x => x.IdReport).Distinct();
				if (!idReports.Any())
					break;
				//ORDINO i report in base alla reference date
				var reportSubList = reportList.Where(x => idReports.Contains(x.Id)).OrderBy(x => DateTime.Parse(x.referenceDate)).ToList();
				int idCantiere = reportSubList[0].IdCantiere;
				int indexFrom = 0;

				#region Dati raggruppati in base allo spostamento da un cantiere ad un altro entro anche se mi trovo nell'ultimo elemento del reportList
				for (int i = 0; i < reportSubList.Count; i++)
				{

					if ((i == reportSubList.Count - 1 || (i < reportSubList.Count - 1) && reportSubList[i + 1].IdCantiere != reportSubList[i].IdCantiere))
					{
						var reportIds = CollectionsMarshal.AsSpan(reportSubList).Slice(indexFrom, i + 1 - indexFrom).ToArray().Select(x => x.Id);

						var a = timeCards.Where(x => reportIds.Contains(x.IdReport) && x.PersonaleId == p.Id && x.Type == TimeCardsTypes.Ordinary);
						double ordinaryCost = a.Sum(x => x.NumberOfHours * (p.ordinaryPrice ?? 0)); //prendo le timecard dei report a partire dal fromindex fino a i, e sommo le ore ordinarie
						double ordinaryHours = a.Sum(x => x.NumberOfHours);

						var b = timeCards.Where(x => reportIds.Contains(x.IdReport) && x.PersonaleId == p.Id && x.Type == TimeCardsTypes.ExtraOrdinary);
						double extraordinaryCost = b.Sum(x => x.NumberOfHours * (p.extraordinaryPrice ?? 0));
						double extraordinaryHours = b.Sum(x => x.NumberOfHours);

						var c = timeCards.Where(x => reportIds.Contains(x.IdReport) && x.PersonaleId == p.Id && x.Type == TimeCardsTypes.Travel);
						double travelCost = c.Sum(x => x.NumberOfHours * (p.travelPrice ?? 0));
						double travelHours = c.Sum(x => x.NumberOfHours);

						var cantiere = cantieri.Single(x => x.Id == reportSubList[i].IdCantiere);

						toReturn.Add((p.Name + (p.Surname ?? string.Empty), cantiere.ShortDescription, DateTime.Parse(reportSubList[indexFrom].referenceDate), DateTime.Parse(reportSubList[i].referenceDate), ordinaryHours, ordinaryCost, extraordinaryHours, extraordinaryCost, travelHours, travelCost, ordinaryCost + extraordinaryCost + travelCost));
						indexFrom = i + 1;

					}
				}
				#endregion

			}
			#endregion

			#region Excel writing

			using (var memoryStream = new MemoryStream())
			{
				using (ExcelPackage p = new ExcelPackage(memoryStream))
				{
					// Aggiungere i fogli di lavoro
					ExcelWorksheet sheet = p.Workbook.Worksheets.Add("Riepilogo");

					// Impostare le intestazioni
					var headers = new[] { "Nome e Cognome", "Cantiere", "Data Inizio", "Data Fine", "Ore Ordinarie", "Costo Ore Ordinarie", "Ore Straordinarie", "Costo Ore Straordinarie", "Ore Spostamento", "Costo Ore Spostamento", "Costo Totale" };
					for (int i = 0; i < headers.Length; i++)
					{
						sheet.Cells[1, i + 1].Value = headers[i];
					}

					// Formattazione delle celle per le intestazioni
					using (var range = sheet.Cells[1, 1, 1, headers.Length])
					{
						range.Style.Font.Bold = true;
					}

					// Aggiungo i dati
					int currentRow = 2;
					foreach (var row in toReturn)
					{
						// Aggiungere i dati al foglio Excel
						sheet.Cells[currentRow, 1].Value = row.personale;
						sheet.Cells[currentRow, 2].Value = row.cantiere;
						sheet.Cells[currentRow, 3].Value = row.dateFrom.ToString("dd/MM/yyyy");
						sheet.Cells[currentRow, 4].Value = row.dateTo.ToString("dd/MM/yyyy");
						sheet.Cells[currentRow, 5].Value = row.ordinaryHours;
						sheet.Cells[currentRow, 6].Value = row.ordinaryCost;
						sheet.Cells[currentRow, 7].Value = row.extraordinaryHours;
						sheet.Cells[currentRow, 8].Value = row.extraordinaryCost;
						sheet.Cells[currentRow, 9].Value = row.travelHours;
						sheet.Cells[currentRow, 10].Value = row.travelCost;
						sheet.Cells[currentRow, 11].Value = row.totalCost;
						currentRow++;
					}

					// Convertire l'intervallo di celle in una tabella
					var tableRange = sheet.Cells[1, 1, currentRow - 1, headers.Length];
					var table = sheet.Tables.Add(tableRange, "DettagliPersonale");
					table.ShowTotal = false;
					table.TableStyle = OfficeOpenXml.Table.TableStyles.Medium13;


					// Applicare la formattazione delle celle per i costi
					sheet.Cells[2, 6, currentRow, 6].Style.Numberformat.Format = "€ #,##0.00";
					sheet.Cells[2, 8, currentRow, 8].Style.Numberformat.Format = "€ #,##0.00";
					sheet.Cells[2, 10, currentRow, 10].Style.Numberformat.Format = "€ #,##0.00";
					sheet.Cells[2, 11, currentRow, 11].Style.Numberformat.Format = "€ #,##0.00";

					// Auto-fit per le colonne
					//sheet.Cells[sheet.Dimension.Address].AutoFitColumns();

					// Salvare il file Excel
					p.Save();
					var file = memoryStream.ToArray();
					//var path = @"C:\Users\finiz\Downloads\aaa.xlsx";
					//System.IO.File.WriteAllBytes(path, file);
					return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
				}

			}
			#endregion

		}
	}
}
