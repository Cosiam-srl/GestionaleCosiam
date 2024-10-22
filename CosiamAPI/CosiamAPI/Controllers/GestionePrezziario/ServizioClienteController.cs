using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CosiamAPI.Data;
using CosiamAPI.Models;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using JWTAuthentication.Authentication;

namespace CosiamAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServizioClienteController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ServizioClienteController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ServizioCliente
        /// <summary>
        /// Ritorna tutti i servizi di un determinato prezziario cliente
        /// </summary>
        /// <param name="IdPrezziarioCliente"></param>
        /// <returns></returns>
        [HttpGet("{IdPrezziarioCliente}")]
        [Authorize(Roles = UserPolicy.Clienti_R)]
        public async Task<ActionResult<IEnumerable<ServizioCliente>>> GetServizioCliente([FromRoute] int IdPrezziarioCliente)
        {
            var servizi = await _context.ServizioCliente.Where(s => s.IdPrezziario == IdPrezziarioCliente).ToListAsync();
            if (servizi == null)
                return new List<ServizioCliente>();
            return servizi;
        }

#nullable enable
        [Obsolete]
        [HttpGet("{IdPrezziarioCliente}/cercaPrezzi")]
        [Authorize(Roles = UserPolicy.Clienti_R)]
        //NON PIU UTILIZZATO
        public async Task<ActionResult<IEnumerable<object>>> GetServizioClienteAvanzato([FromRoute] int IdPrezziarioCliente, [FromQuery] string? searchString, [FromQuery] bool isRateCode = false, [FromQuery] int top = 1000)
        {
#nullable disable
            if (searchString == null)
                return _context.ServizioCliente
                                        .Where(s => s.IdPrezziario == IdPrezziarioCliente)
                                        .AsParallel()
                                        .Select(s => new
                                        {
                                            ID = s.ID,
                                            description = string.Concat(string.Concat(s.rateCode, " - "), s.Description),
                                            PricePerUm = s.PricePerUm,
                                            UM = s.UM,
                                        })
                                        //.Where(s => s.description.Contains(searchString))
                                        .Take(top)
                                        .ToList();

            if (isRateCode == true)
                return await _context.ServizioCliente
                                .Where(x => x.IdPrezziario == IdPrezziarioCliente)
                                .Where(x => x.rateCode.Contains(searchString))
                                .Select(s => new
                                {
                                    ID = s.ID,
                                    description = string.Concat(string.Concat(s.rateCode, " - "), s.Description),
                                    PricePerUm = s.PricePerUm,
                                    UM = s.UM,
                                })
                                //.Where(s => s.description.Contains(searchString))
                                .Take(top)
                                .ToListAsync();

            var tokenizedSearchString = tokenizer(searchString);

            var query = _context.WordsCounter.Where(x => x.IdPrezziarioCliente == IdPrezziarioCliente);

            var m1query = query.Where(x => tokenizedSearchString.Contains(x.word)).Include(x => x.servizioCliente);

            // Notare che seleziono SOLAMENTE i WordsCounter che che sono una parola della
            // query cercata, e questa parola è una per ciascun servizio
            // Tecnicamente, i servizi hanno solamente 1 WordsCounter per parola
            // => se la query è di n parole, il servizio apparirà in n wordscounter!
            // => Tengo solamente i servizi che appaiono n volte 

            var m2Query = from wc in m1query
                          where m1query.Where(temp => temp.idServizioCliente.Equals(wc.idServizioCliente))
                                        .Select(temp => temp)
                                        .Count() == tokenizedSearchString.Count()
                          select new
                          {
                              ID = wc.servizioCliente.ID,
                              description = string.Concat(string.Concat(wc.servizioCliente.rateCode, " - "), wc.servizioCliente.Description), //, 
                              PricePerUm = wc.servizioCliente.PricePerUm,
                              UM = wc.servizioCliente.UM,
                          };

            var returnValue = await m2Query.GroupBy(x => x)
                                          .Select(x => x.Key)
                                          .Take(top)
                                          .ToListAsync();
            return returnValue;
        }

        /// <summary>
        /// Utilizzo di un fulltextindex per ottimizzare la ricerca
        /// </summary>
        /// <param name="idPrezzariCliente"></param>
        /// <param name="IdPrezziarioCliente"></param>
        /// <param name="searchString"></param>
        /// <param name="isRateCode"></param>
        /// <param name="top"></param>
        /// <returns></returns>
        [HttpPost("cercaPrezziV2")]
        [Authorize(Roles = UserPolicy.Clienti_R)]
        public async Task<ActionResult<IEnumerable<object>>> GetServizioClienteAvanzatoV2(int[] idPrezzariCliente, [FromQuery] string? searchString, [FromQuery] bool isRateCode = false, [FromQuery] int top = 100)
        {
            var discountDictionary = await _context.PrezziarioCliente.Where(x => idPrezzariCliente.Contains(x.Id) && x.DiscountPercentage != null).Select(x => new { x.Id, x.DiscountPercentage }).ToDictionaryAsync(x => x.Id, x => x.DiscountPercentage);

            if (searchString == null)
                // ritorno i primi TOP elementi del prezzario in questione
                return _context.ServizioCliente
                                        .Where(s => idPrezzariCliente.Contains(s.IdPrezziario))
                                        .AsParallel()
                                        .Select(s => new
                                        {
                                            ID = s.ID,
                                            description = string.Concat(string.Concat(s.rateCode, " - "), s.Description),
                                            PricePerUm = s.ApplyDiscount is true && discountDictionary.ContainsKey(s.IdPrezziario) ? s.PricePerUm - (s.PricePerUm * discountDictionary[s.IdPrezziario] / 100) : s.PricePerUm,
                                            UM = s.UM,
                                            ApplyDiscount = s.ApplyDiscount

                                        })
                                        //.Where(s => s.description.Contains(searchString))
                                        .Take(top)
                                        .ToList();

            //se spuntato il rateCode, cerco solo quello specifico rateCode
            if (isRateCode == true)
                return await _context.ServizioCliente
                                .Where(x => idPrezzariCliente.Contains(x.IdPrezziario))
                                .Where(x => x.rateCode.Contains(searchString))
                                .Select(s => new
                                {
                                    ID = s.ID,
                                    description = string.Concat(string.Concat(s.rateCode, " - "), s.Description),
                                    PricePerUm = s.ApplyDiscount && discountDictionary.ContainsKey(s.IdPrezziario) ? s.PricePerUm - (s.PricePerUm * discountDictionary[s.IdPrezziario] / 100) : s.PricePerUm,
                                    UM = s.UM,
                                    ApplyDiscount = s.ApplyDiscount
                                })
                                //.Where(s => s.description.Contains(searchString))
                                .Take(top)
                                .ToListAsync();

            //altrimenti 
            var searchStringWithWildCard = $"\"{searchString}*\"";
            var x = await _context.ServizioCliente
                                          .Where(s => idPrezzariCliente.Contains(s.IdPrezziario) &&
                                          (EF.Functions.Contains(s.Description, searchStringWithWildCard)
                                            || EF.Functions.Contains(s.rateCode, searchStringWithWildCard))
                                          )
                                          .Select(s => new
                                          {
                                              ID = s.ID,
                                              description = string.Concat(string.Concat(s.rateCode, " - "), s.Description),
                                              PricePerUm = s.ApplyDiscount && discountDictionary.ContainsKey(s.IdPrezziario) ? s.PricePerUm - (s.PricePerUm * discountDictionary[s.IdPrezziario] / 100) : s.PricePerUm,
                                              UM = s.UM,
                                              ApplyDiscount = s.ApplyDiscount
                                          })
                                        .Take(top)
                                        .ToListAsync();
            return x;

        }




        // PUT: api/ServizioCliente/5
        //  protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost("Update/{id}")]
        [Authorize(Roles = UserPolicy.Clienti_U)]
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

        // POST: api/ServizioCliente
        //  protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = UserPolicy.Clienti_C)]
        public async Task<ActionResult<ServizioCliente>> PostServizioCliente(ServizioCliente servizioCliente)
        {
            _context.ServizioCliente.Add(servizioCliente);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetServizioCliente", new { id = servizioCliente.ID }, servizioCliente);
        }

        // DELETE: api/ServizioCliente/5
        [HttpPost("Delete")]
        [Authorize(Roles = UserPolicy.Clienti_D)]
        public async Task<IActionResult> DeleteServiziCliente(int[] ids)
        {
            var serviziDaRimuovere = await _context.ServizioCliente.Where(x => ids.Contains(x.ID)).ToArrayAsync();
            _context.ServizioCliente.RemoveRange(serviziDaRimuovere);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ServizioClienteExists(int id)
        {
            return _context.ServizioCliente.Any(e => e.ID == id);
        }


        private string[] italianStopWords = { "a", "abbastanza", "abbia", "abbiamo", "abbiano", "abbiate", "accidenti", "ad", "adesso", "affinché", "agl", "agli", "ahime", "ahimè", "ai", "al", "alcuna", "alcuni", "alcuno", "all", "alla", "alle", "allo", "allora", "altre", "altri", "altrimenti", "altro", "altrove", "altrui", "anche", "ancora", "anni", "anno", "ansa", "anticipo", "assai", "attesa", "attraverso", "avanti", "avemmo", "avendo", "avente", "aver", "avere", "averlo", "avesse", "avessero", "avessi", "avessimo", "aveste", "avesti", "avete", "aveva", "avevamo", "avevano", "avevate", "avevi", "avevo", "avrai", "avranno", "avrebbe", "avrebbero", "avrei", "avremmo", "avremo", "avreste", "avresti", "avrete", "avrà", "avrò", "avuta", "avute", "avuti", "avuto", "basta", "ben", "bene", "benissimo", "brava", "bravo", "buono", "c", "caso", "cento", "certa", "certe", "certi", "certo", "che", "chi", "chicchessia", "chiunque", "ci", "ciascuna", "ciascuno", "cima", "cinque", "cio", "cioe", "cioè", "circa", "citta", "città", "ciò", "co", "codesta", "codesti", "codesto", "cogli", "coi", "col", "colei", "coll", "coloro", "colui", "come", "cominci", "comprare", "comunque", "con", "concernente", "conclusione", "consecutivi", "consecutivo", "consiglio", "contro", "cortesia", "cos", "cosa", "cosi", "così", "cui", "d", "da", "dagl", "dagli", "dai", "dal", "dall", "dalla", "dalle", "dallo", "dappertutto", "davanti", "degl", "degli", "dei", "del", "dell", "della", "delle", "dello", "dentro", "detto", "deve", "devo", "di", "dice", "dietro", "dire", "dirimpetto", "diventa", "diventare", "diventato", "dopo", "doppio", "dov", "dove", "dovra", "dovrà", "dovunque", "due", "dunque", "durante", "e", "ebbe", "ebbero", "ebbi", "ecc", "ecco", "ed", "effettivamente", "egli", "ella", "entrambi", "eppure", "era", "erano", "eravamo", "eravate", "eri", "ero", "esempio", "esse", "essendo", "esser", "essere", "essi", "ex", "fa", "faccia", "facciamo", "facciano", "facciate", "faccio", "facemmo", "facendo", "facesse", "facessero", "facessi", "facessimo", "faceste", "facesti", "faceva", "facevamo", "facevano", "facevate", "facevi", "facevo", "fai", "fanno", "farai", "faranno", "fare", "farebbe", "farebbero", "farei", "faremmo", "faremo", "fareste", "faresti", "farete", "farà", "farò", "fatto", "favore", "fece", "fecero", "feci", "fin", "finalmente", "finche", "fine", "fino", "forse", "forza", "fosse", "fossero", "fossi", "fossimo", "foste", "fosti", "fra", "frattempo", "fu", "fui", "fummo", "fuori", "furono", "futuro", "generale", "gente", "gia", "giacche", "giorni", "giorno", "giu", "già", "gli", "gliela", "gliele", "glieli", "glielo", "gliene", "grande", "grazie", "gruppo", "ha", "haha", "hai", "hanno", "ho", "i", "ie", "ieri", "il", "improvviso", "in", "inc", "indietro", "infatti", "inoltre", "insieme", "intanto", "intorno", "invece", "io", "l", "la", "lasciato", "lato", "le", "lei", "li", "lo", "lontano", "loro", "lui", "lungo", "luogo", "là", "ma", "macche", "magari", "maggior", "mai", "male", "malgrado", "malissimo", "me", "medesimo", "mediante", "meglio", "meno", "mentre", "mesi", "mezzo", "mi", "mia", "mie", "miei", "mila", "miliardi", "milioni", "minimi", "mio", "modo", "molta", "molti", "moltissimo", "molto", "momento", "mondo", "ne", "negl", "negli", "nei", "nel", "nell", "nella", "nelle", "nello", "nemmeno", "neppure", "nessun", "nessuna", "nessuno", "niente", "no", "noi", "nome", "non", "nondimeno", "nonostante", "nonsia", "nostra", "nostre", "nostri", "nostro", "novanta", "nove", "nulla", "nuovi", "nuovo", "o", "od", "oggi", "ogni", "ognuna", "ognuno", "oltre", "oppure", "ora", "ore", "osi", "ossia", "ottanta", "otto", "paese", "parecchi", "parecchie", "parecchio", "parte", "partendo", "peccato", "peggio", "per", "perche", "perchè", "perché", "percio", "perciò", "perfino", "pero", "persino", "persone", "però", "piedi", "pieno", "piglia", "piu", "piuttosto", "più", "po", "pochissimo", "poco", "poi", "poiche", "possa", "possedere", "posteriore", "posto", "potrebbe", "preferibilmente", "presa", "press", "prima", "primo", "principalmente", "probabilmente", "promesso", "proprio", "puo", "pure", "purtroppo", "può", "qua", "qualche", "qualcosa", "qualcuna", "qualcuno", "quale", "quali", "qualunque", "quando", "quanta", "quante", "quanti", "quanto", "quantunque", "quarto", "quasi", "quattro", "quel", "quella", "quelle", "quelli", "quello", "quest", "questa", "queste", "questi", "questo", "qui", "quindi", "quinto", "realmente", "recente", "recentemente", "registrazione", "relativo", "riecco", "rispetto", "salvo", "sara", "sarai", "saranno", "sarebbe", "sarebbero", "sarei", "saremmo", "saremo", "sareste", "saresti", "sarete", "sarà", "sarò", "scola", "scopo", "scorso", "se", "secondo", "seguente", "seguito", "sei", "sembra", "sembrare", "sembrato", "sembrava", "sembri", "sempre", "senza", "sette", "si", "sia", "siamo", "siano", "siate", "siete", "sig", "solito", "solo", "soltanto", "sono", "sopra", "soprattutto", "sotto", "spesso", "sta", "stai", "stando", "stanno", "starai", "staranno", "starebbe", "starebbero", "starei", "staremmo", "staremo", "stareste", "staresti", "starete", "starà", "starò", "stata", "state", "stati", "stato", "stava", "stavamo", "stavano", "stavate", "stavi", "stavo", "stemmo", "stessa", "stesse", "stessero", "stessi", "stessimo", "stesso", "steste", "stesti", "stette", "stettero", "stetti", "stia", "stiamo", "stiano", "stiate", "sto", "su", "sua", "subito", "successivamente", "successivo", "sue", "sugl", "sugli", "sui", "sul", "sull", "sulla", "sulle", "sullo", "suo", "suoi", "tale", "tali", "talvolta", "tanto", "te", "tempo", "terzo", "th", "ti", "titolo", "tra", "tranne", "tre", "trenta", "triplo", "troppo", "trovato", "tu", "tua", "tue", "tuo", "tuoi", "tutta", "tuttavia", "tutte", "tutti", "tutto", "uguali", "ulteriore", "ultimo", "un", "una", "uno", "uomo", "va", "vai", "vale", "vari", "varia", "varie", "vario", "verso", "vi", "vicino", "visto", "vita", "voi", "volta", "volte", "vostra", "vostre", "vostri", "vostro", "è" };
        private char[] punteggiatura = { ';', ',', ':', '.', '-', '_', '@', '°', '#', '§', '[', ']', '*', '^', '?', '\'', '=', ')', '(', '/', '&', '%', '$', '\"', '!', '|', '€' };
        public static string RemoveChars(string input, char[] charsToRemove)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            var sb = new StringBuilder();

            foreach (var c in input)
            {
                if (!charsToRemove.Contains(c))
                    sb.Append(c);
                else
                    sb.Append(" ");
            }

            return sb.ToString();
        }

        private IEnumerable<string> tokenizer(string input)
        {
            string txt = RemoveChars(input, punteggiatura);
            string[] tokenized_txt = txt.ToLower().Split(' ');
            return tokenized_txt.Except(italianStopWords);
        }

        private IEnumerable<WordsCounter> serviziettoWordsCounterList(ServizioCliente servizietto)
        {
            var words_list = tokenizer(servizietto.Description);

            return words_list.Select(
                x => new
                {
                    word = x,
                    v = 1
                })
                .GroupBy(x => x.word)
                .Select(x =>
                    new WordsCounter()
                    {
                        IdPrezziarioCliente = servizietto.IdPrezziario,
                        idServizioCliente = servizietto.ID,
                        word = x.Key,
                        counter = x.Sum(t => t.v),
                    }
                ).ToList();
        }

        [HttpPost("import")]
        [Authorize(Roles = UserPolicy.Clienti_U)]
        public async Task<DemoResponse<List<ServizioCliente>>> Import(IFormFile formFile, System.Threading.CancellationToken cancellationToken, [FromQuery] int idPrezziario, [FromQuery] bool indexing = true)
        {

            if (!System.IO.Path.GetExtension(formFile.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
            {
                var actualExtension = System.IO.Path.GetExtension(formFile.FileName);
                var errorMessage = $"Not Support file extension: {actualExtension}";
                return DemoResponse<List<ServizioCliente>>.GetResult(-1, errorMessage);
            }


            var list = new System.Collections.Concurrent.ConcurrentBag<ServizioCliente>();

            using (var stream = new System.IO.MemoryStream())
            {
                await formFile.CopyToAsync(stream, cancellationToken);

                using (var package = new OfficeOpenXml.ExcelPackage(stream))
                {
                    OfficeOpenXml.ExcelWorksheet worksheet = package.Workbook.Worksheets[0];
                    var rowCount = worksheet.Dimension.Rows;

                    for (int row = 2; row <= rowCount; row++)
                    {
                        bool changed = false;

                        ServizioCliente sdm = new ServizioCliente();

                        try
                        {
                            sdm.rateCode = worksheet.Cells[row, 1].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.rateCode = "";
                        }
                        try
                        {
                            sdm.Description = worksheet.Cells[row, 2].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.Description = "";
                        }
                        try
                        {
                            sdm.UM = worksheet.Cells[row, 3].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.UM = "";
                        }
                        try
                        {
                            sdm.PricePerUm = Double.Parse(worksheet.Cells[row, 4].Value.ToString().Trim());
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.PricePerUm = 0.0;
                        }
                        try
                        {
                            sdm.Category = worksheet.Cells[row, 5].Value.ToString().Trim();
                            changed = true;
                        }
                        catch (System.NullReferenceException)
                        {
                            sdm.Category = "Generica";
                        }

                        sdm.IdPrezziario = idPrezziario;
                        if (changed == true)
                            list.Add(sdm);

                    }
                }
            }
            _context.ServizioCliente.AddRange(list);
            await _context.SaveChangesAsync();

            if (indexing == true)
            {
                foreach (var ss in list)
                {
                    var _words = serviziettoWordsCounterList(ss);
                    _context.WordsCounter.AddRange(_words);
                }
                _context.SaveChanges();
            }

            return DemoResponse<List<ServizioCliente>>.GetResult(201, "OK");
        }

        [HttpPost("MakeIndexes")]
        [Authorize(Roles = UserPolicy.Clienti_U)]
#nullable enable
        public async Task<DemoResponse<List<ServizioCliente>>> MakeIndexes([FromQuery] int? prezziario_id, [FromBody] IEnumerable<int>? ids_to_index)
        {
#nullable disable
            IEnumerable<int> already_indexed_stuff;
            IEnumerable<int> stuff;
            IEnumerable<int> stuff_to_index;

            if (ids_to_index != null && ids_to_index.Count() != 0)
                stuff_to_index = ids_to_index;
            else
            {
                if (prezziario_id != null)
                    already_indexed_stuff = await _context.WordsCounter
                                                                .Where(x => x.IdPrezziarioCliente == prezziario_id)
                                                                .GroupBy(x => x.idServizioCliente)
                                                                .Select(x => x.Key)
                                                                .ToArrayAsync();
                else
                    already_indexed_stuff = await _context.WordsCounter
                                                                .GroupBy(x => x.idServizioCliente)
                                                                .Select(x => x.Key)
                                                                .ToArrayAsync();

                if (prezziario_id != null)
                    stuff = await _context.ServizioCliente
                                                    .Where(x => x.IdPrezziario == prezziario_id)
                                                    .Select(x => x.ID)
                                                    .ToArrayAsync();
                else
                    stuff = await _context.ServizioCliente
                                                    .Select(x => x.ID)
                                                    .ToArrayAsync();

                stuff_to_index = stuff.Except(already_indexed_stuff);
            }

            var servizi_da_indexare = await _context.ServizioCliente.Where(x => stuff_to_index.Contains(x.ID)).ToArrayAsync();

            foreach (var ss in servizi_da_indexare)
            {
                var _words = serviziettoWordsCounterList(ss);
                _context.WordsCounter.AddRange(_words);
            }
            _context.SaveChanges();


            return DemoResponse<List<ServizioCliente>>.GetResult(201, "OK");
        }
    }
}
