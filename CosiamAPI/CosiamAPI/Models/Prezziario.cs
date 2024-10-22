using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace CosiamAPI.Models
{

    public class PrezziarioCliente
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string ValidationYear { get; set; }
        public int? IdCliente { get; set; }
        #nullable enable
        [ForeignKey("IdCliente")]
        public Clienti? Cliente { get; set; }
        #nullable disable
        public double? DiscountPercentage { get; set; }
    }

    public class ServizioCliente
    {
        public int ID { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string UM { get; set; }
        public double PricePerUm { get; set; }
        public int IVA { get; set; }
        public int IdPrezziario { get; set; }
        [ForeignKey("IdPrezziario")]
        public PrezziarioCliente Prezziario { get; set; }
	    public string rateCode { get; set; }
        public bool ApplyDiscount { get; set; }
    }

    public class ScontoCliente
    {
        public int Id { get; set; }
        public int IdPrezziarioCliente { get; set; }
        [ForeignKey("IdPrezziarioCliente")]
        public PrezziarioCliente PrezziarioCliente { get; set; }
        public int Sconto { get; set; }
        public int IdCliente { get; set; }
        [ForeignKey("IdCliente")]
        public Clienti Cliente { get; set; }
    }

    public class ServizioFornitore
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string UM { get; set; }
        public double PricePerUM { get; set; }
        public int IVA { get; set; }
        public int IdFornitore { get; set; }
        [ForeignKey("IdFornitore")]
        public Fornitori Fornitore { get; set; }

    }
        

    //  _           _ _      _                  _                  
    // (_)         | (_)    (_)                (_)                 
    //  _ _ __   __| |_  ___ _ __________ _ _____  ___  _ __   ___ 
    // | | '_ \ / _` | |/ __| |_  /_  / _` |_  / |/ _ \| '_ \ / _ \
    // | | | | | (_| | | (__| |/ / / / (_| |/ /| | (_) | | | |  __/
    // |_|_| |_|\__,_|_|\___|_/___/___\__,_/___|_|\___/|_| |_|\___|

    public class WordsCounter
    {
        public int Id { get; set; }
        public int IdPrezziarioCliente { get; set; }
        [ForeignKey("IdPrezziarioCliente")]     //NOTARE ho impostato on delete no action per questa FK, poichè prezziario -> on cascade servizio -> on cascade wordscounter
        public PrezziarioCliente prezziarioCliente { get; set; }
        public string word { get; set; }
        public int idServizioCliente { get; set; }
        [ForeignKey("idServizioCliente")]
        public ServizioCliente servizioCliente { get; set; }
        public int counter { get; set; }        // Conta quante volte appaia nella descrizione del servizio
    }
}