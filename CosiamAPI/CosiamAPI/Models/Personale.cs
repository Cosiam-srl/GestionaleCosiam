using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

#nullable enable
namespace CosiamAPI.Models
{

    [Index(nameof(email), IsUnique = true)]
    public class Personale
    {
        public int Id { get; set; }
        [MaxLength(50)]
        public string Name { get; set; } = "";
        [MaxLength(50)]
        public string? CF { get; set; } = "";
        [MaxLength(17)]
        public string Surname { get; set; } = "";
        [MaxLength(50)]
        public string? telephone { get; set; }
        [MaxLength(50)]
        public string? email { get; set; }
        [MaxLength(50)]
        public string birthday { get; set; } = "";
        //[MaxLength(50)]
        public string? Title { get; set; }
        public bool? Employed { get; set; }
        public string? job { get; set; }
        public string? contract { get; set; }
        public bool? ConsegnaDPI { get; set; }
        public bool? ConsegnaTesserino { get; set; }
        public string? BirthPlace { get; set; }
        public string? Address { get; set; }
        public string? OrganizationRole { get; set; }
        public string? medicalIdoneity { get; set; }
        public DateTime? HiringStartDate { get; set; }
        public DateTime? HiringEndDate { get; set; }
        public string? level { get; set; }
        public double? ordinaryPrice { get; set; }
        public double? extraordinaryPrice { get; set; }
        public double? travelPrice { get; set; }
        public string? skills { get; set; }
        public string? File { get; set; } //immagine profilo
        public string? inStrenght { get; set; } = "si";
    }

    public class ScadenzePersonale
    {
        public int Id { get; set; }
        public DateTime? PerformingDate { get; set; }
        public int IdPersonale { get; set; }
        [ForeignKey("IdPersonale")]
        public Personale? Personale { get; set; }
        public int IdNote { get; set; }
        [ForeignKey("IdNote")]
        public Note? Nota { get; set; }
    }

}
