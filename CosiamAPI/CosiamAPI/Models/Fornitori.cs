using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;


namespace CosiamAPI.Models
{
    public class Fornitori
    {
        public int Id { get; set; }
        [MaxLength(250)]
        public string Name { get; set; }
        public string Email { get; set; }
        public string PIVA { get; set; }
        public string Address { get; set; }
        public string Type { get; set; }
        public string Status { get; set; } = "Disponibile";
        public string CAP { get; set; }
        public string Telephone { get; set; }
        public string CF { get; set; }
        public string File { get; set; } //immagine profilo
    }
    #nullable enable
    public class ScadenzeFornitori
    {
        public int Id { get; set; }
        public DateTime? PerformingDate { get; set; }
        public int IdFornitori { get; set; }
        [ForeignKey("IdFornitori")]
        public Fornitori? Fornitori { get; set; }
        public int IdNote { get; set; }
        [ForeignKey("IdNote")]
        public Note? Nota { get; set; }
    }
}
