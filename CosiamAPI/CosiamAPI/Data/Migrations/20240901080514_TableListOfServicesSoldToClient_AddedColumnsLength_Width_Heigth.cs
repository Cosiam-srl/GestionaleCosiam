using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    /// <inheritdoc />
    public partial class TableListOfServicesSoldToClient_AddedColumnsLength_Width_Heigth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Height",
                table: "ListOfServicesSoldToClient",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Length",
                table: "ListOfServicesSoldToClient",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Width",
                table: "ListOfServicesSoldToClient",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Height",
                table: "ListOfServicesSoldToClient");

            migrationBuilder.DropColumn(
                name: "Length",
                table: "ListOfServicesSoldToClient");

            migrationBuilder.DropColumn(
                name: "Width",
                table: "ListOfServicesSoldToClient");
        }
    }
}
