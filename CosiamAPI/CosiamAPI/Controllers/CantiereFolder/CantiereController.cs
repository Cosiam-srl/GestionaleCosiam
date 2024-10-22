using CosiamAPI.Common;
using CosiamAPI.Data;
using CosiamAPI.Models;
using CosiamAPI.Models.Report;
using CosiamAPI.Models.Security;
using JWTAuthentication.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Frozen;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

#nullable enable
namespace CosiamAPI.Controllers
{

	[Route("api/[controller]")]
	[ApiController]
	public class CantiereController : ControllerBase
	{
		/// ///////////////////////////// ///
		/// METODI E ATTRIBUTI INTRINSECI ///
		/// ///////////////////////////// ///
		private readonly ApplicationDbContext _context;
		private readonly IConfiguration _config;
		private readonly UserManager<IdentityUser> _userManager;

		public CantiereController(ApplicationDbContext context, IConfiguration configuration, UserManager<IdentityUser> userManager)
		{
			_context = context;
			_config = configuration;
			_userManager = userManager;
		}




		///////////////////////////////////////////////////////////////////////////
		//     FUNZIONI DEDICATE AL MANAGEMENT INTERNO DEL CONTROLLER      ///////
		///////////////////////////////////////////////////////////////////////////

		/// <summary>
		/// Serve per trovare la lista di personale collegata ad un determinato cantiere
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		private async Task<List<Personale>> FindPersonaleDiCantiereAsync(int Id)
		{
			return await _context.ListaPersonaleAssegnatoDiCantiere.Where(p => p.IdCantiere == Id)
																	.Include(p => p.Personale)
																	.Select(p => p.Personale)
																	.ToListAsync();
		}

		/// <summary>
		/// Serve a trovare tutte le note di cantiere collegate ad un determinato cantiere
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		private async Task<List<Note>> FindNoteDiCantiereAsync(int Id)
		{
			List<ListaNoteDiCantiere> ln = await _context.ListaNoteDiCantiere.Where(n => n.IdCantiere == Id).ToListAsync();
			return await _context.Note.Where(n => ln.Select(lns => lns.IdNote).Contains(n.Id)).ToListAsync();
		}

		/// <summary>
		/// </summary>
		/// <param name="idPersonale"></param>
		/// <param name="fromDate"></param>
		/// <param name="toDate"></param>
		/// <returns></returns>
		private async Task<bool> CheckPersonaleAvailability(int idPersonale, DateTime fromDate, DateTime toDate)
		{
			//Controllo che la data di inizio non sia compresa in quelle di assegnamento ad un altro cantiere
			{
				List<ListaPersonaleAssegnatoDiCantiere> lp = await _context.ListaPersonaleAssegnatoDiCantiere
																			.Where(p => p.IdPersonale == idPersonale)
																			.Where(fd => (fd.FromDate != null ? fromDate >= fd.FromDate : fromDate >= fd.Cantiere.Start)
																							&&
																						 (fd.ToDate != null ? fromDate <= fd.ToDate : fromDate <= fd.Cantiere.EstimatedEnding)
																				  )
																			.ToListAsync();
				if (lp.Count() != 0)
					return false;
			}
			{
				//controllo che la data di fine non sia compresa tra quelle di assegnamento di un altro cantiere
				List<ListaPersonaleAssegnatoDiCantiere> lp = await _context.ListaPersonaleAssegnatoDiCantiere
																			.Where(p => p.IdPersonale == idPersonale)
																			//.Where(fd => (toDate >= fd.FromDate && toDate <= fd.ToDate))
																			.Where(fd => (fd.FromDate != null ? toDate >= fd.FromDate : toDate >= fd.Cantiere.Start)
																							&&
																						 (fd.ToDate != null ? toDate <= fd.ToDate : toDate <= fd.Cantiere.EstimatedEnding)
																				  )
																			.ToListAsync();
				if (lp.Count() != 0)
					return false;
			}
			{
				//controllo se la data di inizio assegnamento ad un altro cantiere sia comrpesa nell'assegnamento attuale
				List<ListaPersonaleAssegnatoDiCantiere> lp = await _context.ListaPersonaleAssegnatoDiCantiere
																			.Where(p => p.IdPersonale == idPersonale)
																			//.Where(fd => (fd.FromDate >= fromDate  && fd.FromDate <= toDate))
																			.Where(fd => (fd.FromDate != null ? fd.FromDate >= fromDate : fd.Cantiere.Start >= fromDate)
																							&&
																						 (fd.ToDate != null ? fd.FromDate <= toDate : fd.Cantiere.Start <= toDate)
																				  )
																			.ToListAsync();
				if (lp.Count() != 0)
					return false;
			}

			return true;

		}

		private async Task<List<Personale>> FindPMsCantiereAsync(int Id)
		{
			List<ListaProjectManagerCantiere> lpm = await _context.ListaProjectManagerCantiere.Where(p => p.IdCantiere == Id).ToListAsync();
			var returnValue = await _context.Personale.Where(p => lpm.Select(lps => lps.IdPersonale).Contains(p.Id)).ToListAsync();
			return returnValue;
		}

		private async Task<List<Personale>> FindCapiCantiereAsync(int Id)
		{
			List<ListaCapiCantiere> lcc = await _context.ListaCapiCantiere.Where(p => p.IdCantiere == Id).ToListAsync();
			return await _context.Personale.Where(p => lcc.Select(lps => lps.IdPersonale).Contains(p.Id)).ToListAsync();
		}

		private async Task<List<_File>> FindFileCantiereAsync(int Id)
		{
			List<ListaFileDiCantiere> lf = await _context.ListaFileDiCantiere.Where(p => p.IdCantiere == Id).ToListAsync();
			return await _context.File.Where(f => lf.Select(lfc => lfc.IdFile).Contains(f.Id)).Where(f => f.URL == _config["fileURL"]).ToListAsync();
			// L'ultimo where serve a controllare che si stiano scaricando i file per la versione corretta del programma (se si usa dev.demo.e38.it 
			// si scaricheranno solamente i file caricati su https://localhost:5001)
		}

		private async Task<List<_File>> FindImmaginiCantiereAsync(int Id)
		{
			var files = _context.ListaFileDiCantiere.Where(lf => lf.IdCantiere == Id)
													.Where(f => f.File.URL == _config["fileURL"]);
			return await files.Where(f => (f.File.Type.Contains("image")))
							  .Include(f => f.File)
							  .Select(f => f.File)
							  .ToListAsync();
		}



		/////////////////////////////////////////////////////////////////////////////
		//     API DI GET                                                   ////////
		/////////////////////////////////////////////////////////////////////////////

		private int productionAdvancementPercentage(int idCantiere)
		{
			var avanzamentoProduzione = _context.ListOfServicesSoldToClient.Where(s => s!.ReportDiCantiere!.IdCantiere == idCantiere)
																			.Sum(s => s!.servizioCliente!.PricePerUm * s.Quantity);
			var finalAmount = _context.Cantiere.Find(idCantiere);
			return (int)(avanzamentoProduzione / finalAmount.finalAmount);


		}
		private int temporalAdvancementPercentage(int idCantiere)
		{
			Cantiere cantiere = _context.Cantiere.Find(idCantiere);

			var totalDays = (int)cantiere.EstimatedEnding.Subtract(cantiere.Start).TotalDays;
			var daysElapsed = (int)DateTime.Now.Subtract(cantiere.Start).TotalDays;

			return (int)daysElapsed / totalDays;
		}

		// GET: api/Cantiere
		/// <summary>
		/// Ritorna tutti i cantieri salvati con in aggiunto l'oggetto clienti collegato
		/// </summary>
		/// <returns></returns>
		[HttpGet]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<IEnumerable<Object>> GetSimplifiedCantiere()
		{
			IdentityUser user = await new TokenHelper(_userManager)
				.GetUserFromRequestAsync(HttpContext.Request);

			if (await _userManager.IsInRoleAsync(user, "Foreman"))
			{
				ProfileManagement allowedForemanProfile = await _context.ProfileManagement.SingleAsync(x => x.IdUser == user.Id);

				return await _context.ListaCapiCantiere
									 .Where(x => x.IdPersonale == allowedForemanProfile.IdPersonale)
									 .Include(x => x.Cantiere)
									 .Select(x => x.Cantiere)
									 .Select(q => new
									 {
										 Id = q.Id,
										 Address = q.Address,
										 Start = q.Start,
										 EstimatedEnding = q.EstimatedEnding,
										 State = q.State!,
										 IdCliente = q.Contratto.Cliente!.Id,
										 ClienteName = q.Contratto.Cliente.Name,
										 OrderCode = q.orderCode,
										 FinalAmount = q.finalAmount,
										 Scostament = Math.Round((_context.ListOfServicesSoldToClient.Where(s => s.ReportDiCantiere!.IdCantiere == q.Id).Sum(s => s.servizioCliente!.PricePerUm * s.Quantity) / q.finalAmount) - (q.EstimatedEnding.Subtract(q.Start).TotalDays / DateTime.Now.Subtract(q.Start).TotalDays), 2),
										 Description = q.ShortDescription,
										 CostiIniziali = q.CostiIniziali,
										 RicaviIniziali = q.RicaviIniziali,
										 ValoriAggiuntivi = q.ValoriAggiuntivi
									 })
									 .ToListAsync();
			}
			if (await _userManager.IsInRoleAsync(user, "HeadOfOrder"))
			{
				ProfileManagement allowedheadOfOrderProfile = await _context.ProfileManagement.SingleAsync(x => x.IdUser == user.Id);

				var pm_List = (IEnumerable<Object>)await _context.ListaProjectManagerCantiere
									 .Where(x => x.IdPersonale == allowedheadOfOrderProfile.IdPersonale)
									 .Include(x => x.Cantiere)
									 .Select(x => x.Cantiere)
									 .Select(q => new
									 {
										 Id = q.Id,
										 Address = q.Address,
										 Start = q.Start,
										 EstimatedEnding = q.EstimatedEnding,
										 State = q.State!,
										 IdCliente = q.Contratto.Cliente!.Id,
										 ClienteName = q.Contratto.Cliente.Name,
										 OrderCode = q.orderCode,
										 FinalAmount = q.finalAmount,
										 Scostament = Math.Round((_context.ListOfServicesSoldToClient.Where(s => s.ReportDiCantiere!.IdCantiere == q.Id).Sum(s => s.servizioCliente!.PricePerUm * s.Quantity) / q.finalAmount) - (q.EstimatedEnding.Subtract(q.Start).TotalDays / DateTime.Now.Subtract(q.Start).TotalDays), 2),
										 Description = q.ShortDescription,
										 CostiIniziali = q.CostiIniziali,
										 RicaviIniziali = q.RicaviIniziali,
										 ValoriAggiuntivi = q.ValoriAggiuntivi
									 })
									 .ToListAsync();
				var foreman_list = (IEnumerable<Object>)await _context.ListaCapiCantiere
									 .Where(x => x.IdPersonale == allowedheadOfOrderProfile.IdPersonale)
									 .Include(x => x.Cantiere)
									 .Select(x => x.Cantiere)
									 .Select(q => new
									 {
										 Id = q.Id,
										 Address = q.Address,
										 Start = q.Start,
										 EstimatedEnding = q.EstimatedEnding,
										 State = q.State!,
										 IdCliente = q.Contratto.Cliente!.Id,
										 ClienteName = q.Contratto.Cliente.Name,
										 OrderCode = q.orderCode,
										 FinalAmount = q.finalAmount,
										 Scostament = Math.Round((_context.ListOfServicesSoldToClient.Where(s => s.ReportDiCantiere!.IdCantiere == q.Id).Sum(s => s.servizioCliente!.PricePerUm * s.Quantity) / q.finalAmount) - (q.EstimatedEnding.Subtract(q.Start).TotalDays / DateTime.Now.Subtract(q.Start).TotalDays), 2),
										 Description = q.ShortDescription,
										 CostiIniziali = q.CostiIniziali,
										 RicaviIniziali = q.RicaviIniziali,
										 ValoriAggiuntivi = q.ValoriAggiuntivi
									 })
									 .ToListAsync();
				return pm_List.Union(foreman_list);
			}

			// await _context.Clienti.Select(x => new { x.Id; x.Name });
			return await _context.Cantiere
								 //.Include(c => c.Contratto)
								 //.ThenInclude(c => c.Cliente)
								 .Select(q => new
								 {
									 Id = q.Id,
									 Address = q.Address,
									 Start = q.Start,
									 EstimatedEnding = q.EstimatedEnding,
									 State = q.State!,
									 IdCliente = q.Contratto.Cliente!.Id,
									 ClienteName = q.Contratto.Cliente.Name,
									 OrderCode = q.orderCode,
									 FinalAmount = q.finalAmount,
									 Scostament = Math.Round((_context.ListOfServicesSoldToClient.Where(s => s.ReportDiCantiere!.IdCantiere == q.Id).Sum(s => s.servizioCliente!.PricePerUm * s.Quantity) / q.finalAmount) - (q.EstimatedEnding.Subtract(q.Start).TotalDays / DateTime.Now.Subtract(q.Start).TotalDays), 2),
									 Description = q.ShortDescription,
									 CostiIniziali = q.CostiIniziali,
									 RicaviIniziali = q.RicaviIniziali,
									 ValoriAggiuntivi = q.ValoriAggiuntivi
								 })
								 .ToListAsync();

		}
		[HttpGet("FullWithouContratto")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<IEnumerable<Cantiere>>> GetCantiere()
		{
			IdentityUser user = await new TokenHelper(_userManager)
				.GetUserFromRequestAsync(HttpContext.Request);

			if (await _userManager.IsInRoleAsync(user, UserRoles.Foreman))
			{
				ProfileManagement allowedForemanProfile = await _context.ProfileManagement.SingleAsync(x => x.IdUser == user.Id);

				return Ok(await _context.ListaCapiCantiere
									 .Where(x => x.IdPersonale == allowedForemanProfile.IdPersonale)
									 .Include(x => x.Cantiere)
									 .Select(x => x.Cantiere)
									 .ToListAsync()
						);
			}

			if (await _userManager.IsInRoleAsync(user, UserRoles.HeadOfOrder) ||
				await _userManager.IsInRoleAsync(user, UserRoles.Admin)
				)
			{
				return Ok(await _context.Cantiere
									 .ToListAsync()
						);
			}

			return Forbid();
		}

		private async Task<bool> isForemanAllowedInCantiereAsync(int idCantiere, int idForeman)
		{
			try
			{
				var allowedTo = await _context.ListaCapiCantiere.Where(x => x.IdPersonale == idForeman)
																.SingleAsync(x => x.IdCantiere == idCantiere);
				if (allowedTo == null) // if no connection between foreman and cantiere is found => not allowed
					return false;
			}
			catch (InvalidOperationException)
			{
				return false; // there is more than an assignment (bug we must test)
							  // there is no assignment to that cantiere => false
			}
			return true;
		}

		private async Task<bool> foremanGuard(HttpContext httpContext, int idCantiere)
		{
			IdentityUser user = await new TokenHelper(_userManager)
				.GetUserFromRequestAsync(httpContext.Request);

			if (await _userManager.IsInRoleAsync(user, "Foreman"))
			{
				ProfileManagement foremanProfile = await _context.ProfileManagement.SingleAsync(x => x.IdUser == user.Id);
				if (!await isForemanAllowedInCantiereAsync(idCantiere, foremanProfile.IdPersonale))
					return false;
			}
			return true;
		}

		// GET: api/Cantiere/5
		[HttpGet("{id}")]
		//[Authorize(Roles = UserPolicy.Cantieri_R)]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<Cantiere>> GetCantiere(int id)
		{

			var cantiere = await _context.Cantiere.Include(x => x.Contratto).Include(x => x.ValoriAggiuntivi).SingleAsync(x => x.Id == id);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, id))
				return NotFound();

