using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    public partial class TableCantieri_AddedTotalGrossWorkAmount_TotalChargesAmount_TableValoriAggiuntivi_DateNotRequired : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "Data",
                table: "ValoriAggiuntivi",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<double>(
                name: "TotalChargesAmount",
                table: "Cantiere",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "TotalGrossWorkAmount",
                table: "Cantiere",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalChargesAmount",
                table: "Cantiere");

            migrationBuilder.DropColumn(
                name: "TotalGrossWorkAmount",
                table: "Cantiere");

            migrationBuilder.AlterColumn<DateTime>(
                name: "Data",
                table: "ValoriAggiuntivi",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);
        }
    }
}
