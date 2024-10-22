using CosiamAPI.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ValueGeneration.Internal;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

//#nullable enable

namespace CosiamAPI.Models
{
    public class Cantiere
    {
        public int Id { get; set; }
        public string ShortDescription { get; set; }
        [MaxLength(50)]
        public string State { get; set; }
        [MaxLength(255)]
        public string Address { get; set; }
        public DateTime Start { get; set; }
        public DateTime EstimatedEnding { get; set; }
        [MaxLength(5000)]
        public string Description { get; set; }
        public string SOA { get; set; }
        [Required]
        public string orderCode { get; set; }
        public double workBudget { get; set; }
        public double chargesBudget { get; set; }
        public double orderAmount { get; set; }
        public double additionalActsBudget { get; set; }
        public double percentualeSpeseGenerali { get; set; }
        public double finalAmount { get; set; }
        public int cap { get; set; }

        //public int IdClienti { get; set; }
        //[ForeignKey("IdClienti")]
        //public Clienti Clienti { get; set; }

        public int? IdLogo { get; set; }
        [ForeignKey("IdLogo")]
        public _File File { get; set; }
        public int IdContratto { get; set; }
        [ForeignKey("IdContratto")]
        public Contratto Contratto { get; set; }
        public string rup { get; set; }
        public string dl { get; set; }
        public string cse { get; set; }
        public double CostiIniziali { get; set; } = 0;
        public double RicaviIniziali { get; set; } = 0;
        public ICollection<ValoriAggiuntivi> ValoriAggiuntivi { get; set; }
        public double TotalGrossWorkAmount { get; set; } = 0;
        public double TotalChargesAmount { get; set; } = 0;
    }

