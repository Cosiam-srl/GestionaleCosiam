using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class referenceDayCambiatoInReferenceDate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "referenceDay",
                table: "ReportDiCantiere",
                newName: "referenceDate");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "referenceDate",
                table: "ReportDiCantiere",
                newName: "referenceDay");
        }
    }
}
