using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class aggiustatinomidelcazzo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Type",
                table: "ServizioFornitore",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "ServizioFornitore",
                newName: "Category");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "ServizioCliente",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "ServizioCliente",
                newName: "Category");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Description",
                table: "ServizioFornitore",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "ServizioFornitore",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "ServizioCliente",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "ServizioCliente",
                newName: "Name");
        }
    }
}
