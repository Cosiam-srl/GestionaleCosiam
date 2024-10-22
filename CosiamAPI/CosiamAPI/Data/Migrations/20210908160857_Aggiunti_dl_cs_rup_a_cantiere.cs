using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class Aggiunti_dl_cs_rup_a_cantiere : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "cse",
                table: "Cantiere",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "dl",
                table: "Cantiere",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "rup",
                table: "Cantiere",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cse",
                table: "Cantiere");

            migrationBuilder.DropColumn(
                name: "dl",
                table: "Cantiere");

            migrationBuilder.DropColumn(
                name: "rup",
                table: "Cantiere");
        }
    }
}
