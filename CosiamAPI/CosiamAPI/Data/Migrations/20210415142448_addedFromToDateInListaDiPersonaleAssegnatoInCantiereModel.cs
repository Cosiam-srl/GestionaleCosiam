using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class addedFromToDateInListaDiPersonaleAssegnatoInCantiereModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "fromDate",
                table: "ListaPersonaleResponsabileDiCantiere",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "toDate",
                table: "ListaPersonaleResponsabileDiCantiere",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "fromDate",
                table: "ListaPersonaleResponsabileDiCantiere");

            migrationBuilder.DropColumn(
                name: "toDate",
                table: "ListaPersonaleResponsabileDiCantiere");
        }
    }
}
