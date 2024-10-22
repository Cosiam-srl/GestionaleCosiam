using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AggiuntaListaMezziDiCantiere : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ListaMezziDiCantiere",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdMezzi = table.Column<int>(type: "int", nullable: false),
                    IdCantiere = table.Column<int>(type: "int", nullable: false),
                    fromDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    toDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListaMezziDiCantiere", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListaMezziDiCantiere_Cantiere_IdCantiere",
                        column: x => x.IdCantiere,
                        principalTable: "Cantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListaMezziDiCantiere_Mezzi_IdMezzi",
                        column: x => x.IdMezzi,
                        principalTable: "Mezzi",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ListaMezziDiCantiere_IdCantiere",
                table: "ListaMezziDiCantiere",
                column: "IdCantiere");

            migrationBuilder.CreateIndex(
                name: "IX_ListaMezziDiCantiere_IdMezzi",
                table: "ListaMezziDiCantiere",
                column: "IdMezzi");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ListaMezziDiCantiere");
        }
    }
}
