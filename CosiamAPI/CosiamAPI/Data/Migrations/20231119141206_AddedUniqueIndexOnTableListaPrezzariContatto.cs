using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    public partial class AddedUniqueIndexOnTableListaPrezzariContatto : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ListaPrezzariContratto_IdContratto",
                table: "ListaPrezzariContratto");

            migrationBuilder.CreateIndex(
                name: "IX_ListaPrezzariContratto_IdContratto_IdPrezziario",
                table: "ListaPrezzariContratto",
                columns: new[] { "IdContratto", "IdPrezziario" },
                unique: true);

            //popolo la tabella listaPrezzariContratto prendendo l'idContratto e l'idPrezzario dalla tabella contratto
            migrationBuilder.Sql("insert into ListaPrezzariContratto(IdContratto, IdPrezziario) select id,IdPrezziarioCliente from Contratto order by Id, IdPrezziarioCliente");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ListaPrezzariContratto_IdContratto_IdPrezziario",
                table: "ListaPrezzariContratto");

            migrationBuilder.CreateIndex(
                name: "IX_ListaPrezzariContratto_IdContratto",
                table: "ListaPrezzariContratto",
                column: "IdContratto");
        }
    }
}