			return cantiere;
		}


		/// <summary>
		/// Ritorna una lista di personale collegata al cantiere
		/// </summary>
		/// <param name="Id"> Id del cantiere di riferimento</param>
		/// <returns>Una lista di personale che è stato assegnato al cantiere</returns>
		// GET: api/Cantiere/PersonaleCantiere
		[HttpGet("ListaPersonaleAssegnato/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<IEnumerable<Personale>>> getPersonaleAssegnatoPerCantiereAsync([FromRoute] int Id)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == Id);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, Id))
				return NotFound();
			return await _context.ListaPersonaleAssegnatoDiCantiere.Where(p => p.IdCantiere == Id)
																	.Include(p => p.Personale)
																	.Select(p => new Personale()
																	{
																		CF = p.Personale.CF,
																		ConsegnaDPI = p.Personale.ConsegnaDPI,
																		ConsegnaTesserino = p.Personale.ConsegnaTesserino,
																		email = p.Personale.email,
																		Employed = p.Personale.Employed,
																		extraordinaryPrice = p.Personale.extraordinaryPrice,
																		Id = p.Personale.Id,
																		inStrenght = p.Personale.inStrenght,
																		job = p.Personale.job,
																		level = p.Personale.level,
																		medicalIdoneity = p.Personale.medicalIdoneity,
																		Name = p.Personale.Name,
																		ordinaryPrice = p.Personale.ordinaryPrice,
																		OrganizationRole = p.Personale.OrganizationRole,
																		skills = p.Personale.skills,
																		Surname = p.Personale.Surname,
																		telephone = p.Personale.telephone,
																		Title = p.Personale.Title,
																		travelPrice = p.Personale.travelPrice,
																	})
																	.ToListAsync();
		}
		/// <summary>
		/// Ritorna gli assegnamenti del personale al cantiere
		/// </summary>
		/// <param name="Id">Id del cantiere di riferimento</param>
		/// <returns>Una lista di assegnamenti del personale ad un cantiere comprendendo il personale stesso</returns>
		[HttpGet("AssegnamentiPersonale/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<IEnumerable<Object>>> getAssegnamentiAsync([FromRoute] int Id)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == Id);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, Id))
				return NotFound();

			return await _context.ListaPersonaleAssegnatoDiCantiere.Where(lpadc => lpadc.IdCantiere == Id)
																   .Select(ls => new ListaPersonaleAssegnatoDiCantiere
																   {
																	   Id = ls.Id,
																	   IdCantiere = ls.IdCantiere,
																	   IdPersonale = ls.IdPersonale,
																	   FromDate = ls.FromDate,
																	   ToDate = ls.ToDate,
																	   Personale = new Personale()
																	   {
																		   CF = ls.Personale.CF,
																		   ConsegnaDPI = ls.Personale.ConsegnaDPI,
																		   ConsegnaTesserino = ls.Personale.ConsegnaTesserino,
																		   email = ls.Personale.email,
																		   Employed = ls.Personale.Employed,
																		   extraordinaryPrice = ls.Personale.extraordinaryPrice,
																		   Id = ls.Personale.Id,
																		   inStrenght = ls.Personale.inStrenght,
																		   job = ls.Personale.job,
																		   level = ls.Personale.level,
																		   medicalIdoneity = ls.Personale.medicalIdoneity,
																		   Name = ls.Personale.Name,
																		   ordinaryPrice = ls.Personale.ordinaryPrice,
																		   OrganizationRole = ls.Personale.OrganizationRole,
																		   skills = ls.Personale.skills,
																		   Surname = ls.Personale.Surname,
																		   telephone = ls.Personale.telephone,
																		   Title = ls.Personale.Title,
																		   travelPrice = ls.Personale.travelPrice,
																	   }
																   })
																   .ToListAsync();
		}

		[HttpGet("PMs/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<IEnumerable<Personale>>> getPMsPerCantiereAsync([FromRoute] int Id)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == Id);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, Id))
				return NotFound();
			return await FindPMsCantiereAsync(Id);
		}

		[HttpGet("Foremen/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<IEnumerable<Personale>>> getCapiCantiereAsync([FromRoute] int Id)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == Id);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, Id))
				return NotFound();
			return await FindCapiCantiereAsync(Id);
		}

		[HttpGet("File/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<IEnumerable<_File>>> getFileAsync([FromRoute] int Id)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == Id);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, Id))
				return NotFound();

			return await FindFileCantiereAsync(Id);
		}

		[HttpGet("{IdCantiere}/Files")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<IEnumerable<_File>>> NewgetFileAsync([FromRoute] int IdCantiere, [FromQuery] string? type)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == IdCantiere);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, IdCantiere))
				return NotFound();

			if (type != null)
			{
				return await _context.ListaFileDiCantiere.Where(x => x.IdCantiere == IdCantiere)
														 .Where(x => x.type == type)
														 .Include(x => x.File)
														 .Select(x => x.File)
														 .ToListAsync();
			}
			return await FindFileCantiereAsync(IdCantiere);
		}

		[HttpGet("Images/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<IEnumerable<String>>> getImagesAsync([FromRoute] int Id)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == Id);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, Id))
				return NotFound();

			List<_File> files = await FindImmaginiCantiereAsync(Id);
			List<String> convertedFiles = new List<String>();

			foreach (var file in files)
			{
				byte[] bytes = System.IO.File.ReadAllBytes(FileManager.filePathGetter(_config["folderPath"], file));
				convertedFiles.Add("data:image/png;base64," + Convert.ToBase64String(bytes));
			}

			return convertedFiles;
		}

		[HttpGet("Images/{Id}/SingleImage/{IdImmagini}")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<string>> getSingleCantiereImageAsync([FromRoute] int Id, [FromRoute] int IdImmagini)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == Id);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, Id))
				return NotFound();

			var file = await _context.File.SingleAsync(x => x.Id == Id);

			if (file == null)
			{
				return NotFound();
			}

			byte[] bytes = System.IO.File.ReadAllBytes(FileManager.filePathGetter(_config["folderPath"], file));

			return "data:image/png;base64," + Convert.ToBase64String(bytes);
		}

