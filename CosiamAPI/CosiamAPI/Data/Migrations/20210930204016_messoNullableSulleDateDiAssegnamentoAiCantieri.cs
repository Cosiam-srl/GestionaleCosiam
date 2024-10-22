using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class messoNullableSulleDateDiAssegnamentoAiCantieri : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "toDate",
                table: "ListaPersonaleAssegnatoDiCantiere",
                newName: "ToDate");

            migrationBuilder.RenameColumn(
                name: "fromDate",
                table: "ListaPersonaleAssegnatoDiCantiere",
                newName: "FromDate");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ToDate",
                table: "ListaPersonaleAssegnatoDiCantiere",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FromDate",
                table: "ListaPersonaleAssegnatoDiCantiere",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ToDate",
                table: "ListaPersonaleAssegnatoDiCantiere",
                newName: "toDate");

            migrationBuilder.RenameColumn(
                name: "FromDate",
                table: "ListaPersonaleAssegnatoDiCantiere",
                newName: "fromDate");

            migrationBuilder.AlterColumn<DateTime>(
                name: "toDate",
                table: "ListaPersonaleAssegnatoDiCantiere",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "fromDate",
                table: "ListaPersonaleAssegnatoDiCantiere",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);
        }
    }
}
