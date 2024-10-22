using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class aggiuntoODAalContratto : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "oda",
                table: "Cantiere");

            migrationBuilder.AddColumn<string>(
                name: "oda",
                table: "Contratto",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "oda",
                table: "Contratto");

            migrationBuilder.AddColumn<string>(
                name: "oda",
                table: "Cantiere",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
