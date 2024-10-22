using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class creataTabellaScadenzeFornitori2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ScadenzeFornitori",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PerformingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IdFornitori = table.Column<int>(type: "int", nullable: false),
                    IdNote = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScadenzeFornitori", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScadenzeFornitori_Fornitori_IdFornitori",
                        column: x => x.IdFornitori,
                        principalTable: "Fornitori",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ScadenzeFornitori_Note_IdNote",
                        column: x => x.IdNote,
                        principalTable: "Note",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ScadenzeFornitori_IdFornitori",
                table: "ScadenzeFornitori",
                column: "IdFornitori");

            migrationBuilder.CreateIndex(
                name: "IX_ScadenzeFornitori_IdNote",
                table: "ScadenzeFornitori",
                column: "IdNote");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScadenzeFornitori");
        }
    }
}
