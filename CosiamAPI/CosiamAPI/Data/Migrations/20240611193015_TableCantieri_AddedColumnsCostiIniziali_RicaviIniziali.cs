using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    public partial class TableCantieri_AddedColumnsCostiIniziali_RicaviIniziali : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "EqualParts",
                table: "ListOfServicesSoldToClient",
                type: "float",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "float",
                oldDefaultValue: 1.0);

            migrationBuilder.AddColumn<double>(
                name: "CostiIniziali",
                table: "Cantiere",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "RicaviIniziali",
                table: "Cantiere",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CostiIniziali",
                table: "Cantiere");

            migrationBuilder.DropColumn(
                name: "RicaviIniziali",
                table: "Cantiere");

            migrationBuilder.AlterColumn<double>(
                name: "EqualParts",
                table: "ListOfServicesSoldToClient",
                type: "float",
                nullable: false,
                defaultValue: 1.0,
                oldClrType: typeof(double),
                oldType: "float");
        }
    }
}
