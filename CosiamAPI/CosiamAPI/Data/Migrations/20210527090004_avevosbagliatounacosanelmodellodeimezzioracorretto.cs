using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class avevosbagliatounacosanelmodellodeimezzioracorretto : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContoProprioContoTerzi",
                table: "Mezzi");

            migrationBuilder.RenameColumn(
                name: "Descrizione",
                table: "Mezzi",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "Costruttore",
                table: "Mezzi",
                newName: "Brand");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Mezzi",
                newName: "Descrizione");

            migrationBuilder.RenameColumn(
                name: "Brand",
                table: "Mezzi",
                newName: "Costruttore");

            migrationBuilder.AddColumn<DateTime>(
                name: "ContoProprioContoTerzi",
                table: "Mezzi",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
