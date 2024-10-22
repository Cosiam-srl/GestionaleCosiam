using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    public partial class ReportDiCantiereAddedColumnStatus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDraft",
                table: "ReportDiCantiere");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "ReportDiCantiere",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "ReportDiCantiere");

            migrationBuilder.AddColumn<bool>(
                name: "IsDraft",
                table: "ReportDiCantiere",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
