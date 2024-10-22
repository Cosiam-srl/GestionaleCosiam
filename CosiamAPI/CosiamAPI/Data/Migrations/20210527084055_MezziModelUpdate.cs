using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class MezziModelUpdate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Mezzi",
                newName: "Descrizione");

            migrationBuilder.AlterColumn<string>(
                name: "LicensePlate",
                table: "Mezzi",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<DateTime>(
                name: "ContoProprioContoTerzi",
                table: "Mezzi",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Costruttore",
                table: "Mezzi",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "ExtimatedValue",
                table: "Mezzi",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<DateTime>(
                name: "FurtoIncendio",
                table: "Mezzi",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "ISPSEL",
                table: "Mezzi",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "InsuranceExpirationDate",
                table: "Mezzi",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "LastKMCheck",
                table: "Mezzi",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LicenseCProprio",
                table: "Mezzi",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "MatriculationDate",
                table: "Mezzi",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "Mezzi",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "OriginalPrice",
                table: "Mezzi",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<DateTime>(
                name: "RevisionExpirationDate",
                table: "Mezzi",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "StampDutyExpirationDate",
                table: "Mezzi",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "Tachograph",
                table: "Mezzi",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "TwentyYearVerificationOfLiftingOrgans",
                table: "Mezzi",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "WearBook",
                table: "Mezzi",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContoProprioContoTerzi",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "Costruttore",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "ExtimatedValue",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "FurtoIncendio",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "ISPSEL",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "InsuranceExpirationDate",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "LastKMCheck",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "LicenseCProprio",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "MatriculationDate",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "Model",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "OriginalPrice",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "RevisionExpirationDate",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "StampDutyExpirationDate",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "Tachograph",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "TwentyYearVerificationOfLiftingOrgans",
                table: "Mezzi");

            migrationBuilder.DropColumn(
                name: "WearBook",
                table: "Mezzi");

            migrationBuilder.RenameColumn(
                name: "Descrizione",
                table: "Mezzi",
                newName: "Name");

            migrationBuilder.AlterColumn<string>(
                name: "LicensePlate",
                table: "Mezzi",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }
    }
}
