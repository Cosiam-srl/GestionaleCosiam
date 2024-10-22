#nullable enable

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace CosiamAPI.Models
{
    public class Saltura
    {
        public int Id { get; set; }
        public string? descriptionNumberSal { get; set; }
        public string? descriptionNumberCP { get; set; }
        public string? descriptionNumberFattura { get; set; }
        public DateTime? dataEmissioneSAL { get; set; } = null;
        public DateTime? dataEmissioneCP { get; set; } = null;
        public DateTime? dataEmissioneFattura { get; set; } = null;
        public DateTime? dataScadenzaFattura { get; set; } = null;
        public DateTime? dataIncassoFattura { get; set; } = null;
        public string? netAmountSAL { get; set; }
        public double? netAmountCP { get; set; }
        public double? netAmountFattura { get; set; }
        public double? ivaAmountFattura { get; set; }
        public string? salState { get; set; }
        public string? cpState { get; set; }
        public string? fatturaState { get; set; }
        public string? contractualAdvance { get; set; }
        public string? accidentsWithholding { get; set; }
        public string? iva { get; set; }
        public DateTime? startingReferralPeriodDate { get; set; }
        public DateTime? endingReferralPeriodDate { get; set; }
        public int? IdCantiere { get; set; }
        [ForeignKey("IdCantiere")]
        public Cantiere? Cantiere { get; set; }
    }

    public class AttachmentsSaltura
    {
        public int Id { get; set; }
        public int IdFile { get; set; }
        [ForeignKey("IdFile")]
        public _File? File { get; set; }
        public int IdSaltura { get; set; }
        [ForeignKey("IdSaltura")]
        public Saltura? Saltura { get; set; }
        public int order { get; set; }
    }
}
