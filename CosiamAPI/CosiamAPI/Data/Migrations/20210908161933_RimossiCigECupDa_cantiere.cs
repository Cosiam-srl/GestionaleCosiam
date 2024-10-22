using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class RimossiCigECupDa_cantiere : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cig",
                table: "Cantiere");

            migrationBuilder.DropColumn(
                name: "cup",
                table: "Cantiere");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "cig",
                table: "Cantiere",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "cup",
                table: "Cantiere",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
