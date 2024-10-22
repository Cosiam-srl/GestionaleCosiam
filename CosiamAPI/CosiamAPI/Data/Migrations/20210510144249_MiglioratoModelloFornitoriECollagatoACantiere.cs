using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class MiglioratoModelloFornitoriECollagatoACantiere : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ListaFornitoriCantiere",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdFornitore = table.Column<int>(type: "int", nullable: false),
                    IdCantiere = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListaFornitoriCantiere", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListaFornitoriCantiere_Cantiere_IdCantiere",
                        column: x => x.IdCantiere,
                        principalTable: "Cantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListaFornitoriCantiere_Fornitori_IdFornitore",
                        column: x => x.IdFornitore,
                        principalTable: "Fornitori",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ListaFornitoriCantiere_IdCantiere",
                table: "ListaFornitoriCantiere",
                column: "IdCantiere");

            migrationBuilder.CreateIndex(
                name: "IX_ListaFornitoriCantiere_IdFornitore",
                table: "ListaFornitoriCantiere",
                column: "IdFornitore");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ListaFornitoriCantiere");
        }
    }
}
