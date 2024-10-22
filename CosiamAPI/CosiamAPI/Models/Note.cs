#nullable enable
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace CosiamAPI.Models
{
    public class Note
    {
        public int Id { get; set; }
        [MaxLength(50)]
        public string Name { get; set; } = "Senza Nome";
        [MaxLength(5000)]
        public string Description { get; set; } = "Nessuna Descrizione";
        public DateTime CreationDate { get; set; } = DateTime.Now.Date;
        public DateTime? DueDate { get; set; }
        public string State { get; set; } = "Nuova";
        public string Priority { get; set; } = "Normale";
        public string? Author { get; set; } 

    }

    public class PersonaleResponsabileNota
    {
        [Key]
        public int Id { get; set; }
        public int IdPersonale { get; set; }
        [ForeignKey("IdPersonale")]
        public Personale? Personale { get; set; }
        public int IdNote { get; set; }
        [ForeignKey("IdNote")]
        public Note? Note { get; set; }
    }

    public class AttachmentsNota
    {
        [Key]
        public int Id { get; set; }
        public int IdFile { get; set; }
        [ForeignKey("IdFile")]
        public _File? File { get; set; }
        public int IdNota { get; set; }
        [ForeignKey("IdNota")]
        public Note? Nota { get; set; }
    }

    public class MezziNota
    {
        public int Id { get; set; }
        public int IdMezzo { get; set; }
        [ForeignKey("IdMezzo")]
        public Mezzi? Mezzo { get; set; }
        public int IdNote { get; set; }
        [ForeignKey("IdNote")]
        public Note? Note { get; set; }
    }

    public class ThreadNota
    {
        public int Id { get; set; }
        public int IdReferredNote { get; set; }
        [ForeignKey("IdReferredNote")]
        public Note? ReferredNote { get; set; }
        public int IdReferringNote { get; set; }
        [ForeignKey("IdReferringNote")]
        public Note? ReferringNote { get; set; }
    }

    public class NoteWithAttachmentsView
    {
        public Note? Nota { get; set; }
        public IEnumerable<_File?>? listFile { get; set; }
    }
}
