using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

#nullable enable

namespace CosiamAPI.Models
{
    public class Contratto
    {
        public int Id { get; set; }
        public int? IdCliente { get; set; }
        [ForeignKey("IdCliente")]
        public Clienti? Cliente { get; set; }
        public string? shortDescription { get; set; }
        public string? longDescription { get; set; }
        public string? cig { get; set; }
        public string? cup { get; set; }
        public string? soa { get; set; }
        public int? idPm { get; set; }
        [ForeignKey("idPm")]
        public Personale? Pm { get; set; }
        public string? Place { get; set; }
        public string? status { get; set; }
        public int? netContractualAmount { get; set; }
        public int? IdPrezziarioCliente { get; set; }
        [ForeignKey("IdPrezziarioCliente")]
        public PrezziarioCliente? Prezziario { get; set; }
        public string? oda { get; set; }
        public string? contractCode { get; set; }
        public DateTime? startDate { get; set; }
        public DateTime? endingDate { get; set; }
        public double initialGrossWorkAmount { get; set; }
        public double initialChargesAmount { get; set; }
        public double startNetAmount { get; set; }
        public double additionalGrossWorkAmount { get; set; }
        public double additionalChargesAmount { get; set; }
        public double additionalNetAmount { get; set; }
        public double totalGrossWorkAmount { get; set; }
        public double totalChargesAmount { get; set; }
        public double totalNetAmount { get; set; }
        public double discount { get; set; }
        public double totalAmountDiscounted { get; set; }
        public double orderedImport { get; set; }
        public double residualImport { get; set; }
        public ICollection<ValoriAggiuntivi>? ValoriAggiuntivi { get; set; }
    }

    [Index(nameof(IdContratto), nameof(IdPrezziario), IsUnique = true)]
    public class ListaPrezzariContratto
    {
        public int Id { get; set; }
        public int IdContratto { get; set; }
        [ForeignKey("IdContratto")]
        public Contratto? Contratto { get; set; }
        public int IdPrezziario { get; set; }
        [ForeignKey("IdPrezziario")]
        public PrezziarioCliente? PrezziarioCliente { get; set; }
    }

    public class ContrattoView : Contratto
    {
        public int[]? prezzari_id { get; set; }

        public Contratto getContratto()
        {
            Contratto c = new Contratto();
            c.additionalChargesAmount = this.additionalChargesAmount;
            c.additionalGrossWorkAmount = this.additionalGrossWorkAmount;
            c.additionalNetAmount = this.additionalGrossWorkAmount;
            c.cig = this.cig;
            c.Cliente = this.Cliente;
            c.contractCode = this.contractCode;
            c.cup = this.cup;
            c.discount = this.discount;
            c.endingDate = this.endingDate;
            c.Id = this.Id;
            c.IdCliente = this.IdCliente;
            c.idPm = this.idPm;
            c.initialChargesAmount = this.initialChargesAmount;
            c.initialGrossWorkAmount = this.initialGrossWorkAmount;
            c.longDescription = this.longDescription;
            c.netContractualAmount = this.netContractualAmount;
            c.oda = this.oda;
            c.orderedImport = this.orderedImport;
            c.Place = this.Place;
            c.Pm = this.Pm;
            c.residualImport = this.residualImport;
            c.shortDescription = this.shortDescription;
            c.soa = this.soa;
            c.startDate = this.startDate;
            c.startNetAmount = this.startNetAmount;
            c.status = this.status;
            c.totalAmountDiscounted = this.totalAmountDiscounted;
            c.totalChargesAmount = this.totalChargesAmount;
            c.totalGrossWorkAmount = this.totalGrossWorkAmount;
            c.totalNetAmount = this.totalNetAmount;
            c.IdPrezziarioCliente = this.IdPrezziarioCliente;
            c.ValoriAggiuntivi = this.ValoriAggiuntivi;
            return c;
        }
        public void setContratto(Contratto c)
        {
            this.additionalChargesAmount = c.additionalChargesAmount;
            this.additionalGrossWorkAmount = c.additionalGrossWorkAmount;
            this.additionalNetAmount = c.additionalGrossWorkAmount;
            this.cig = c.cig;
            this.Cliente = c.Cliente;
            this.contractCode = c.contractCode;
            this.cup = c.cup;
            this.discount = c.discount;
            this.endingDate = c.endingDate;
            this.Id = c.Id;
            this.IdCliente = c.IdCliente;
            this.idPm = c.idPm;
            this.initialChargesAmount = c.initialChargesAmount;
            this.initialGrossWorkAmount = c.initialGrossWorkAmount;
            this.longDescription = c.longDescription;
            this.netContractualAmount = c.netContractualAmount;
            this.oda = c.oda;
            this.orderedImport = c.orderedImport;
            this.Place = c.Place;
            this.Pm = c.Pm;
            this.residualImport = c.residualImport;
            this.shortDescription = c.shortDescription;
            this.soa = c.soa;
            this.startDate = c.startDate;
            this.startNetAmount = c.startNetAmount;
            this.status = c.status;
            this.totalAmountDiscounted = c.totalAmountDiscounted;
            this.totalChargesAmount = c.totalChargesAmount;
            this.totalGrossWorkAmount = c.totalGrossWorkAmount;
            this.totalNetAmount = c.totalNetAmount;
            this.IdPrezziarioCliente = c.IdPrezziarioCliente;
            this.ValoriAggiuntivi = c.ValoriAggiuntivi;
        }

        public void setPrezzariIds(int[] prezzari_id)
        {
            this.prezzari_id = prezzari_id;
        }

        public int[] getPrezzariIds()
        {
            return (this.prezzari_id != null ? this.prezzari_id : new int[] { });
        }

        public bool isMultiPrezziario()
        {
            if (this.prezzari_id != null)
                return true;
            return false;
        }
    }

}
