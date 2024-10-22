using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class rimossoClientNameDaModelloPrezziarioCliente : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "clienteName",
                table: "PrezziarioCliente");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "clienteName",
                table: "PrezziarioCliente",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
