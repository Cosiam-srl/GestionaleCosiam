using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AggiunteScadenzeMezzi : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ScadenzeMezzi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PerformingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IdMezzi = table.Column<int>(type: "int", nullable: false),
                    IdNote = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScadenzeMezzi", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScadenzeMezzi_Mezzi_IdMezzi",
                        column: x => x.IdMezzi,
                        principalTable: "Mezzi",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ScadenzeMezzi_Note_IdNote",
                        column: x => x.IdNote,
                        principalTable: "Note",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ScadenzeMezzi_IdMezzi",
                table: "ScadenzeMezzi",
                column: "IdMezzi");

            migrationBuilder.CreateIndex(
                name: "IX_ScadenzeMezzi_IdNote",
                table: "ScadenzeMezzi",
                column: "IdNote");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScadenzeMezzi");
        }
    }
}