		[HttpGet("MezziDiCantiere/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<IEnumerable<ListaMezziDiCantiere>>> getMezziDiCantiereAsync([FromRoute] int Id)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == Id);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, Id))
				return NotFound();

			return await _context.ListaMezziDiCantiere.Where(lmdc => lmdc.IdCantiere == Id).Include(lm => lm.Mezzo).ToListAsync();
		}

		[HttpGet("ListaFornitoriDiCantiere/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<IEnumerable<Fornitori>>> getListaDiFornitoriCantiereAsync([FromRoute] int Id)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == Id);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, Id))
				return NotFound();

			return await _context.ListaFornitoriCantiere.Where(lfc => lfc.IdCantiere == Id).Select(fc => fc.Fornitore).ToListAsync();
		}



		private IQueryable<Note> SelectNoteDiCantiere(int idCantiere)
		{
			return _context.ListaNoteDiCantiere.Where(ln => ln.IdCantiere == idCantiere).Include(lnn => lnn.Note).Select(lnnn => lnnn.Note);
		}
		private IQueryable<NoteDiCantiereView> SelectNoteDiCantiereView(IQueryable<Note> initialQuery)
		{
			return initialQuery.Select(x => new NoteDiCantiereView(x, _context));
		}

		/// <summary>
		/// Ritorna tutte le note legate ad un determinato cantiere
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		//GET: api/Cantiere/NoteDiCantiere
		[HttpGet("TaggedNoteDiCantiere/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<IEnumerable<NoteDiCantiereView>>> getTaggedNoteDiCantiereAsync([FromRoute] int Id)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == Id);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, Id))
				return NotFound();

			var noteDiCantiere = SelectNoteDiCantiere(Id);
			return await SelectNoteDiCantiereView(noteDiCantiere).ToListAsync();
		}
		/// <summary>
		/// Like the one before but without specific cantiere + multiple query params
		/// </summary>
		/// <param name="Id"></param>

		/// <returns></returns>
		[HttpGet("AllNotesByPriority")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<IEnumerable<Note>>> getDashboardNoteDiCantiereAsync([FromQuery] bool onlyTagged = true)
		{

			IdentityUser user = await new TokenHelper(_userManager)
				.GetUserFromRequestAsync(HttpContext.Request);


			IQueryable<Note> listOfNotes = listOfNotes = _context.ListaNoteDiCantiere.Select(x => x.Note);

			if (!await _userManager.IsInRoleAsync(user, "Admin"))
			{
				if (onlyTagged)
				{
					ProfileManagement personaleLoggato = await _context.ProfileManagement.SingleAsync(x => x.IdUser == user.Id);
					listOfNotes = _context.PersonaleResponsabileDiNota.Where(x => x.IdPersonale == personaleLoggato.IdPersonale).Select(x => x.Note!);
				}
				else if (await _userManager.IsInRoleAsync(user, "Foreman"))
				{
					ProfileManagement allowedForemanProfile = await _context.ProfileManagement.SingleAsync(x => x.IdUser == user.Id);
					var allowedCantieri = await _context.ListaCapiCantiere
										 .Where(x => x.IdPersonale == allowedForemanProfile.IdPersonale)
										 .Include(x => x.Cantiere)
										 .Select(x => x.Cantiere)
										 .Select(q => q.Id)
										 .ToListAsync();
					listOfNotes = _context.ListaNoteDiCantiere.Where(x => allowedCantieri.Contains(x.IdCantiere)).Select(x => x.Note);
				}
				else if (await _userManager.IsInRoleAsync(user, "HeadOfOrder"))
				{
					ProfileManagement allowedheadOfOrderProfile = await _context.ProfileManagement.SingleAsync(x => x.IdUser == user.Id);
					var allowedCantieri = await _context.ListaCapiCantiere
										 .Where(x => x.IdPersonale == allowedheadOfOrderProfile.IdPersonale)
										 .Include(x => x.Cantiere)
										 .Select(x => x.Cantiere)
										 .Select(q => q.Id)
										 .ToListAsync();
					listOfNotes = _context.ListaNoteDiCantiere.Where(x => allowedCantieri.Contains(x.IdCantiere)).Select(x => x.Note);
				}
			}

			listOfNotes = listOfNotes.OrderByDescending(x => x.Priority == "Alta" ? 3 : (x.Priority == "Normale" ? 2 : 1)).ThenBy(x => x.DueDate);

			return await listOfNotes.ToListAsync();
		}

		/// <summary>
		/// Ritorna il numero di giorni passati dall'inizio su quelli totali stimati e in più la %
		/// </summary>
		/// <param name="IdCantiere"></param>
		/// <returns>
		/// giorni passati, totali e percentuale passati
		/// </returns>
		[HttpGet("{IdCantiere}/Days")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<Object>> GetDays([FromRoute] int IdCantiere)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == IdCantiere);
			var daysElapsed = 0;

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, IdCantiere))
				return NotFound();
			if (cantiere.State == "Ultimato")
			{
				var lastReport = await _context.ReportDiCantiere.Where(x => x.IdCantiere == IdCantiere).OrderByDescending(x => x.Id).FirstOrDefaultAsync();
				var lastReportDate = DateTime.Parse(lastReport.referenceDate);

				daysElapsed = (int)lastReportDate.Subtract(cantiere.Start).TotalDays;
			}
			else
			{
				daysElapsed = (int)DateTime.Now.Subtract(cantiere.Start).TotalDays;
			}
			var totalDays = (int)cantiere.EstimatedEnding.Subtract(cantiere.Start).TotalDays;
			var perc = 0;
			if (totalDays > 0)
			{
				perc = (int)(daysElapsed * 100) / totalDays;

			}
			perc = perc >= 0 ? perc : 0;
			return new { totalDays, daysElapsed, perc };
		}


		/////////////////////////////////////////////////////////////////////////////
		///     API DI PUT                                                   ////////
		/////////////////////////////////////////////////////////////////////////////

		// PUT: api/Cantiere/5
		// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
		[HttpPut("{id}")]
		[Authorize(Roles = UserPolicy.Cantieri_C)]
		public async Task<IActionResult> PutCantiere(int id, Cantiere cantiere)
		{
			if (id != cantiere.Id)
			{
				return BadRequest();
			}

			_context.Entry(cantiere).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!CantiereExists(id))
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




		/////////////////////////////////////////////////////////////////////////////
		///     API DI POST                                                  ////////
		/////////////////////////////////////////////////////////////////////////////


		// POST: api/Cantiere
		// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
		[HttpPost]
		[Authorize(Roles = UserPolicy.Cantieri_C)]
		public async Task<int> PostCantiere(Cantiere cantiere)
		{
			var valoriAggiuntiviCantiere = cantiere.ValoriAggiuntivi;
			cantiere.ValoriAggiuntivi = null;

			_context.Cantiere.Add(cantiere);
			await _context.SaveChangesAsync();
			FinancialCard fc_init = new FinancialCard();
			fc_init.IdCantiere = cantiere.Id;
			await _context.FinancialCard.AddAsync(fc_init);

			foreach (var va in valoriAggiuntiviCantiere)
				va.IdCantiere = cantiere.Id;
			await _context.ValoriAggiuntiviCantiereContratto.AddRangeAsync(valoriAggiuntiviCantiere);

			await _context.SaveChangesAsync();

			return cantiere.Id;
		}

		[HttpPost("PMs/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_C)]
		public async Task<IActionResult> PostCantierePMs([FromRoute] int Id, [FromBody] int[] PMIDs)
		{

			var cantiere = await _context.Cantiere.FindAsync(Id);
			if (cantiere == null)
			{
				return NotFound();
			}
			var personali = _context.Personale.Where(x => PMIDs.Contains(x.Id));
			if (personali.Count() != PMIDs.Length)
			{
				return BadRequest("Alcuni PMs non sono stati trovati nella tabella del Personale");
			}

			_context.ListaProjectManagerCantiere.AddRange(
				personali.Select(x => new ListaProjectManagerCantiere
				{
					IdPersonale = x.Id,
					IdCantiere = Id
				}));

			_context.SaveChanges();
			return Ok();
		}

		[HttpPost("Foremen/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_C)]
		public async Task<IActionResult> PostCapiDiCantiere([FromRoute] int Id, [FromBody] int[] ForemenIds)
		{

			var cantiere = await _context.Cantiere.FindAsync(Id);
			if (cantiere == null)
			{
				return NotFound();
			}
			var personali = _context.Personale.Where(x => ForemenIds.Contains(x.Id));

			if (personali.Count() != ForemenIds.Length)
			{
				return BadRequest("Alcuni capo cantieri non sono stati trovati nella tabella del Personale");
			}

			_context.ListaCapiCantiere.AddRange(personali
				.Select(x => new ListaCapiCantiere
				{
					IdPersonale = x.Id,
					IdCantiere = Id
				}));

			await _context.SaveChangesAsync();
			return StatusCode(200);
		}

		/// <summary>
		/// Ritorna -1 se il personale assegnato non esistesse, altrimenti l'id della nota
		/// </summary>
		/// <param name="idCantiere"></param>
		/// <param name="Nota"></param>
		/// <returns></returns>
		[HttpPost("PostNotaDiCantiere/{idCantiere}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<int> PostNotaDiCantiere([FromRoute] int idCantiere, Note Nota)
		{
			////controllo l'esistenza del personale assegnato
			//foreach (PersonaleResponsabileNota newPrn in NotaDiCantiere.personaleTagged)
			//{
			//    if (!await _context.Personale.AnyAsync(p => p.Id == newPrn.IdPersonale))
			//    {
			//        return -1;
			//    }
			//}

			Nota.CreationDate = DateTime.Now.Date;

			ListaNoteDiCantiere ndc = new ListaNoteDiCantiere();

			//creo la nota sul db
			_context.Note.Add(Nota);
			await _context.SaveChangesAsync();

			//collego la nota al cantiere
			ndc.IdCantiere = idCantiere;
			ndc.IdNote = Nota.Id;
			_context.ListaNoteDiCantiere.Add(ndc);

			//collego il personale alla nota
			//if(NotaDiCantiere.personaleTagged != null && NotaDiCantiere.personaleTagged.Count() != 0)
			//{
			//    foreach (Personale newP in NotaDiCantiere.personaleTagged)
			//    {
			//        //newPrn.IdNote = NotaDiCantiere.Nota.Id;
			//        PersonaleResponsabileNota newPrn = new PersonaleResponsabileNota();
			//        newPrn.IdNote = NotaDiCantiere.Nota.Id;
			//        newPrn.IdPersonale = newP.Id;
			//        await _context.PersonaleResponsabileDiNota.AddAsync(newPrn);
			//    }
			//}
			await _context.SaveChangesAsync();

			//return CreatedAtAction("GetNote", new { id = NotaDiCantiere.Id }, NotaDiCantiere);
			return Nota.Id;
		}

		[HttpPost("PersonaleAssegnato/{idCantiere}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<ActionResult<IEnumerable<ListaPersonaleAssegnatoDiCantiere>>> PostPersonaleAssegnatoAsync([FromRoute] int idCantiere, int[] idPersonale, DateTime? fromDate, DateTime? toDate)
		{
			List<ListaPersonaleAssegnatoDiCantiere> lps = new List<ListaPersonaleAssegnatoDiCantiere>();

			//foreach (int id in idPersonale)
			//{
			//    if (await CheckPersonaleAvailability(id, fromDate, toDate) == false)
			//        //Throws conflicts when one of the workers is already busy somewhere else
			//        throw new System.Web.Http.HttpResponseException(System.Net.HttpStatusCode.Conflict);
			//}

			foreach (int id in idPersonale)
			{

				ListaPersonaleAssegnatoDiCantiere lspadc = new ListaPersonaleAssegnatoDiCantiere();

				lspadc.IdCantiere = idCantiere;
				lspadc.IdPersonale = id;
				lspadc.FromDate = fromDate;
				lspadc.ToDate = toDate;
				lspadc.Personale = _context.Personale.Find(id);

				_context.ListaPersonaleAssegnatoDiCantiere.Add(lspadc);
				lps.Add(lspadc);
			}

			await _context.SaveChangesAsync();

			return lps;
		}

		[HttpPost("MezziDiCantiere/{idCantiere}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<ActionResult<IEnumerable<ListaMezziDiCantiere>>> PostMezziDiCantiereAsync([FromRoute] int idCantiere, int[] idMezzi, DateTime fromDate, DateTime toDate)
		{
			List<ListaMezziDiCantiere> lmc = new List<ListaMezziDiCantiere>();

			foreach (int id in idMezzi)
			{

				ListaMezziDiCantiere lmdc = new ListaMezziDiCantiere();

				lmdc.IdCantiere = idCantiere;
				lmdc.IdMezzi = id;
				lmdc.fromDate = fromDate;
				lmdc.toDate = toDate;
				lmdc.Mezzo = _context.Mezzi.Find(id);

				_context.ListaMezziDiCantiere.Add(lmdc);
				lmc.Add(lmdc);
			}

			await _context.SaveChangesAsync();

			return lmc;
		}

		[HttpPost("FornitoriDiCantiere/{idCantiere}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<ActionResult<IEnumerable<Fornitori>>> PostFornitoriDiCantiereAsync([FromRoute] int idCantiere, int[] idFornitori)
		{
			List<ListaFornitoriCantiere> lfc = new List<ListaFornitoriCantiere>();

			foreach (int id in idFornitori)
			{

				ListaFornitoriCantiere lfdc = new ListaFornitoriCantiere();
				lfdc.IdCantiere = idCantiere;
				lfdc.IdFornitore = id;

				if ((await _context.ListaFornitoriCantiere.Where(fc => fc.IdCantiere == idCantiere).Where(fcc => fcc.IdFornitore == id).ToListAsync()).Count() != 0)
				{
					//Fornitore già fornito
					continue;
				}

				lfdc.Fornitore = await _context.Fornitori.FindAsync(id);
				_context.ListaFornitoriCantiere.Add(lfdc);
				lfc.Add(lfdc);
			}

			await _context.SaveChangesAsync();

			return lfc.Select(fc => fc.Fornitore).ToList();
		}

		[HttpPost("MultipleFile/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<IEnumerable<_File>> PostMultipleFileCantiere([FromRoute] int Id, IEnumerable<IFormFile> Files)
		{

			List<_File> fs = new List<_File>();

			foreach (IFormFile file in Files)
			{
				ListaFileDiCantiere lfc = new ListaFileDiCantiere();
				lfc.IdCantiere = Id;

				_File f = await FileManager.SaveNewFile(file, _config);
				_context.File.Add(f);
				await _context.SaveChangesAsync();

				lfc.IdFile = f.Id;

				fs.Add(f);
				_context.ListaFileDiCantiere.Add(lfc);
			}

			await _context.SaveChangesAsync();
			return fs;
		}

		[HttpPost("File/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<_File> PostFileCantiere([FromRoute] int Id, IFormFile formFile)
		{
			ListaFileDiCantiere lfc = new ListaFileDiCantiere();
			lfc.IdCantiere = Id;

			_File f = await FileManager.SaveNewFile(formFile, _config);
			_context.File.Add(f);
			await _context.SaveChangesAsync();

			lfc.IdFile = f.Id;

			_context.ListaFileDiCantiere.Add(lfc);

			await _context.SaveChangesAsync();
			return f;
		}

		[HttpPost("{IdCantiere}/Files")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<_File> NewPostFileCantiere([FromRoute] int IdCantiere, [FromQuery] string? type, IFormFile formFile)
		{
			ListaFileDiCantiere lfc = new ListaFileDiCantiere();
			lfc.IdCantiere = IdCantiere;

			_File f = await FileManager.SaveNewFile(formFile, _config);
			_context.File.Add(f);
			await _context.SaveChangesAsync();

			lfc.IdFile = f.Id;
			lfc.type = type;

			_context.ListaFileDiCantiere.Add(lfc);

			await _context.SaveChangesAsync();
			return f;
		}

		[HttpPost("GetPersonaleAvailability")]
		[Authorize(Roles = UserPolicy.Personale_R)]
		public async Task<ActionResult<IEnumerable<int>>> getAvailabilityPersonalePerCantiereAsync([FromBody] int[] Ids, DateTime fromDate, DateTime toDate)
		{
			List<int> availability = new List<int>();
			foreach (int Id in Ids)
			{
				if (!await CheckPersonaleAvailability(Id, fromDate, toDate))
					availability.Add(Id);
			}
			return availability;
		}


		//##########################################################################//
		//                      POST PER Update                                     //
		//##########################################################################//

		[HttpPost("UpdateCantiere")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<IActionResult> UpdateCantiere(Cantiere cantiere)
		{
			_context.Entry(cantiere).State = EntityState.Modified;
			int id = cantiere.Id;

			await UpdateValoriAggiuntiviContrattoAsyncNoSave(cantiere.Id, cantiere.ValoriAggiuntivi.ToImmutableArray());//DA TESTARE

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!CantiereExists(id))
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



		[HttpPost("UpdatePMs/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<IActionResult> UpdateCantierePMs([FromRoute] int Id, [FromBody] int[] PMIDs)
		{

			var cantiere = await _context.Cantiere.FindAsync(Id);
			if (cantiere == null)
			{
				return NotFound();
			}
			var personali = _context.Personale.Where(x => PMIDs.Contains(x.Id));
			if (personali.Count() != PMIDs.Length)
			{
				return BadRequest("Alcuni PMs non sono stati trovati nella tabella del Personale");
			}
			// Getting old pm
			IEnumerable<ListaProjectManagerCantiere> lpmc = _context.ListaProjectManagerCantiere.Where(lpm => lpm.IdCantiere == Id);
			_context.ListaProjectManagerCantiere.RemoveRange(lpmc);
			_context.ListaProjectManagerCantiere.AddRange(personali
				.Select(x => new ListaProjectManagerCantiere
				{
					IdPersonale = x.Id,
					IdCantiere = Id
				}));
			await _context.SaveChangesAsync();

			return StatusCode(200);
		}


		[HttpPost("UpdateForemen/{Id}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<IActionResult> UpdateCapiDiCantiere([FromRoute] int Id, [FromBody] int[] ForemenIds)
		{

			var cantiere = await _context.Cantiere.FindAsync(Id);
			if (cantiere == null)
			{
				return NotFound();
			}
			var personali = _context.Personale.Where(x => ForemenIds.Contains(x.Id));

			if (personali.Count() != ForemenIds.Length)
			{
				return BadRequest("Alcuni capo cantieri non sono stati trovati nella tabella del Personale");
			}
			_context.ListaCapiCantiere.RemoveRange(_context.ListaCapiCantiere.Where(x => x.IdCantiere == Id));
			_context.ListaCapiCantiere.AddRange(personali
				.Select(x => new ListaCapiCantiere
				{
					IdPersonale = x.Id,
					IdCantiere = Id
				}));

			await _context.SaveChangesAsync();
			return StatusCode(200);
		}

		/// <summary>
		/// 
		/// Ritorna -1 quando la nota non è stata trovata
		/// </summary>
		/// <param name="idCantiere"></param>
		/// <param name="NotaDiCantiere"></param>
		/// <returns></returns>
		[HttpPost("UpdateNotaDiCantiere/{idCantiere}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<ActionResult<NoteDiCantiereView>> UpdateNotaDiCantiere([FromRoute] int idCantiere, NoteDiCantiereView NotaDiCantiere)
		{
			if (!await _context.Note.AnyAsync(n => n.Id == NotaDiCantiere.Nota.Id))
			{
				return NoContent();
			}

			_context.Note.Update(NotaDiCantiere.Nota);
			await _context.SaveChangesAsync();


			//se il personale taggato nella nota non è presente dopo la modifica elimino
			foreach (PersonaleResponsabileNota PersonaleAlreadyTagged in await _context.PersonaleResponsabileDiNota.Where(pr => pr.IdNote == NotaDiCantiere.Nota.Id).ToListAsync())
			{
				if (!NotaDiCantiere.personaleTagged.Any(p => p.Id == PersonaleAlreadyTagged.IdPersonale))
				{
					_context.PersonaleResponsabileDiNota.Remove(PersonaleAlreadyTagged);
					await _context.SaveChangesAsync();
				}
			}

			//Se il personale taggato dopo la modifica non è ancora collegato alla nota, lo  collego
			foreach (Personale newP in NotaDiCantiere.personaleTagged)
			{
				if (!_context.PersonaleResponsabileDiNota.Where(ppr => ppr.IdNote == NotaDiCantiere.Nota.Id).Any(pr => pr.IdPersonale == newP.Id))
				{

					PersonaleResponsabileNota newPrn = new PersonaleResponsabileNota();
					newPrn.IdNote = NotaDiCantiere.Nota.Id;
					newPrn.IdPersonale = newP.Id;
					_context.PersonaleResponsabileDiNota.Add(newPrn);
					await _context.SaveChangesAsync();
				}
			}

			//return CreatedAtAction("GetNote", new { id = NotaDiCantiere.Id }, NotaDiCantiere);
			return NotaDiCantiere;
		}



		[HttpPost("UpdatePersonaleAssegnato/{idCantiere}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<IActionResult> UpdatePersonaleAssegnatoAsync([FromRoute] int idCantiere, ListaPersonaleAssegnatoDiCantiere lpadc)
		{
			if (!await _context.ListaPersonaleAssegnatoDiCantiere.AnyAsync(x => x.Id == lpadc.Id))
			{
				return NoContent();
			}
			_context.ListaPersonaleAssegnatoDiCantiere.Update(lpadc);
			await _context.SaveChangesAsync();
			return StatusCode(200);
		}


		//##########################################################################//
		//                      POST PER ELIMINAZIONE                               //
		//##########################################################################//
		[HttpPost("DeleteMultiplePersonale/{IdCantiere}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<int> DeletePersonaleRange([FromRoute] int IdCantiere, int[] listaPersonale)
		{

			var cantiere = await _context.Note.FindAsync(IdCantiere);

			//Unlinking Personale from cantieri
			foreach (int id in listaPersonale)
			{

				_context.ListaPersonaleAssegnatoDiCantiere.Remove(
										await _context.ListaPersonaleAssegnatoDiCantiere.FindAsync(id));
			}
			await _context.SaveChangesAsync();
			return listaPersonale.Count();
		}

		[HttpPost("DeleteMultipleMezzi/{IdCantiere}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<int> DeleteMezziRange([FromRoute] int IdCantiere, int[] listaMezzi)
		{

			var cantiere = await _context.Note.FindAsync(IdCantiere);

			//Unlinking Personale from cantieri
			foreach (int id in listaMezzi)
			{

				_context.ListaMezziDiCantiere.Remove(
										await _context.ListaMezziDiCantiere.FindAsync(id));
			}
			await _context.SaveChangesAsync();
			return listaMezzi.Count();
		}

		[HttpPost("DeleteMultipleFornitori/{IdCantiere}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<int> DeleteFornitoriRange([FromRoute] int IdCantiere, int[] listaFornitori)
		{

			var cantiere = await _context.Note.FindAsync(IdCantiere);

			//Unlinking Personale from cantieri
			foreach (int id in listaFornitori)
			{

				_context.ListaFornitoriCantiere.RemoveRange(
										await _context.ListaFornitoriCantiere.Where(lfc => lfc.IdCantiere == IdCantiere)
																			 .Where(fc => fc.IdFornitore == id).ToListAsync());
			}
			await _context.SaveChangesAsync();
			return listaFornitori.Count();
		}


		/////////////////////////////////////////////////////////////////////////////
		///     API DI DELETE                                                ////////
		/////////////////////////////////////////////////////////////////////////////

		[HttpPost("Delete/{id}")]
		[Authorize(Roles = UserPolicy.Cantieri_D)]
		public async Task<IActionResult> DeleteCantiere(int id)
		{
			var cantiere = await _context.Cantiere.FindAsync(id);
			if (cantiere == null)
			{
				return NotFound();
			}

			List<_File> filesToDelete = await _context.ListaFileDiCantiere.Where(lf => lf.IdCantiere == id).Include(lf => lf.File).Select(lf => lf.File).ToListAsync();
			foreach (_File f in filesToDelete)
			{
				FileManager.DeleteFile(f, _config);
			}
			_context.File.RemoveRange(filesToDelete);

			List<int> noteToDelete = await _context.ListaNoteDiCantiere.Where(ln => ln.IdCantiere == id).Select(ln => ln.IdNote).ToListAsync();
			await new NoteController(_context, _config).DeleteNoteRange(noteToDelete.ToArray());

			var valoriAggiuntiviCantiere = _context.ValoriAggiuntiviCantiereContratto.Where(x => x.IdCantiere == cantiere.Id).AsEnumerable();
			_context.ValoriAggiuntiviCantiereContratto.RemoveRange(valoriAggiuntiviCantiere);
			_context.Cantiere.Remove(cantiere);
			await _context.SaveChangesAsync();

			return NoContent();
		}

		// DELETE: api/Cantiere/5
		[HttpDelete("{id}")]
		[Authorize(Roles = UserPolicy.Cantieri_D)]
		public async Task<IActionResult> DeleteCantiereMale(int id)
		{
			var cantiere = await _context.Cantiere.FindAsync(id);
			if (cantiere == null)
			{
				return NotFound();
			}

			List<_File> filesToDelete = await _context.ListaFileDiCantiere.Where(lf => lf.IdCantiere == id).Include(lf => lf.File).Select(lf => lf.File).ToListAsync();
			foreach (_File f in filesToDelete)
			{
				FileManager.DeleteFile(f, _config);
			}
			_context.File.RemoveRange(filesToDelete);

			List<int> noteToDelete = await _context.ListaNoteDiCantiere.Where(ln => ln.IdCantiere == id).Select(ln => ln.IdNote).ToListAsync();
			await new NoteController(_context, _config).DeleteNoteRange(noteToDelete.ToArray());


			_context.Cantiere.Remove(cantiere);
			await _context.SaveChangesAsync();

			return NoContent();
		}


		/////////////////////////////////////////////////////////////////////////////
		///     ALTRO                                                        ////////
		/////////////////////////////////////////////////////////////////////////////
		private bool CantiereExists(int id)
		{
			return _context.Cantiere.Any(e => e.Id == id);
		}




		////////////////////////////////////////////////////////////////////////////////////
		/// FINANCIAL CARDS
		///////////////////////////////////////////////////////////////////////////////////

		// GET: api/FinancialCard/5
		[HttpGet("{IdCantiere}/FinancialCard")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<FinancialCard>> GetFinancialCard([FromRoute] int IdCantiere)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == IdCantiere);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, IdCantiere))
				return NotFound();

			var financialCard = await _context.FinancialCard.SingleAsync(x => x.IdCantiere == IdCantiere);

			if (financialCard == null)
			{
				return NotFound();
			}

			return financialCard;
		}

		[HttpGet("{IdCantiere}/FinancialCard/Cashflow")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<double>> GetCashFlow([FromRoute] int IdCantiere)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == IdCantiere);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, IdCantiere))
				return NotFound();

			var financialCard = await _context.FinancialCard.SingleAsync(x => x.IdCantiere == IdCantiere);

			if (financialCard == null)
			{
				return NotFound();
			}

			return financialCard.cashflow;
		}

		// PUT: api/FinancialCard/5
		// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
		[HttpPost("{idCantiere}/Update/FinancialCard")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<IActionResult> PutFinancialCard([FromRoute] int idCantiere, FinancialCard financialCard)
		{
			if (!CantiereExists(idCantiere))
			{
				return NotFound();
			}
			if (idCantiere != financialCard.IdCantiere)
			{
				return BadRequest();
			}
			if (!await foremanGuard(HttpContext, idCantiere))
				return NotFound();
			_context.Entry(financialCard).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!FinancialCardExists(financialCard.Id))
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

		[HttpPost("{idCantiere}/Update/FinancialCard/Cashflow")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<IActionResult> PutFinancialCard([FromRoute] int idCantiere, double cashflow)
		{
			if (!CantiereExists(idCantiere))
			{
				return NotFound();
			}
			if (!await foremanGuard(HttpContext, idCantiere))
				return NotFound();
			FinancialCard financialCard = await _context.FinancialCard.SingleAsync(x => x.IdCantiere == idCantiere);
			financialCard.cashflow = cashflow;
			_context.Entry(financialCard).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!FinancialCardExists(financialCard.Id))
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

		// POST: api/FinancialCard
		// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
		[HttpPost("{idCantiere}/FinancialCard")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<ActionResult<FinancialCard>> PostFinancialCard([FromRoute] int idCantiere, FinancialCard financialCard)
		{
			if (!CantiereExists(idCantiere))
			{
				return NotFound();
			}
			if (idCantiere != financialCard.IdCantiere)
			{
				return BadRequest();
			}
			_context.FinancialCard.Add(financialCard);
			await _context.SaveChangesAsync();

			return CreatedAtAction("GetFinancialCard", new { id = financialCard.Id }, financialCard);
		}

		// DELETE: api/FinancialCard/5
		[HttpPost("{idCantiere}/Delete/FinancialCard/{id}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<IActionResult> DeleteFinancialCard([FromRoute] int idCantiere, [FromRoute] int id)
		{
			var financialCard = await _context.FinancialCard.FindAsync(id);

			if (financialCard == null)
			{
				return NotFound();
			}

			if (idCantiere != financialCard.IdCantiere)
			{
				return BadRequest();
			}

			_context.FinancialCard.Remove(financialCard);
			await _context.SaveChangesAsync();

			return NoContent();
		}

		private bool FinancialCardExists(int id)
		{
			return _context.FinancialCard.Any(e => e.Id == id);
		}



		//##()(/)(/)()(()/()/)//()/()
		//          REPORT DI CANTIERE

		/// <summary>
		/// Crea un report di cantiere sul db, senza attachments
		/// </summary>
		/// <param name="idCantiere">Il cantiere a cui allegare il report</param>
		/// <param name="report">Il modello generale di report di cantiere, contenente tutte le informazioni necessarie (tra cui timecards, vehicleTimeCarss...)</param>
		/// <returns>Il report di cantiere generato meno la firma e il questionario</returns>
		[HttpPost("{idCantiere}/ReportDiCantiere")]
		[Authorize(Roles = UserPolicy.ReportDiCantiere_C)]
		public async Task<ActionResult<Object>> PostReportDiCantiere([FromRoute] int idCantiere, ReportModel report)
		{
			ReportDiCantiere reportDiCantiere = new ReportDiCantiere();

			reportDiCantiere.Sign = report.Signature;
			reportDiCantiere.IdCantiere = idCantiere;
			reportDiCantiere.Author = report.Author;
			reportDiCantiere.referenceDate = report.referenceDate;
			reportDiCantiere.Status = report.Status;
			//var users = _userManager.Users.ToList();

			_context.ReportDiCantiere.Add(reportDiCantiere);
			await _context.SaveChangesAsync();

			await UpdateProgressiviReportDiCantiere(idCantiere);

			try
			{
				PersonaleReportModel tcfm = report.personale;
				List<TimeCard> tcs = tcfm.TimeCardFrontEndModelToTimeCard(reportDiCantiere.Id);

				for (int i = 0; i < tcs.Count(); i++)
				{
					if (tcs[i] == null)
						tcs.Remove(tcs[i]);
				}

				if (tcs != null && tcs.Count() != 0)
					await _context.TimeCard.AddRangeAsync(tcs);
				await _context.SaveChangesAsync();

				VehiclesReportModel vcfm = report.mezzi;
				IEnumerable<VehicleCard> vcs = vcfm.VehicleCardFrontendModelToVehicleCard(reportDiCantiere.Id);
				if (vcs != null)
					await _context.VehicleCard.AddRangeAsync(vcs);
				await _context.SaveChangesAsync();

				LavoriEseguitiReportModel lscfm = report.lavoriEseguiti;
				IEnumerable<ListOfServicesSoldToClient> lossc = lscfm.ListaServiziClienteFrontEndModelToListOfServicesSoldToClient(reportDiCantiere.Id);
				if (lossc != null)
					await _context.ListOfServicesSoldToClient.AddRangeAsync(lossc);
				await _context.SaveChangesAsync();

				ProvvisteReportModel lsffm = report.provviste;
				IEnumerable<ListOfGoodsAndServicesInUse> lossf = lsffm.ListaServiziFornitoreFrontENdModelToListaServiziFornitoreFrontENdModel(reportDiCantiere.Id);
				if (lossf != null)
					await _context.ListOfGoodsAndServicesInUse.AddRangeAsync(lossf);
				await _context.SaveChangesAsync();

				report.allegatiEQuestionario.IdReport = reportDiCantiere.Id;
				report.allegatiEQuestionario.FixNulls();
				await _context.AllegatiEQuestionarioReportModel.AddAsync(report.allegatiEQuestionario);
				await _context.SaveChangesAsync();
			}
			catch (Exception e)
			{
				_context.ReportDiCantiere.Remove(reportDiCantiere);
				await _context.SaveChangesAsync();
				return StatusCode(StatusCodes.Status500InternalServerError, e.ToString());
			}
			return CreatedAtAction("GetReportDiCantiere", new { id = reportDiCantiere.Id }, new
			{
				reportDiCantiere.Id,
				reportDiCantiere.IdCantiere,
				reportDiCantiere.date,
				reportDiCantiere.Author
			});
		}

		/// <summary>
		/// Aggiorna i progressivi contatori dei report per uno specifico cantiere
		/// </summary>
		/// <param name="idCantiere"></param>
		/// <returns></returns>
		private async Task UpdateProgressiviReportDiCantiere(int idCantiere)
		{
			//TODO: l'ordinamento per referenceDate viene fatto in memoria, scaricando prima tutti i report
			//per questioni legate al tipo di dato string della referenceDate (ordinare per referenceDate sul motore sql significherebbe
			//applicare le regole di collation che non riguardano le date
			var allReportsDiCantiere = _context.ReportDiCantiere
				.Where(x => x.IdCantiere == idCantiere && !string.IsNullOrWhiteSpace(x.referenceDate)).AsEnumerable()
				.OrderBy(x => DateTime.Parse(x.referenceDate!))
				.ThenBy(x => x.date);

			ushort counter = 1;
			foreach (var report in allReportsDiCantiere)
				report.Counter = counter++;
			await _context.SaveChangesAsync();
		}

		[HttpPost("{idCantiere}/ReportDiCantiere/{idReport}/Update")]
		//[Authorize(Roles = UserPolicy.ReportDiCantiere_C)]
		public async Task<ActionResult<Object>> PostReportDiCantiere([FromRoute] int idCantiere, [FromQuery] int idReport, ReportModel report)
		{
			ReportDiCantiere reportDiCantiere = await _context.ReportDiCantiere.SingleAsync(x => x.Id == idReport);

			if (reportDiCantiere.IdCantiere != idCantiere)
				return BadRequest("The request report is not from the requested Cantiere!");

			reportDiCantiere.Sign = report.Signature;
			reportDiCantiere.IdCantiere = idCantiere;
			reportDiCantiere.referenceDate = report.referenceDate;
			reportDiCantiere.Status = report.Status;

			//var user = _userManager.Users.Single(x => x.UserName == report.Author);
			//var personale = _context.Personale.Single(x => x.email == user.Email);
			//reportDiCantiere.Author = /*report.Author*/string.Join(" ",personale.Name, personale.Surname);

			_context.ReportDiCantiere.Update(reportDiCantiere);

			List<TimeCard> old_tcs = await _context.TimeCard.Where(x => x.IdReport == idReport).ToListAsync();
			_context.TimeCard.RemoveRange(old_tcs);

			List<VehicleCard> old_vcs = await _context.VehicleCard.Where(x => x.IdReport == idReport).ToListAsync();
			_context.VehicleCard.RemoveRange(old_vcs);

			List<ListOfServicesSoldToClient> old_lss = await _context.ListOfServicesSoldToClient.Where(x => x.IdReport == idReport).ToListAsync();
			_context.ListOfServicesSoldToClient.RemoveRange(old_lss);

			List<ListOfGoodsAndServicesInUse> old_lgs = await _context.ListOfGoodsAndServicesInUse.Where(x => x.IdReport == idReport).ToListAsync();
			_context.ListOfGoodsAndServicesInUse.RemoveRange(old_lgs);


			PersonaleReportModel tcfm = report.personale;
			List<TimeCard> tcs = tcfm.TimeCardFrontEndModelToTimeCard(reportDiCantiere.Id);

			for (int i = 0; i < tcs.Count(); i++)
			{
				if (tcs[i] == null)
					tcs.Remove(tcs[i]);
			}

			if (tcs != null)
				await _context.TimeCard.AddRangeAsync(tcs);

			VehiclesReportModel vcfm = report.mezzi;
			IEnumerable<VehicleCard> vcs = vcfm.VehicleCardFrontendModelToVehicleCard(reportDiCantiere.Id);
			if (vcs != null)
				await _context.VehicleCard.AddRangeAsync(vcs);

			LavoriEseguitiReportModel lscfm = report.lavoriEseguiti;
			IEnumerable<ListOfServicesSoldToClient> lossc = lscfm.ListaServiziClienteFrontEndModelToListOfServicesSoldToClient(reportDiCantiere.Id);
			if (lossc != null)
				await _context.ListOfServicesSoldToClient.AddRangeAsync(lossc);

			ProvvisteReportModel lsffm = report.provviste;
			IEnumerable<ListOfGoodsAndServicesInUse> lossf = lsffm.ListaServiziFornitoreFrontENdModelToListaServiziFornitoreFrontENdModel(reportDiCantiere.Id);
			if (lossf != null)
				await _context.ListOfGoodsAndServicesInUse.AddRangeAsync(lossf);

			report.allegatiEQuestionario.IdReport = reportDiCantiere.Id;
			report.allegatiEQuestionario.FixNulls();

			//First of all i delete the older one (i do not have the id and atm idk how to manage tracking conflicts)
			var oldAllegatiEQuestionario = await _context.AllegatiEQuestionarioReportModel.SingleOrDefaultAsync(x => x.IdReport == idReport);
			if (oldAllegatiEQuestionario is not null)
				_context.AllegatiEQuestionarioReportModel.Remove(oldAllegatiEQuestionario);

			await _context.AllegatiEQuestionarioReportModel.AddAsync(report.allegatiEQuestionario);

			await _context.SaveChangesAsync(); // I save changes only when i'm 100% sure everything went fine, otherwise i don't.
											   // It's basically an automatic rollaback. If things go wrong, nothing will be saved!
			await UpdateProgressiviReportDiCantiere(idCantiere);

			return CreatedAtAction("GetReportDiCantiere", new { id = reportDiCantiere.Id }, new
			{
				reportDiCantiere.Id,
				reportDiCantiere.IdCantiere,
				reportDiCantiere.date,
				reportDiCantiere.Author
			});
		}

		/// <summary>
		/// Ritorna i report di cantiere allegati ad un cantiere
		/// </summary>
		/// <param name="IdCantiere">Il cantiere di riferimento</param>
		/// <param name="idReport">Il report richiesto</param>
		/// <param name="dateFrom">Se presente, filtra i report ritornati a partire da questa data</param>
		/// <param name="dateTo">Se presente, filtra i report ritornati fino a questa data</param>
		/// <returns>Lista dei report di cantieere con informazioni di base se idReport == null, altrimenti il singolo report di cantiere.</returns>
		[HttpGet("{IdCantiere}/ReportDiCantiere")]
		[Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
		public async Task<ActionResult<IEnumerable<Object>>> GetReportDiCantiere([FromRoute] int IdCantiere, [FromQuery] int? idReport, [FromQuery] string? dateFrom, [FromQuery] string? dateTo)
		{
			// Ritorno un object poiché nel caso richiedesse la lista completa ritorno
			// Il report ma senza la firma che sarebbe veramente di troppo
			if (idReport == null || idReport <= 0)
			{
				IQueryable<ReportDiCantiere> q = _context.ReportDiCantiere;
				q = q.Where(x => x.IdCantiere == IdCantiere);
				//q = q.Where(x => x.IsDraft == isDraft);

				if (dateFrom != null && dateFrom != string.Empty)
				{
					// Fa schifo, ma sono giunto alla conclusione che non mi interessa. Bella.    
					DateTime datefrom = DateTime.Parse(dateFrom);
					//var dateto = DateTime.Parse(dateFrom);
					q = q.ToList().Where(x => x.referenceDate != null && DateTime.Parse(x.referenceDate) >= datefrom).AsQueryable();

				}
				if (dateTo != null && dateTo != string.Empty)
				{
					DateTime dateto = DateTime.Parse(dateTo);
					q = q.ToList().Where(x => x.referenceDate != null && DateTime.Parse(x.referenceDate) <= dateto).AsQueryable();
				}

				var reportList = q.ToList();

				var shortReportsList = new List<Object>();
				foreach (var rp in reportList)
				{
					shortReportsList.Add(await rp.getShortedVersionAsync(_context, rp));
				}
				return shortReportsList;
			}

			var report = await _context.ReportDiCantiere.SingleAsync(x => x.Id == idReport);

			if (report.IdCantiere != IdCantiere)
				return NotFound();
			else
				return new ReportDiCantiere[] { report };
		}
		[HttpGet("{idCantiere}/GetLastReportDiCantiere")]
		[Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
		public async Task<ReportDiCantiere?> GetLastReportDiCantiere([FromRoute] int idCantiere)
		{
			return await _context.ReportDiCantiere.Where(x => x.IdCantiere == idCantiere).OrderByDescending(x => x.Id).FirstOrDefaultAsync();
		}

		[HttpGet("{idCantiere}/SummaryReport")]
		public async Task<ReportDiCantiereViewModel> GetSummaryReport([FromRoute] int idCantiere, [FromQuery] int? idReport, [FromQuery] string? dateFrom, [FromQuery] string? dateTo, [FromQuery] bool? mostraCosti, [FromQuery] bool? mostraRicavi, [FromQuery] bool? mostraFoto, [FromQuery] bool? reportCompleto, [FromQuery] bool reportSingolo)
		{
			List<ReportDiCantiere> reportList = [];
			if (idReport.HasValue && idReport != 0 && reportSingolo)
			{
				//sto lavorando su unico report
				var singolo = _context.ReportDiCantiere.Find(idReport);
				if (singolo is not null)
					reportList.Add(singolo);
				else
					throw new Exception($"Report con id {idReport} non trovato");
			}
			else
				reportList = ReportUtils.GetReportsBetweenDates(_context, idCantiere, dateFrom, dateTo);

			ReportDiCantiereViewModel toReturn = new() { ReportSingolo = reportSingolo };
			// Converti le stringhe in oggetti DateTime
			if (dateFrom == null)
			{
				throw new ArgumentNullException(nameof(dateFrom), "dateFrom cannot be null.");
			}

			if (dateTo == null)
			{
				throw new ArgumentNullException(nameof(dateTo), "dateTo cannot be null.");
			}

			DateTime dateFromParsed = DateTime.ParseExact(dateFrom, "yyyy-MM-dd", CultureInfo.InvariantCulture);
			DateTime dateToParsed = DateTime.ParseExact(dateTo, "yyyy-MM-dd", CultureInfo.InvariantCulture);



			// Formatta le date nel formato desiderato
			string dateFromFormatted = dateFromParsed.ToString("dd/MM/yyyy");
			string dateToFormatted = dateToParsed.ToString("dd/MM/yyyy");

			toReturn.mostraCosti = mostraCosti;
			toReturn.mostraRicavi = mostraRicavi;
			toReturn.mostraFoto = mostraFoto;
			toReturn.reportCompleto = reportCompleto;

			if (idReport.HasValue)
			{
				toReturn.Id = idReport.GetValueOrDefault();

				//Stiamo scaricando un report singolo dato che abbiamo il reportID, carico i dati del report come Autore e la sua firma
				if (toReturn.Id != 0)
				{
					var report = await _context.ReportDiCantiere.SingleAsync(x => x.Id == toReturn.Id);
					toReturn.Author = report.Author;
					toReturn.Sign = report.Sign;
					toReturn.ProgressivoContatore = report.Counter;
					toReturn.reportCompleto = false;
				}
			}

			// Concatena le stringhe formattate
			toReturn.date = dateFromFormatted + " - " + dateToFormatted;
			toReturn.file_base_path = _config["folderPath"];
			toReturn.Cantiere = await _context.Cantiere
				.Include(x => x.Contratto)
				.Include(x => x.Contratto.Cliente)
				.SingleAsync(x => x.Id == idCantiere);

			toReturn.oreNormali = await AggregaPersonale(reportList, TimeCardsTypes.Ordinary);
			toReturn.OreStraordinarie = await AggregaPersonale(reportList, TimeCardsTypes.ExtraOrdinary);
			toReturn.OreSpostamento = await AggregaPersonale(reportList, TimeCardsTypes.Travel);

			toReturn.VehiclesStuff = await AggregaMezzi(reportList);
			toReturn.Provviste = await AggregaProvviste(reportList);
			toReturn.LavoriEseguiti = await AggregaLavoriEseguiti(reportList, reportSingolo);
			toReturn.Questionario = await AggregaAllegatiEQuestionario(reportList);
			toReturn.Immagini = await AggregaImmagini(reportList);

			return toReturn;
		}

		public class OreCantieriResponse
		{
			public double OreOrdinarie { get; set; }
			public double OreStraordinarie { get; set; }
			public double OreSpostamento { get; set; }
		}

		public class CostiCantieriResponse
		{
			public double CostiMezzi { get; set; }
			public double CostiManodopera { get; set; }
			public double CostiMateriali { get; set; }
		}

		[AllowAnonymous]
		[HttpPost("getOreCantieri")]
		public async Task<ActionResult<OreCantieriResponse>> GetOreCantieri(int[] idCantieri, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
		{
			List<ReportDiCantiere> reportList = new();
			foreach (var idcantiere in idCantieri.AsParallel().AsUnordered())
				reportList.AddRange(ReportUtils.GetReportsBetweenDates(_context, idcantiere, dateFrom?.ToString("yyyy-MM-dd"), dateTo?.ToString("yyyy-MM-dd")));

			var oreNormali = (await AggregaPersonale(reportList, TimeCardsTypes.Ordinary)).Sum(x => x.NumberOfHours);
			var oreStraordinarie = (await AggregaPersonale(reportList, TimeCardsTypes.ExtraOrdinary)).Sum(x => x.NumberOfHours);
			var oreSpostamento = (await AggregaPersonale(reportList, TimeCardsTypes.Travel)).Sum(x => x.NumberOfHours);

			var response = new OreCantieriResponse
			{
				OreOrdinarie = oreNormali,
				OreStraordinarie = oreStraordinarie,
				OreSpostamento = oreSpostamento
			};

			return Ok(response);
		}

		[AllowAnonymous]
		[HttpPost("getCostiMezziManodoperaMaterialiCantieri")]
		public async Task<ActionResult<CostiCantieriResponse>> GetCostiCantieri(int[] idCantieri, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
		{
			List<ReportDiCantiere> reportList = new();
			foreach (var idcantiere in idCantieri.AsParallel().AsUnordered())
				reportList.AddRange(ReportUtils.GetReportsBetweenDates(_context, idcantiere, dateFrom?.ToString("yyyy-MM-dd"), dateTo?.ToString("yyyy-MM-dd")));

			var costoMezzi = (await AggregaMezzi(reportList)).Sum(x => (x.FuelCost * x.LitersOfFuel) + ((x.Mezzo?.DailyCost * x.NumberOfHoursOfUsage) ?? 0));
			var costiManodoperaOrdinarie = (await AggregaPersonale(reportList, TimeCardsTypes.Ordinary)).Sum(x => x.NumberOfHours * (x.Personale.ordinaryPrice ?? 0));
			var costiManodoperaStraordinarie = (await AggregaPersonale(reportList, TimeCardsTypes.ExtraOrdinary)).Sum(x => x.NumberOfHours * (x.Personale.extraordinaryPrice ?? 0));
			var costiManodoperaSpostamento = (await AggregaPersonale(reportList, TimeCardsTypes.Travel)).Sum(x => x.NumberOfHours * (x.Personale.travelPrice ?? 0));
			var costiMateriali = (await AggregaProvviste(reportList)).Sum(x => (x.ServizioFornitore?.PricePerUM ?? 0) * x.Quantity);

			var response = new CostiCantieriResponse
			{
				CostiManodopera = Math.Round(costiManodoperaOrdinarie + costiManodoperaStraordinarie + costiManodoperaSpostamento, 2),
				CostiMezzi = Math.Round(costoMezzi, 2),
				CostiMateriali = Math.Round(costiMateriali, 2)
			};

			return Ok(response);
		}


		private async Task<TimeCard[]> AggregaPersonale(List<ReportDiCantiere> reportList, TimeCardsTypes Type)
		{
			var beginninDate = new DateTime(2021, 1, 1);
			var endDate = new DateTime(2021, 12, 31);
			var idReports = reportList.Select(y => y.Id);
			var timeCards = _context.TimeCard.Where(x => idReports.Contains(x.IdReport)).ToList();
			var timeCardsGroupedByPersonale = timeCards.GroupBy(x => x.PersonaleId);
			List<Personale> allPersonale = _context.Personale.Where(x => timeCards.Select(x => x.PersonaleId).Contains(x.Id)).ToList();

			List<TimeCard> result = new List<TimeCard>();

			foreach (var group in timeCardsGroupedByPersonale)
			{
				double hours = 0;
				var personale = allPersonale.Single(x => x.Id == group.Key);

				// Controlla se il ruolo è "Impiegato Tecnico"
				if (personale.OrganizationRole == "Impiegato tecnico")
				{
					if (Type == TimeCardsTypes.Ordinary)
					{
						hours = 8 * group.Count(x => x.Type == TimeCardsTypes.Ordinary);
					}
					else
					{
						hours = 0;
					}
				}
				else
				{
					if (Type == TimeCardsTypes.Ordinary)
					{
						hours = group.Where(x => x.Type == TimeCardsTypes.Ordinary).Sum(x => x.NumberOfHours);
					}
					else if (Type == TimeCardsTypes.ExtraOrdinary)
					{
						hours = group.Where(x => x.Type == TimeCardsTypes.ExtraOrdinary).Sum(x => x.NumberOfHours);
					}
					else if (Type == TimeCardsTypes.Travel)
					{
						hours = group.Where(x => x.Type == TimeCardsTypes.Travel).Sum(x => x.NumberOfHours);
					}
				}

				var newTimeCard = new TimeCard(Type, hours, personale.Id, 0, beginninDate, endDate);
				newTimeCard.Personale = personale;
				result.Add(newTimeCard);
			}

			return result.ToArray();
		}


		private async Task<VehicleCard[]> AggregaMezzi(List<ReportDiCantiere> reportList)
		{
			List<VehicleCard> result = new List<VehicleCard>();

			var idReports = reportList.Select(y => y.Id);
			var vehicleCards = _context.VehicleCard.Where(x => idReports.Contains(x.IdReport)).ToList();
			var vehicleCardsGroupedByVeichle = vehicleCards.GroupBy(x => x.MezzoId);
			List<Mezzi> allMezzi = _context.Mezzi.ToList();

			foreach (var group in vehicleCardsGroupedByVeichle)
			{
				double literOfFuel = 0;
				double fuelCost = 0;
				double? numberOfHoursOfUsage = 0;

				numberOfHoursOfUsage = group.Count();
				literOfFuel = group.Sum(x => x.LitersOfFuel);

				// Trova il primo valore di FuelCost diverso da zero
				fuelCost = group.FirstOrDefault(x => x.FuelCost != 0)?.FuelCost ?? 0;

				var mezzo = group.First().Mezzo;
				var mezzoId = mezzo.Id;

				var newVehicleCard = new VehicleCard(literOfFuel, fuelCost, mezzoId, 0, numberOfHoursOfUsage);
				newVehicleCard.Mezzo = mezzo;
				result.Add(newVehicleCard);
			}
			return result.ToArray();
		}

		private async Task<ListOfGoodsAndServicesInUse[]> AggregaProvviste(List<ReportDiCantiere> reportList)
		{
			List<ListOfGoodsAndServicesInUse> result = new List<ListOfGoodsAndServicesInUse>();
			var idReports = reportList.Select(y => y.Id);
			var ListOfGoodsAndServicesInUse = _context.ListOfGoodsAndServicesInUse.Include(x => x.ServizioFornitore).Include(x => x.ServizioFornitore.Fornitore).Where(x => idReports.Contains(x.IdReport)).ToList();
			var ListOfGoodsAndServicesGroupByService = ListOfGoodsAndServicesInUse.GroupBy(x => x.ServizioId);
			List<ListOfGoodsAndServicesInUse> allListOfGoodsAndServicesInUse = _context.ListOfGoodsAndServicesInUse.ToList();

			foreach (var group in ListOfGoodsAndServicesGroupByService)
			{
				double quantity = 0;
				quantity = group.Sum(x => x.Quantity);

				var GoodAndService = group.First().ServizioFornitore;
				var Fornitore = group.First().ServizioFornitore.Fornitore;
				var GoodAndServiceID = GoodAndService.Id;
				var GoodAndServiceDescription = GoodAndService.Description;


				var newListOfGoodsAndServicesInUse = new ListOfGoodsAndServicesInUse(quantity, GoodAndServiceID, 0, GoodAndServiceDescription);
				newListOfGoodsAndServicesInUse.ServizioFornitore = GoodAndService;
				newListOfGoodsAndServicesInUse.ServizioFornitore.Fornitore = Fornitore;
				result.Add(newListOfGoodsAndServicesInUse);
			}

			return result.ToArray();

		}

		private async Task<ListOfServicesSoldToClient[]> AggregaLavoriEseguiti(List<ReportDiCantiere> reportList, bool reportSingolo)
		{
			List<ListOfServicesSoldToClient> result = new List<ListOfServicesSoldToClient>();
			var idReports = reportList.Select(y => y.Id);
			var ListOfServicesSoldToClient = _context.ListOfServicesSoldToClient.Include(x => x.servizioCliente).Where(x => idReports.Contains(x.IdReport)).ToList();

			#region Apllicazione sconto se presente su Prezzario
			// Carico i possibili sconti
			FrozenDictionary<int, double?> percentageDiscounts = _context.PrezziarioCliente
				.Where(x => x.DiscountPercentage != null && x.DiscountPercentage != 0)
				.Select(x => new { x.Id, x.DiscountPercentage })
				.ToFrozenDictionary(x => x.Id, y => y.DiscountPercentage);
			#endregion

			#region Report Singolo
			if (reportSingolo)
			{
				// REPORT SINGOLO, SE HO PIù SERVIZI UGUALI NON DEVO SOMMARLI
				foreach (var servizio in ListOfServicesSoldToClient)
				{
					// Applica lo sconto se necessario
					if (servizio.servizioCliente?.ApplyDiscount == true
						&& percentageDiscounts.TryGetValue(servizio.servizioCliente.IdPrezziario, out var percDiscount))
					{
						servizio.servizioCliente.PricePerUm = servizio.servizioCliente.PricePerUm - (servizio.servizioCliente.PricePerUm * percDiscount.Value / 100);
					}

					var s = new ListOfServicesSoldToClient(servizio.Quantity, servizio.Description, servizio.ServizioId, servizio.IdReport, servizio.EqualParts, servizio.Length, servizio.Width, servizio.Height)
					{
						servizioCliente = servizio.servizioCliente
					};
					result.Add(s);
				}
			}
			#endregion

			#region Report Aggregato
			else
			{
				var ListOfServicesSoldToClientGroupByService = ListOfServicesSoldToClient.GroupBy(x => x.ServizioId);

				foreach (var group in ListOfServicesSoldToClientGroupByService)
				{
					double quantity = group.Sum(x => x.Quantity);
					double equalParts = group.Sum(x => x.EqualParts);
					var Service = group.First().servizioCliente;
					var ServiceID = Service.ID;
					var Description = group.First().Description;
					var length = group.Sum(x => x.Length ?? 0);
					var width = group.Sum(x => x.Width ?? 0);
					var height = group.Sum(x => x.Height ?? 0);

					// Applica lo sconto se necessario
					if (Service.ApplyDiscount == true
						&& percentageDiscounts.TryGetValue(Service.IdPrezziario, out var percDiscount))
					{
						Service.PricePerUm = Service.PricePerUm - (Service.PricePerUm * percDiscount.Value / 100);
					}

					var newListOfServicesSoldToClient = new ListOfServicesSoldToClient(quantity, Description, ServiceID, 0, equalParts, length, width, height)
					{
						servizioCliente = Service
					};
					result.Add(newListOfServicesSoldToClient);
				}
			}
			#endregion

			return result.ToArray();

		}

		private async Task<AllegatiEQuestionarioReportModel[]> AggregaAllegatiEQuestionario(List<ReportDiCantiere> reportList)
		{
			var idReports = reportList.Select(y => y.Id).ToList();

			var allegatiEQuestionarioList = await _context.AllegatiEQuestionarioReportModel
														  .Where(q => idReports.Contains(q.IdReport))
														  .ToListAsync();

			return allegatiEQuestionarioList.ToArray();
		}


		private async Task<DocumentsList[]> AggregaImmagini(List<ReportDiCantiere> reportList)
		{
			var idReports = reportList.Select(y => y.Id).ToList();
			List<DocumentsList> result = new List<DocumentsList>();

			result = await _context.DocumentsList
								  .Include(f => f.FileDiCantiere)
								  .Where(t => idReports.Contains(t.IdReport))
								  .Include(f => f.FileDiCantiere.File)
								  .Where(f => f.FileDiCantiere.File.Type.Contains("image"))
								  .ToListAsync();

			return result.ToArray();
		}


		[HttpGet("{IdCantiere}/ReportDiCantiere/{idReport}")]
		[Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
		public async Task<ActionResult<ReportModel>> GetFullReportDiCantiere([FromRoute] int IdCantiere, [FromRoute] int idReport)
		{
			var report = await _context.ReportDiCantiere.SingleAsync(x => x.Id == idReport);
			var allegati = await _context.AllegatiEQuestionarioReportModel.SingleOrDefaultAsync(x => x.IdReport == idReport);

			var lavorieseguiti = await _context.ListOfServicesSoldToClient.Where(x => x.IdReport == idReport).Include(x => x.servizioCliente).ToListAsync();
			var serviziAcquistati = await _context.ListOfGoodsAndServicesInUse.Where(x => x.IdReport == idReport).Include(x => x.ServizioFornitore).Include(x => x.ServizioFornitore!.Fornitore).ToListAsync();

			var timecards = await _context.TimeCard.Where(x => x.IdReport == idReport)
													.Select(tc => new TimeCard(tc.Type, tc.NumberOfHours, tc.PersonaleId, tc.IdReport, tc.BeginningDate, tc.EndDate)
													{
														Id = tc.Id,
														AbsenceReason = tc.AbsenceReason,
														Personale = new Personale()
														{
															CF = tc.Personale.CF,
															ConsegnaDPI = tc.Personale.ConsegnaDPI,
															ConsegnaTesserino = tc.Personale.ConsegnaTesserino,
															email = tc.Personale.email,
															Employed = tc.Personale.Employed,
															extraordinaryPrice = tc.Personale.extraordinaryPrice,
															Id = tc.Personale.Id,
															inStrenght = tc.Personale.inStrenght,
															job = tc.Personale.job,
															level = tc.Personale.level,
															medicalIdoneity = tc.Personale.medicalIdoneity,
															Name = tc.Personale.Name,
															ordinaryPrice = tc.Personale.ordinaryPrice,
															OrganizationRole = tc.Personale.OrganizationRole,
															skills = tc.Personale.skills,
															Surname = tc.Personale.Surname,
															telephone = tc.Personale.telephone,
															Title = tc.Personale.Title,
															travelPrice = tc.Personale.travelPrice,
														}

													})
													.ToListAsync();

			var vehiclecards = await _context.VehicleCard.Where(x => x.IdReport == idReport).Include(x => x.Mezzo).ToListAsync();

			var reportView = new ReportModel();
			reportView.allegatiEQuestionario = allegati;
			reportView.Author = report.Author;
			reportView.lavoriEseguiti = new LavoriEseguitiReportModel(lavorieseguiti, _context);
			reportView.mezzi = new VehiclesReportModel(vehiclecards);
			reportView.personale = new PersonaleReportModel(timecards);
			reportView.provviste = new ProvvisteReportModel(serviziAcquistati);
			reportView.referenceDate = report.referenceDate;
			reportView.Signature = report.Sign;

			return reportView;
		}


		/// <summary>
		/// Allega dei file ad un determinato report di cantiere
		/// </summary>
		/// <param name="IdReport">Id del report di riferimento </param>
		/// <param name="idCantiere">Id del cantiere di appartenenza del report</param>
		/// <param name="formFiles">La lista di file da allegare al report</param>
		/// <param name="cantiereFileType">La tipologia di file di cantiere degli allegati (default="Report di Cantiere")</param>
		/// <param name="reportFileType">La tipologia di file di report di cantiere degli allegati(default = "File di report Generico"), usabile anche per indicare l'attività che descrive</param>
		/// <returns>Ritorna la lista di allegati allegati</returns>
		[HttpPost("{idCantiere}/ReportAttachments/{IdReport}/")]
		[Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
		public async Task<ActionResult<IEnumerable<DocumentsList>>> PostAttachmentsToReport([FromRoute] int IdReport, [FromRoute] int idCantiere, [FromForm] IFormFile[] formFiles, [FromQuery] string reportFileType = "File di report Generico", [FromQuery] string cantiereFileType = "Report di Cantiere")
		{

			List<_File> files = new List<_File>();

			foreach (FormFile formFile in formFiles)
			{
				_File file = await FileManager.SaveNewFile(formFile, _config);
				await _context.File.AddAsync(file);
				files.Add(file);
			}
			await _context.SaveChangesAsync();

			List<DocumentsList> attachments = new List<DocumentsList>();
			foreach (_File f in files)
			{
				DocumentsList atcn = new DocumentsList();
				ListaFileDiCantiere lsfc = new ListaFileDiCantiere();

				//Salvo il file come file di cantiere (ListaFileDiCantiere) cosicché
				//i file del report possano apparire anche nel cantiere e avere facilmente
				//una visione generale senza modificare il codice già esistente nella sezione
				//cantiere per la raccolta e la mostrazione dei file
				lsfc.IdFile = f.Id;
				lsfc.IdCantiere = idCantiere;
				lsfc.IdFile = f.Id;
				lsfc.type = cantiereFileType;
				await _context.ListaFileDiCantiere.AddAsync(lsfc);
				await _context.SaveChangesAsync();

				//Ora collego la "lista file di cantiere", ovvero il file di cantiere,
				//ad una tabella pivot che lo colleghi anche al report di cantiere.
				atcn.IdReport = IdReport;
				atcn.IdFileDiCantiere = lsfc.Id;
				atcn.type = reportFileType;

				await _context.DocumentsList.AddAsync(atcn);
				attachments.Add(atcn);
			}
			await _context.SaveChangesAsync();

			return attachments;
		}

		[HttpPost("{idCantiere}/ReportAttachments/{IdReport}/Delete")]
		[Authorize(Roles = UserPolicy.ReportDiCantiere_U)]
		public async Task<ActionResult<IEnumerable<int>>> DeleteAttachmentsFromReport([FromRoute] int IdReport, [FromRoute] int idCantiere, [FromBody] int[] filesToDelete)
		{

			List<DocumentsList> attachments = await _context.DocumentsList
													.Include(x => x.FileDiCantiere)
													.Include(x => x.FileDiCantiere!.File)
													.Where(x => filesToDelete.Contains(x.FileDiCantiere!.IdFile))
													.ToListAsync();

			foreach (DocumentsList attachment in attachments)
			{
				if (attachment != null && attachment.FileDiCantiere != null)
				{
					FileManager.DeleteFile(attachment.FileDiCantiere.File, _config);

					_context.ListaFileDiCantiere.Remove(attachment.FileDiCantiere);
					_context.DocumentsList.Remove(attachment);
					await _context.SaveChangesAsync();
				}
			}

			return filesToDelete;
		}

		/// <summary>
		/// Ottiene tutti i file allegati ad un determinato report di cantiere
		/// </summary>
		/// <param name="IdReport">L'id del report di riferimento</param>
		/// <param name="idCantiere">L'id del cantiere di appartenenza del report</param>
		/// <param name="fileType">La tipologia di file di cantiere (opzionale) per cui filtrare</param>
		/// <param name="reportType">La tipologia di file di report (opzionale) per cui filtrare</param>
		/// <returns>La lista di _File individuati</returns>
		[HttpGet("{idCantiere}/ReportAttachments/{IdReport}/")]
		[Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
		public async Task<ActionResult<IEnumerable<_File>>> GetReportAttachments([FromRoute] int IdReport, [FromRoute] int idCantiere, [FromQuery] string? fileType, [FromQuery] string? reportType)
		{
			//Prima di tutto trovo tutti i collegamenti al report di tipo DocumentList
			var reportFiles = _context.DocumentsList.Where(x => x.IdReport == IdReport);
			if (reportType != null)
				reportFiles = reportFiles.Where(x => x.type == reportType);
			//In secondo luogo risalgo ai file di cantiere originali (la tabella pivot ListaFileDiCantiere)
			var filesDiCantiere = reportFiles//.Include(x => x.FileDiCantiere)
											 //.Select(x => x.FileDiCantiere)
											 .Where(x => x.FileDiCantiere!.IdCantiere == idCantiere);
			if (fileType != null)
				filesDiCantiere = filesDiCantiere.Where(x => x.FileDiCantiere!.type == fileType);

			//Ed ora otteniamo l'effettiva lista di file
			return await filesDiCantiere.Include(x => x.FileDiCantiere!.File)
										.Select(x => x.FileDiCantiere!.File)
										.ToListAsync();


		}

		/// <summary>
		/// Individua il report di appartenenza di un determinato file.
		/// Questa funzione è utile nel momento in cui si visualizza un file di cantiere e ne si vuole
		/// valutare l'eventuale appartenenza ad un report ed in caso a quale report!
		/// </summary>
		/// <param name="IdFile">L'id del file da identificare</param>
		/// <param name="idCantiere">L'ide del cantiere di cui deve essere d'appartenenza</param>
		/// <returns>Ritorna le informazioni di base del report di cantiere o NotFOund() se non appartiene ad un report di cantiere o se il controllo incrociato IfFile+IdCantiere da conflitto</returns>
		[HttpGet("{idCantiere}/FileReportMembership/{IdFile}/")]
		[Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
		public async Task<ActionResult<Object>> FileReportMembership([FromRoute] int IdFile, [FromRoute] int idCantiere)
		{
			try
			{
				var reportMembership = await _context.DocumentsList.Include(x => x.FileDiCantiere!)
													  .SingleAsync(x => x.FileDiCantiere!.IdFile == IdFile && x.FileDiCantiere.IdCantiere == idCantiere);
				var report = await _context.ReportDiCantiere.FindAsync(reportMembership.IdReport);
				return new { report.Id, report.IdCantiere, report.date, report.Author };
			}
			catch (System.InvalidOperationException) //Se non fosse proprio un file di report
			{
				return NotFound();
			}

		}

		/// <summary>
		/// Elimina un report e i relativi record:
		///  - TimeCards
		///  - VehicleTimeCards
		///  - Liste di beni comprati/forniti
		///  - Documenti vari allegati
		///  - Record principali di report di cantiere
		/// </summary>
		/// <param name="idCantiere">L'id del cantiere di appartenenza del report (controllo logico)</param>
		/// <param name="idReport">L'id del report da eliminare</param>
		/// <returns>NoContent() se eliminato tutto correttamente, NotFound() altrimenti</returns>
		[HttpPost("{idCantiere}/DeleteReportDiCantiere/{idReport}")]
		[Authorize(Roles = UserPolicy.ReportDiCantiere_D)]
		public async Task<IActionResult> DeleteReportDiCantiere([FromRoute] int idCantiere, [FromRoute] int idReport)
		{
			var reportDiCantiere = await _context.ReportDiCantiere.FindAsync(idReport);
			if (reportDiCantiere == null)
				return NotFound();
			if (reportDiCantiere.IdCantiere != idCantiere)
				return NotFound();

			/*
            L'inizio della seguente sezione si occuperà dell'eliminazione di tutti gli attachments del report.
            Tecnicamente, eliminando solamente i file dovrebbe eliminare on cascade le "ListaFileDiCantiere",
            le quali eliminerebbero on cascade le DocumentList.
            Essendo però che preferirei essere quanto più scrupoloso, seguirò questo processo a mano facendo
            il delete on cascade io stesso.
            */
			var ReportAttachmentsQuery = _context.DocumentsList.Where(x => x.IdReport == idReport);

			var files = await ReportAttachmentsQuery.Include(x => x.FileDiCantiere!.File)
													   .Select(x => x.FileDiCantiere!.File)
													   .ToArrayAsync();
			var CantiereDocuments = await ReportAttachmentsQuery.Include(x => x.FileDiCantiere)
													   .Select(x => x.FileDiCantiere)
													   .ToArrayAsync();
			var reportFiles = await ReportAttachmentsQuery.ToArrayAsync();

			var timeCardsToDelete = await _context.TimeCard.Where(x => x.IdReport == idReport).ToArrayAsync();
			var vehicleCardsToDelete = await _context.VehicleCard.Where(x => x.IdReport == idReport).ToArrayAsync();
			var listsOfServicesSoldToCLientToDelete = await _context.ListOfServicesSoldToClient.Where(x => x.IdReport == idReport).ToArrayAsync();
			var listsOfGoodsAndServicesInUseToDelete = await _context.ListOfGoodsAndServicesInUse.Where(x => x.IdReport == idReport).ToArrayAsync();

			//Elimino i file fisici
			foreach (_File f in files)
				FileManager.DeleteFile(f, _config);
			//Elimino i vari record dalle tabella
			_context.DocumentsList.RemoveRange(reportFiles);
			_context.ListaFileDiCantiere.RemoveRange(CantiereDocuments);
			_context.File.RemoveRange(files);
			_context.TimeCard.RemoveRange(timeCardsToDelete);
			_context.VehicleCard.RemoveRange(vehicleCardsToDelete);
			_context.ListOfServicesSoldToClient.RemoveRange(listsOfServicesSoldToCLientToDelete);
			_context.ListOfGoodsAndServicesInUse.RemoveRange(listsOfGoodsAndServicesInUseToDelete);
			_context.ReportDiCantiere.Remove(reportDiCantiere);

			await _context.SaveChangesAsync();

			await UpdateProgressiviReportDiCantiere(idCantiere);

			return NoContent();
		}

		[HttpGet("{idCantiere}/Report/LatestFuelPrice")]
		[Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
		public async Task<ActionResult<Double>> GetGasolio([FromRoute] int idCantiere)
		{
			var vehicle_cards_query = _context.VehicleCard.Where(x => x.ReportDiCantiere!.IdCantiere == idCantiere)
															.Select(x => new
															{
																x.Id,
																x.FuelCost,
																x.BeginningDate,
															});

			var Ordered_vehicle_cards_query = vehicle_cards_query.OrderByDescending(v => v.BeginningDate);

			var gasoline_prices = Ordered_vehicle_cards_query.Select(v => v.FuelCost!)
															 .Where(f_cost => f_cost != 0.0);
			try
			{
				return await gasoline_prices.FirstOrDefaultAsync();
			}
			catch (System.InvalidOperationException)
			{
				return NotFound();
			}
		}

		//[HttpGet("{idCantiere}/Report/{idReport}")]
		//[Authorize(Roles = UserPolicy.ReportDiCantiere_R)]
		//public async Task<ActionResult<ReportDiCantiereViewModel>> GetReport([FromRoute] int idCantiere, [FromRoute] int idReport)
		//{
		//    var report = await _context.ReportDiCantiere.FindAsync(idReport);
		//    if(report.IdCantiere != idCantiere)
		//        return BadRequest();
		//    ReportDiCantiereViewModel rpg = new ReportDiCantiereViewModel();

		//    rpg.Cantiere = await _context.Cantiere.Include(c => c.Contratto).Include(c => c.Contratto.Cliente).SingleAsync(x => x.Id == idCantiere);
		//    rpg.Id = report.Id;
		//    rpg.LavoriEseguiti = await _context.ListOfServicesSoldToClient.Where(s => s.IdReport == idReport).Include(ss => ss.servizioCliente).ToArrayAsync();
		//    rpg.Provviste = await _context.ListOfGoodsAndServicesInUse.Where(s => s.IdReport == idReport).Include(ss => ss.ServizioFornitore).Include(sss => sss.ServizioFornitore.Fornitore).ToArrayAsync();
		//    rpg.Ore = await _context.TimeCard.Where(t => t.IdReport == idReport).Include(p => p.Personale).GroupBy(p => p.Personale).ToArrayAsync();
		//    rpg.Sign = report.Sign;
		//    rpg.VehiclesStuff = await _context.VehicleCard.Where(vc => vc.IdReport == idReport).ToArrayAsync();
		//    rpg.date = report.referenceDate;

		//    return rpg;
		//}

		// ////////////////////////// BUDGET CONTROLLER ////////////////////////////////
		[HttpGet("{idCantiere}/Budget")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<IEnumerable<BudgetModel>>> GetBudget([FromRoute] int idCantiere)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == idCantiere);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, idCantiere))
				return NotFound();

			return await _context.Budget.Where(b => b.IdCantiere == idCantiere).ToListAsync();
		}
		[HttpGet("{idCantiere}/Budget/{id}")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<BudgetModel>> GetBudget([FromRoute] int idCantiere, [FromRoute] int id)
		{
			var budget = await _context.Budget.SingleAsync(x => x.Id == id);

			if (budget == null)
			{
				return NotFound();
			}
			if (idCantiere != budget.IdCantiere)
				return BadRequest();
			return budget;
		}

		// PUT: api/Budget/5
		// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
		[HttpPost("{idCantiere}/Budget/update")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<IActionResult> PutBudget([FromRoute] int idCantiere, BudgetModel budget)
		{
			if (idCantiere != budget.IdCantiere)
			{
				return BadRequest();
			}

			_context.Entry(budget).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!BudgetExists(budget.Id))
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

		// POST: api/Budget
		// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
		[HttpPost("{idCantiere}/Budget")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<ActionResult<BudgetModel>> PostBudget([FromRoute] int idCantiere, BudgetModel budget)
		{
			if (idCantiere != budget.IdCantiere)
			{
				return BadRequest();
			}
			_context.Budget.Add(budget);
			await _context.SaveChangesAsync();

			return CreatedAtAction("GetBudget", new { id = budget.Id }, budget);
		}

		// DELETE: api/Budget/5
		[HttpPost("{idCantiere}/Budget/delete/{idBudget}")]
		[Authorize(Roles = UserPolicy.Cantieri_U)]
		public async Task<IActionResult> DeleteBudget(int idCantiere, [FromRoute] int idBudget)
		{
			var budget = await _context.Budget.FindAsync(idBudget);

			if (idCantiere != budget.IdCantiere)
				return BadRequest();

			if (budget == null)
			{
				return NotFound();
			}

			_context.Budget.Remove(budget);
			await _context.SaveChangesAsync();

			return NoContent();
		}

		private bool BudgetExists(int id)
		{
			return _context.Budget.Any(e => e.Id == id);
		}


		//////////////////////////// VARIE ED EVENTUALI ////////////////////////////////

		private bool check_sal_date(Saltura[] l, ListOfServicesSoldToClient s)
		{
			foreach (Saltura sal in l)
			{
				if (s.ReportDiCantiere!.date >= sal.startingReferralPeriodDate)
					if (s.ReportDiCantiere.date <= sal.endingReferralPeriodDate)
						return true;
			}
			return false;
		}

		[HttpGet("{idCantiere}/AvanzamentoProduzione")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<Double>> TimeAdvancement([FromRoute] int idCantiere, [FromQuery] DateTime? beginDate, [FromQuery] DateTime? endDate, [FromQuery] bool EvaluateSals = false)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == idCantiere);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, idCantiere))
				return NotFound();

			var initial_query = _context.ListOfServicesSoldToClient.Include(x => x.ReportDiCantiere).Where(x => x.ReportDiCantiere!.IdCantiere == idCantiere);
			if (beginDate != null)
			{
				var bd = ((DateTime)beginDate).Date;
				initial_query = initial_query.Where(x => x.ReportDiCantiere!.date.Date >= bd);
			}
			if (endDate != null)
			{
				var ed = ((DateTime)endDate).Date;
				initial_query = initial_query.Where(x => x.ReportDiCantiere!.date.Date <= ed);
			}

			var soldServicesValue = await initial_query.SumAsync(x => x.servizioCliente!.PricePerUm * x.Quantity);

			var sal_value = 0.0;
			if (EvaluateSals == true)
			{
				var sals_query = _context.Saltura.Where(x => x.IdCantiere == idCantiere);

				if (beginDate != null && endDate != null)
				{
					var bd = ((DateTime)beginDate).Date;
					var ed = ((DateTime)endDate).Date;
					sals_query.Where(s => s.startingReferralPeriodDate == null || ((DateTime)s.startingReferralPeriodDate).Date >= bd
											&& s.endingReferralPeriodDate == null || ((DateTime)s.endingReferralPeriodDate!).Date <= ed);
				}
				if (beginDate != null)
				{
					var bd = ((DateTime)beginDate).Date;
					sals_query.Where(s => s.startingReferralPeriodDate == null
										|| ((DateTime)s.startingReferralPeriodDate).Date >= bd);
				}
				if (endDate != null)
				{
					var ed = ((DateTime)endDate).Date;
					sals_query.Where(s => s.endingReferralPeriodDate == null
									|| ((DateTime)s.endingReferralPeriodDate).Date <= ed);
				}

				var sals = await sals_query.ToArrayAsync();
				var services_to_substract = await initial_query!.Include(r => r.ReportDiCantiere).Include(x => x.servizioCliente).ToArrayAsync();//.Where(x => check_sal_date(sals,x) == true);

				foreach (ListOfServicesSoldToClient s in services_to_substract)
				{
					if (check_sal_date(sals, s))
						sal_value += s.Quantity * s.servizioCliente!.PricePerUm;
				}
				//sal_value = await services_to_substract.SumAsync(x => x.servizioCliente.PricePerUm * x.Quantity);
			}

			return soldServicesValue - sal_value;
		}

		[HttpGet("{idCantiere}/Spese")]
		[Authorize(Roles = UserPolicy.Cantieri_R)]
		public async Task<ActionResult<Double>> GetCosts([FromRoute] int idCantiere, [FromQuery] DateTime? beginDate, [FromQuery] DateTime? endDate)
		{
			var cantiere = await _context.Cantiere.SingleAsync(x => x.Id == idCantiere);

			if (cantiere == null)
			{
				return NotFound();
			}

			if (!await foremanGuard(HttpContext, idCantiere))
				return NotFound();

			var employee_costs = _context.TimeCard.Where(t => t.ReportDiCantiere!.IdCantiere == idCantiere);
			var vehicle_costs = _context.VehicleCard.Where(v => v.ReportDiCantiere!.IdCantiere == idCantiere);
			var list_products_in_use = _context.ListOfGoodsAndServicesInUse.Where(l => l.ReportDiCantiere!.IdCantiere == idCantiere);

			if (beginDate != null)
			{
				employee_costs = employee_costs.Where(x => x.ReportDiCantiere!.date >= beginDate);
				vehicle_costs = vehicle_costs.Where(x => x.ReportDiCantiere!.date >= beginDate);
				list_products_in_use = list_products_in_use.Where(x => x.ReportDiCantiere!.date >= beginDate);
			}
			if (endDate != null)
			{
				employee_costs = employee_costs.Where(x => x.ReportDiCantiere!.date <= endDate);
				vehicle_costs = vehicle_costs.Where(x => x.ReportDiCantiere!.date <= endDate);
				list_products_in_use = list_products_in_use.Where(x => x.ReportDiCantiere!.date <= endDate);
			}

			var employee_ordinary_cost = await employee_costs.Where(t => t.Type == TimeCardsTypes.Ordinary).SumAsync(t => t.Personale!.ordinaryPrice * t.NumberOfHours);
			var employee_extraordinary_cost = await employee_costs.Where(t => t.Type == TimeCardsTypes.ExtraOrdinary).SumAsync(t => t.Personale!.extraordinaryPrice * t.NumberOfHours);
			var employee_travel_cost = await employee_costs.Where(t => t.Type == TimeCardsTypes.Travel).SumAsync(t => t.Personale!.travelPrice * t.NumberOfHours);

			var vehicle_fuel_cost = await vehicle_costs.SumAsync(v => v.LitersOfFuel * v.FuelCost);
			var vehicle_daily_total_cost = await vehicle_costs.SumAsync(v => v.Mezzo!.DailyCost);

			var products_in_use_total_cost = await list_products_in_use.SumAsync(l => l.ServizioFornitore!.PricePerUM * l.Quantity);

			return employee_ordinary_cost + employee_extraordinary_cost + employee_travel_cost + vehicle_fuel_cost + vehicle_daily_total_cost + products_in_use_total_cost;
		}
		/// <summary>
		/// Aggiorna i valori aggiuntivi di un cantiere, senza salvare
		/// </summary>
		/// <param name="idCantiere"></param>
		/// <param name="valoriAggiuntivi"></param>
		/// <returns></returns>
		private async Task UpdateValoriAggiuntiviContrattoAsyncNoSave(int idCantiere, ImmutableArray<ValoriAggiuntivi> valoriAggiuntivi)
		{
			foreach (var valAgg in valoriAggiuntivi)
			{
				valAgg.Id = 0;
				valAgg.IdCantiere = idCantiere;
				valAgg.Contratto = null;
				valAgg.Cantiere = null;
			}

			var existingValAggiuntiviCantiere = _context.ValoriAggiuntiviCantiereContratto.Where(x => x.IdCantiere == idCantiere);
			_context.ValoriAggiuntiviCantiereContratto.RemoveRange(existingValAggiuntiviCantiere);
			await _context.AddRangeAsync(valoriAggiuntivi);
		}
	}

}