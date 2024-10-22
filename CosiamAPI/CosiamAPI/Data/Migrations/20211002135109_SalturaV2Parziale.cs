using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class SalturaV2Parziale : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IVA",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "NumeroFattura",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "TotalValue",
                table: "Saltura");

            migrationBuilder.RenameColumn(
                name: "State",
                table: "Saltura",
                newName: "descriptionNumberSal");

            migrationBuilder.RenameColumn(
                name: "RecessDate",
                table: "Saltura",
                newName: "dataScadenzaFattura");

            migrationBuilder.RenameColumn(
                name: "IssueDate",
                table: "Saltura",
                newName: "dataIncassoFattura");

            migrationBuilder.RenameColumn(
                name: "ExpirationDate",
                table: "Saltura",
                newName: "dataEmissioneSAL");

            migrationBuilder.AddColumn<DateTime>(
                name: "dataEmissioneCP",
                table: "Saltura",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "dataEmissioneFattura",
                table: "Saltura",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "descriptionNumberCP",
                table: "Saltura",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "descriptionNumberFattura",
                table: "Saltura",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "dataEmissioneCP",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "dataEmissioneFattura",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "descriptionNumberCP",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "descriptionNumberFattura",
                table: "Saltura");

            migrationBuilder.RenameColumn(
                name: "descriptionNumberSal",
                table: "Saltura",
                newName: "State");

            migrationBuilder.RenameColumn(
                name: "dataScadenzaFattura",
                table: "Saltura",
                newName: "RecessDate");

            migrationBuilder.RenameColumn(
                name: "dataIncassoFattura",
                table: "Saltura",
                newName: "IssueDate");

            migrationBuilder.RenameColumn(
                name: "dataEmissioneSAL",
                table: "Saltura",
                newName: "ExpirationDate");

            migrationBuilder.AddColumn<int>(
                name: "IVA",
                table: "Saltura",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NumeroFattura",
                table: "Saltura",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "TotalValue",
                table: "Saltura",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }
    }
}
