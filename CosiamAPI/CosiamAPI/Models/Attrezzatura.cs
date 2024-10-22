using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

#nullable enable

namespace CosiamAPI.Models
{
    [Table("Mezzi")]
    public class Mezzi
    {
        public int Id { get; set; }
        [MaxLength(50)]
        public string Description { get; set; } = "";
        public string? Brand { get; set; } = "";
        public string? Model { get; set; } = "";
        public string? LicensePlate { get; set; } = ""; //Significa targa, ignoranti
        public DateTime? InsuranceExpirationDate { get; set; }
        public DateTime? RevisionExpirationDate { get; set; }
        public DateTime? StampDutyExpirationDate { get; set; }
        public DateTime? Tachograph { get; set; } //tachigrafo
        public int LastKMCheck { get; set; } = 0;
        public double? ExtimatedValue { get; set; }
        public DateTime? MatriculationDate { get; set; }
        public double? OriginalPrice { get; set; }
        public DateTime? LicenseCProprio { get; set; }
        public DateTime? WearBook { get; set; } //libretto d'usura
        public DateTime? FurtoIncendio { get; set; }
        public bool ContoProprioContoTerzi { get; set; }
        public DateTime? ISPSEL { get; set; }
        public DateTime? TwentyYearVerificationOfLiftingOrgans { get; set; }
        //Eventually, we'll need to add the ID of the supplier
        public double? DailyCost { get; set; }
        public string? inStrenght {get; set;} = "si";
    }

    public class DPI
    {
        public int Id { get; set; }
        public string? Position { get; set; } = "";
        public string? Description { get; set; } = "";
        public string? UM { get; set; } = "";
        public int? Quantity { get; set; }
        public double? cost { get; set; }
        public DateTime? MaintenanceExpiration { get; set; }
        public bool? Usable { get; set; }
        public string? Notes { get; set; }

    }

    public class AttrezzaturaAT
    {
        public int Id { get; set; }
        public string? Type { get; set; } = "";
        public string? Description { get; set; } = "";
        public string? Builder { get; set; }
        public string? Model { get; set; } 
        public string? LicensePlate { get; set; }
        public string? ProductionDate { get; set; }
        public string? PropertyOf { get; set; }
        public string? Idoneity { get; set; }
        public string? TechnicalSpecs { get; set; }
        public double? EstimatedValue { get; set; }
        public string? Position { get; set; } = "";
        public string? Compatibility { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }
    }


    public class StrumentiDiMisura
    {
        public int Id { get; set; }
        public string? Type { get; set; } = "";
        public string? Brand { get; set; } = "";
        public string? Model { get; set; } = "";
        public string? SerialNumber { get; set; }
        public string? Registration { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }
        public string? Invoice { get; set; }
        public string? Idoneity { get; set; }
        public string? TecSpecs { get; set; }
        public DateTime? CalibrationExpiration { get; set; }
    }

    public class InventarioGenerale
    {
        public int Id { get; set; }
        public string? Position { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? UM { get; set; }
        public int? Quantity { get; set; }
        public float? InventoryValue { get; set; }
    }

    public class ScadenzeMezzi
    {
        public int Id { get; set; }
        public DateTime? PerformingDate { get; set; }
        public int IdMezzi { get; set; }
        [ForeignKey("IdMezzi")]
        public Mezzi? Mezzo { get; set; }
        public int IdNote { get; set; }
        [ForeignKey("IdNote")]
        public Note? Nota { get; set; }
    }

    public class attachementsAttrezzatura
    {
        public int Id { get; set; }
        public int IdAttrezzaturaAt { get; set; }
        [ForeignKey("IdAttrezzaturaAt")]
        public AttrezzaturaAT? Attrezzo { get; set; }
        public int IdFile { get; set; }
        [ForeignKey("IdFile")]
        public _File? File { get; set; }
    }

}
