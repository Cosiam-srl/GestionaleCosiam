﻿using CosiamAPI.Data;
using CosiamAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

internal interface IScheduledService
{
    Task DoWork(CancellationToken stoppingToken);
}

internal class ScheduledService : IScheduledService
{
    private int executionCount = 0;
    private readonly ILogger _logger;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    // private Timer _timer = null!;

    public ScheduledService(ILogger<ScheduledService> logger,  ApplicationDbContext context, UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task DoWork(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            executionCount++;

            _logger.LogInformation(
                "Scheduled service is working, Execution number: {Count}", executionCount);

            #region Tasks

            await MakeIndexesAsync();

            #endregion

            // Every minute
            await Task.Delay(60000, stoppingToken);
        }
    }

    /// <summary>
    /// Funzione di lavoro
    /// </summary>
    /// <returns></returns>
    private async Task MakeIndexesAsync()
    {
        IEnumerable<int> already_indexed_stuff;
        IEnumerable<int> stuff;
        IEnumerable<int> stuff_to_index;

        already_indexed_stuff = await _context.WordsCounter
            .GroupBy(x => x.idServizioCliente)
            .Select(x => x.Key)
            .ToArrayAsync();

        stuff = await _context.ServizioCliente
            .Select(x => x.ID)
            .ToArrayAsync();

        stuff_to_index = stuff.Except(already_indexed_stuff);

        var servizi_da_indexare = await _context.ServizioCliente
            .Where(x => stuff_to_index.Contains(x.ID))
            .ToArrayAsync();

        foreach (var ss in servizi_da_indexare)
        {
            var _words = serviziettoWordsCounterList(ss);
            _context.WordsCounter.AddRange(_words);
        }
        _context.SaveChanges();
        _logger.LogInformation("Indici ricostruisti");
    }
    private IEnumerable<WordsCounter> serviziettoWordsCounterList(ServizioCliente servizietto)
    {
        var words_list = tokenizer(servizietto.Description);

        return words_list.Select(
            x => new {
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
}