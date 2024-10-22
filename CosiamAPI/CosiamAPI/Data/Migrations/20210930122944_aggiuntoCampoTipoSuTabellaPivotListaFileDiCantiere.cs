using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class aggiuntoCampoTipoSuTabellaPivotListaFileDiCantiere : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "type",
                table: "ListaFileDiCantiere",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "type",
                table: "ListaFileDiCantiere");
        }
    }
}
