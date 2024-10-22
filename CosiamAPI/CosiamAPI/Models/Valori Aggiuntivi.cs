#nullable enable

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Security.Permissions;

namespace CosiamAPI.Models
{
    [Table(nameof(ValoriAggiuntivi))]
    public record ValoriAggiuntivi
    {
        public int Id { get; set; }
        public double AdditionalGrossWorkAmount { get; set; }
        public double AdditionalChargesAmount { get; set; }
        public double AdditionalNetAmount { get; set; }
        public double AdditionalSolarDays { get; set; }
        public DateTime? Data { get; set; }
        [MaxLength(50)]
        public string? CodiceContratto { get; set; }
        public int? IdCantiere { get; set; }
        public int? IdContratto { get; set; }
        [ForeignKey(nameof(IdCantiere))]
        public virtual Cantiere? Cantiere { get; set; }
        [ForeignKey(nameof(IdContratto))]
        public virtual Contratto? Contratto{ get; set; }

    }
}
