using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AggiunteScadenzePersonale : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ScadenzePersonale",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PerformingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IdPersonale = table.Column<int>(type: "int", nullable: false),
                    IdNote = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScadenzePersonale", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScadenzePersonale_Note_IdNote",
                        column: x => x.IdNote,
                        principalTable: "Note",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ScadenzePersonale_Personale_IdPersonale",
                        column: x => x.IdPersonale,
                        principalTable: "Personale",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ScadenzePersonale_IdNote",
                table: "ScadenzePersonale",
                column: "IdNote");

            migrationBuilder.CreateIndex(
                name: "IX_ScadenzePersonale_IdPersonale",
                table: "ScadenzePersonale",
                column: "IdPersonale");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScadenzePersonale");
        }
    }
}
