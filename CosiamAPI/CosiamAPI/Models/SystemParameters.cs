using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CosiamAPI.Models
{
    /// <summary>
    /// Classe contenente i parametri di sistema, in coppie Chiave-Valore
    /// </summary>
    [Table("Parameters")]
    public class SystemParameters
    {
        [Key]
        [MaxLength(100)]
        public string Key { get; set; }
        public string Value { get; set; }

    }
}