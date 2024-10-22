using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class ProaAggiuntaIdLogoCantiereSenzaPassarePerLaFKSuFile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "Cantiere");

            migrationBuilder.AddColumn<int>(
                name: "IdLogo",
                table: "Cantiere",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdLogo",
                table: "Cantiere");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Cantiere",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }
    }
}