    public class ListaPersonaleAssegnatoDiCantiere
    {
        public int Id { get; set; }
        public int IdPersonale { get; set; }
        [ForeignKey("IdPersonale")]
        public Personale Personale { get; set; }
        public int IdCantiere { get; set; }
        [ForeignKey("IdCantiere")]
        public Cantiere Cantiere { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class ListaProjectManagerCantiere
    {
        public int Id { get; set; }
        public int IdPersonale { get; set; }
        [ForeignKey("IdPersonale")]
        public Personale Personale { get; set; }
        public int IdCantiere { get; set; }
        [ForeignKey("IdCantiere")]
        public Cantiere Cantiere { get; set; }
    }
    public class ListaCapiCantiere
    {
        public int Id { get; set; }
        public int IdPersonale { get; set; }
        [ForeignKey("IdPersonale")]
        public Personale Personale { get; set; }
        public int IdCantiere { get; set; }
        [ForeignKey("IdCantiere")]
        public Cantiere Cantiere { get; set; }
    }

    public class ListaNoteDiCantiere
    {
        public int Id { get; set; }
        public int IdNote { get; set; }
        [ForeignKey("IdNote")]
        public Note Note { get; set; }
        public int IdCantiere { get; set; }
        [ForeignKey("IdCantiere")]
        public Cantiere Cantiere { get; set; }
    }

    /// <summary>
    /// Si tratta di una view per rendere più facile a danilozzo la gestione delle note di cantierozzo
    /// </summary>
    // La microsoft dice che le struct sono più efficienti quindi soccmel uso la struct
    // Vedi: https://docs.microsoft.com/en-us/dotnet/standard/design-guidelines/choosing-between-class-and-struct
    public struct NoteDiCantiereView
    {
        public Note Nota { get; set; }
        public IEnumerable<Personale> personaleTagged { get; set; }
        public IEnumerable<_File> listFile { get; set; }

        public NoteDiCantiereView(Note nota, ApplicationDbContext _context)
        {
            this.Nota = nota;
            this.personaleTagged = _context.PersonaleResponsabileDiNota.Where(pr => pr.IdNote == nota.Id).Include(p => p.Personale).Select(p => p.Personale).ToList();
            this.listFile = _context.AttachmentsNota.Where(a => a.IdNota == nota.Id).Include(f => f.File).Select(f => f.File).ToList();
        }
    }


    public class ListaFileDiCantiere
    {
        public int Id { get; set; }
        public int IdFile { get; set; }
        [ForeignKey("IdFile")]
        public _File File { get; set; }
        public int IdCantiere { get; set; }
        [ForeignKey("IdCantiere")]
        public Cantiere Cantiere { get; set; }
        public string type { get; set; }
    }

    public class ListaMezziDiCantiere
    {
        public int Id { get; set; }
        public int IdMezzi { get; set; }
        [ForeignKey("IdMezzi")]
        public Mezzi Mezzo { get; set; }
        public int IdCantiere { get; set; }
        [ForeignKey("IdCantiere")]
        public Cantiere Cantiere { get; set; }
        public DateTime fromDate { get; set; }
        public DateTime toDate { get; set; }
    }

    public class ListaFornitoriCantiere
    {
        public int Id { get; set; }
        public int IdFornitore { get; set; }
        [ForeignKey("IdFornitore")]
        public Fornitori Fornitore { get; set; }
        public int IdCantiere { get; set; }
        [ForeignKey("IdCantiere")]
        public Cantiere Cantiere { get; set; }
    }

    public class FinancialCard
    {
        public int Id { get; set; }
        public int creditiVsClienti { get; set; } = 0;
        public string daContabilizzare { get; set; } = "0";
        public string daFatturare { get; set; } = "0";
        public string daIncassare { get; set; } = "0";
        public string debitiABreve { get; set; } = "0";
        public string anticipazioniDaRestituire { get; set; } = "0";
        public string debitiVsFornitori { get; set; } = "0";
        public string paghe { get; set; } = "0";
        public string fattureRicevute { get; set; } = "0";
        public string fattureDaRicevere { get; set; } = "0";
        public int saldo { get; set; } = 0;
        public string ProxSal { get; set; } = "0";
        public int IdCantiere { get; set; }
        public double cashflow { get; set; } = 0.0;
        [ForeignKey("IdCantiere")]
        public Cantiere Cantiere { get; set; }
    }

    [Table("Budget")]
    [Index(nameof(IdCantiere), IsUnique = true)]
    public class BudgetModel
    {
        public int Id { get; set; }
        public int IdCantiere { get; set; }
        //public double TotaleRicavi { get; set; }
        //public double TotaleCosti { get; set; }
        //public double TotaleMargine { get; set; }
        //public double PercentualeRicavi { get; set; }
        public virtual IEnumerable<CapitoloBudgetModel> Capitoli { get; set; }

        [ForeignKey(nameof(IdCantiere))]
        public virtual Cantiere? Cantiere { get; set; }
    }
    [Table("BudgetCapitolo")]
    public class CapitoloBudgetModel
    {
        public int Id { get; set; }
        public int IdBudget { get; set; }
        public string Capitolo { get; set; }
        //public double TotaleRicavi { get; set; }
        //public double TotaleCosti { get; set; }
        //public double TotaleMargine { get; set; }
        public IEnumerable<AttivitaBudgetModel> Attivita { get; set; }

        [ForeignKey(nameof(IdBudget))]
        public virtual BudgetModel? Budget { get; set; }

    }
    [Table("BudgetAttivita")]
    public class AttivitaBudgetModel
    {
        public int Id { get; set; }
        public int IdCapitolo { get; set; }
        public int? IdFornitore { get; set; }
        [Required(AllowEmptyStrings = false)]
        public string Attivita { get; set; }
        public double Ricavi { get; set; }
        public double Costi { get; set; }
        public double Margine { get; set; }
        public double PercentualeRicavi { get; set; }
        //public IEnumerable<_File> Allegati { get; set; } //TODO: da gestire

        [ForeignKey(nameof(IdFornitore))]
        public virtual Fornitori? Fornitore { get; set; }
        [ForeignKey(nameof(IdCapitolo))]
        public virtual CapitoloBudgetModel? Capitolo { get; set; }
    }
    public class AttachmentsBudget
    {
        public int Id { get; set; }
        public int IdAttivitaBudget { get; set; }
        public int IdFile { get; set; }
        [ForeignKey(nameof(IdAttivitaBudget))]
        public virtual AttivitaBudgetModel? AttivitaBudget { get; set; }
        [ForeignKey(nameof(IdFile))]
        public virtual _File? File { get; set; }
    }
}
