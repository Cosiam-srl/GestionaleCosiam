using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    public partial class TableListOfServicesSoldToClient_AddedColumnEqualParts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "EqualParts",
                table: "ListOfServicesSoldToClient",
                type: "float",
                nullable: false,
                defaultValue: 1.0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EqualParts",
                table: "ListOfServicesSoldToClient");
        }
    }
}
