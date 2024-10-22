using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

// NOTE THAT THIS CONNECTION TABLE WON'T BE DELETED IN CASE A USER ISE DELETED.
// There is no "On DELETE CASCADE", but it should not be a problem given that technically
// there is no option to delete a user, just deactivating.
namespace CosiamAPI.Models.Security
{
    [Index(nameof(IdUser), IsUnique = true)]
    [Index(nameof(IdPersonale), IsUnique = true)]
    public class ProfileManagement
    {
        public int Id { get; set; }
        public string IdUser { get; set; }
        #nullable enable
        [ForeignKey("IdUser")]
        public IdentityUser? User { get; set; }
        public int IdPersonale { get; set; } // Connection to the "Personale" table, so we can connect a user to an existing worker.
        [ForeignKey("IdPersonale")]
        public Personale? Personale { get; set; }
        #nullable disable
        public bool isEnabled { get; set; }
    }
}
