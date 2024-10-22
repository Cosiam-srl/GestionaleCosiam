using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class finanacilaCardsv2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "YearOfCompletition",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "extraWorkAmount",
                table: "Contratto");

            migrationBuilder.RenameColumn(
                name: "budget",
                table: "Cantiere",
                newName: "workBudget");

            migrationBuilder.AddColumn<double>(
                name: "additionalChargesAmount",
                table: "Contratto",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "additionalGrossWorkAmount",
                table: "Contratto",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "additionalNetAmount",
                table: "Contratto",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "contractCode",
                table: "Contratto",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "discount",
                table: "Contratto",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<DateTime>(
                name: "endingDate",
                table: "Contratto",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<double>(
                name: "initialChargesAmount",
                table: "Contratto",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "initialGrossWorkAmount",
                table: "Contratto",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "orderedImport",
                table: "Contratto",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "residualImport",
                table: "Contratto",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<DateTime>(
                name: "startDate",
                table: "Contratto",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<double>(
                name: "startNetAmount",
                table: "Contratto",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "totalAmountDiscounted",
                table: "Contratto",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "totalChargesAmount",
                table: "Contratto",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "totalGrossWorkAmount",
                table: "Contratto",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "totalNetAmount",
                table: "Contratto",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "legalForm",
                table: "Clienti",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SOA",
                table: "Cantiere",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "additionalActsBudget",
                table: "Cantiere",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<short>(
                name: "cap",
                table: "Cantiere",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0);

            migrationBuilder.AddColumn<double>(
                name: "chargesBudget",
                table: "Cantiere",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "finalAmount",
                table: "Cantiere",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "orderAmount",
                table: "Cantiere",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "FinancialCard",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    creditiVsClienti = table.Column<int>(type: "int", nullable: false),
                    daContabilizzare = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    daFatturare = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    daIncassare = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    debitiABreve = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    anticipazioniDaRestituire = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    debitiVsFornitori = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    paghe = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fattureRicevute = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    fattureDaRicevere = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    saldo = table.Column<int>(type: "int", nullable: false),
                    IdCantiere = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialCard", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinancialCard_Cantiere_IdCantiere",
                        column: x => x.IdCantiere,
                        principalTable: "Cantiere",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FinancialCard_IdCantiere",
                table: "FinancialCard",
                column: "IdCantiere");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FinancialCard");

            migrationBuilder.DropColumn(
                name: "additionalChargesAmount",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "additionalGrossWorkAmount",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "additionalNetAmount",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "contractCode",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "discount",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "endingDate",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "initialChargesAmount",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "initialGrossWorkAmount",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "orderedImport",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "residualImport",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "startDate",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "startNetAmount",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "totalAmountDiscounted",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "totalChargesAmount",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "totalGrossWorkAmount",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "totalNetAmount",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "legalForm",
                table: "Clienti");

            migrationBuilder.DropColumn(
                name: "SOA",
                table: "Cantiere");

            migrationBuilder.DropColumn(
                name: "additionalActsBudget",
                table: "Cantiere");

            migrationBuilder.DropColumn(
                name: "cap",
                table: "Cantiere");

            migrationBuilder.DropColumn(
                name: "chargesBudget",
                table: "Cantiere");

            migrationBuilder.DropColumn(
                name: "finalAmount",
                table: "Cantiere");

            migrationBuilder.DropColumn(
                name: "orderAmount",
                table: "Cantiere");

            migrationBuilder.RenameColumn(
                name: "workBudget",
                table: "Cantiere",
                newName: "budget");

            migrationBuilder.AddColumn<string>(
                name: "YearOfCompletition",
                table: "Contratto",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "extraWorkAmount",
                table: "Contratto",
                type: "int",
                nullable: true);
        }
    }
}
