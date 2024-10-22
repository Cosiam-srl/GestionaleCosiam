using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    public partial class AddedTableValoriAggiuntivi_Cantiere_Contratto : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ValoriAggiuntivi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AdditionalGrossWorkAmount = table.Column<double>(type: "float", nullable: false),
                    AdditionalChargesAmount = table.Column<double>(type: "float", nullable: false),
                    AdditionalNetAmount = table.Column<double>(type: "float", nullable: false),
                    AdditionalSolarDays = table.Column<double>(type: "float", nullable: false),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CodiceContratto = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IdCantiere = table.Column<int>(type: "int", nullable: true),
                    IdContratto = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ValoriAggiuntivi", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ValoriAggiuntivi_Cantiere_IdCantiere",
                        column: x => x.IdCantiere,
                        principalTable: "Cantiere",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ValoriAggiuntivi_Contratto_IdContratto",
                        column: x => x.IdContratto,
                        principalTable: "Contratto",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ValoriAggiuntivi_IdCantiere",
                table: "ValoriAggiuntivi",
                column: "IdCantiere");

            migrationBuilder.CreateIndex(
                name: "IX_ValoriAggiuntivi_IdContratto",
                table: "ValoriAggiuntivi",
                column: "IdContratto");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ValoriAggiuntivi");
        }
    }
}
