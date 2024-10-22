using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class FinancialVardoV10 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "accidentsWithholding",
                table: "Saltura",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "contractualAdvance",
                table: "Saltura",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "cpState",
                table: "Saltura",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "delayDaysFattura",
                table: "Saltura",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "fatturaState",
                table: "Saltura",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "iva",
                table: "Saltura",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ivaAmountFattura",
                table: "Saltura",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "netAmountCP",
                table: "Saltura",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "netAmountFattura",
                table: "Saltura",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "netAmountSAL",
                table: "Saltura",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "salState",
                table: "Saltura",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "order",
                table: "AttachmentsSaltura",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "accidentsWithholding",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "contractualAdvance",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "cpState",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "delayDaysFattura",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "fatturaState",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "iva",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "ivaAmountFattura",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "netAmountCP",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "netAmountFattura",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "netAmountSAL",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "salState",
                table: "Saltura");

            migrationBuilder.DropColumn(
                name: "order",
                table: "AttachmentsSaltura");
        }
    }
}
