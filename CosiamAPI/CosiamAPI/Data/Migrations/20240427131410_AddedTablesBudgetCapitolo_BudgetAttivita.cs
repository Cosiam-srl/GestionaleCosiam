using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    public partial class AddedTablesBudgetCapitolo_BudgetAttivita : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Budget_IdCantiere",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "CostiConsuntivi",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "CostiPercentuale",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "CostiPrevisionali",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "DataFine",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "DataInizio",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "PercentualeRicavi",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "RicaviConsuntivi",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "RicaviPrevisionali",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "UtileConsuntivo",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "UtilePercentuale",
                table: "Budget");

            migrationBuilder.DropColumn(
                name: "UtilePrevisionale",
                table: "Budget");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Budget",
                newName: "Id");

            migrationBuilder.CreateTable(
                name: "BudgetCapitolo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdBudget = table.Column<int>(type: "int", nullable: false),
                    Capitolo = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetCapitolo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BudgetCapitolo_Budget_IdBudget",
                        column: x => x.IdBudget,
                        principalTable: "Budget",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BudgetAttivita",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdCapitolo = table.Column<int>(type: "int", nullable: false),
                    IdFornitore = table.Column<int>(type: "int", nullable: false),
                    Attivita = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ricavi = table.Column<double>(type: "float", nullable: false),
                    Costi = table.Column<double>(type: "float", nullable: false),
                    Margine = table.Column<double>(type: "float", nullable: false),
                    PercentualeRicavi = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BudgetAttivita", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BudgetAttivita_BudgetCapitolo_IdCapitolo",
                        column: x => x.IdCapitolo,
                        principalTable: "BudgetCapitolo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BudgetAttivita_Fornitori_IdFornitore",
                        column: x => x.IdFornitore,
                        principalTable: "Fornitori",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Budget_IdCantiere",
                table: "Budget",
                column: "IdCantiere",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BudgetAttivita_IdCapitolo",
                table: "BudgetAttivita",
                column: "IdCapitolo");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetAttivita_IdFornitore",
                table: "BudgetAttivita",
                column: "IdFornitore");

            migrationBuilder.CreateIndex(
                name: "IX_BudgetCapitolo_IdBudget",
                table: "BudgetCapitolo",
                column: "IdBudget");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BudgetAttivita");

            migrationBuilder.DropTable(
                name: "BudgetCapitolo");

            migrationBuilder.DropIndex(
                name: "IX_Budget_IdCantiere",
                table: "Budget");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Budget",
                newName: "id");

            migrationBuilder.AddColumn<double>(
                name: "CostiConsuntivi",
                table: "Budget",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<float>(
                name: "CostiPercentuale",
                table: "Budget",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<double>(
                name: "CostiPrevisionali",
                table: "Budget",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataFine",
                table: "Budget",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DataInizio",
                table: "Budget",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<float>(
                name: "PercentualeRicavi",
                table: "Budget",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<double>(
                name: "RicaviConsuntivi",
                table: "Budget",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "RicaviPrevisionali",
                table: "Budget",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "UtileConsuntivo",
                table: "Budget",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<float>(
                name: "UtilePercentuale",
                table: "Budget",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<double>(
                name: "UtilePrevisionale",
                table: "Budget",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateIndex(
                name: "IX_Budget_IdCantiere",
                table: "Budget",
                column: "IdCantiere");
        }
    }
}
