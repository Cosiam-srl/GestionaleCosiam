using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AggiuntaTabellaFileSuCantiere : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ListaFileDiCantiere",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdFile = table.Column<int>(type: "int", nullable: false),
                    IdCantiere = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListaFileDiCantiere", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListaFileDiCantiere_Cantiere_IdCantiere",
                        column: x => x.IdCantiere,
                        principalTable: "Cantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListaFileDiCantiere_File_IdFile",
                        column: x => x.IdFile,
                        principalTable: "File",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ListaFileDiCantiere_IdCantiere",
                table: "ListaFileDiCantiere",
                column: "IdCantiere");

            migrationBuilder.CreateIndex(
                name: "IX_ListaFileDiCantiere_IdFile",
                table: "ListaFileDiCantiere",
                column: "IdFile");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ListaFileDiCantiere");
        }
    }
}
