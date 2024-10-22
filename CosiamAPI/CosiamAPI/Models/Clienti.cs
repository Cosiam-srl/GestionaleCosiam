using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace CosiamAPI.Models
{
    public class Clienti
    {
        public int Id { get; set; }
        [MaxLength(250)]
        public string Name { get; set; }
        public string Email { get; set; }
        public string PIVA { get; set; }
        public string Address { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public string CAP { get; set; }
        public string Telephone { get; set; }
        public string CF { get; set; }
        public string File { get; set; } //immagine profilo
        public string City { get; set; }
        public string Province { get; set; }
	    public string payments{ get; set; }
        public string legalForm { get; set; }
    }
}

