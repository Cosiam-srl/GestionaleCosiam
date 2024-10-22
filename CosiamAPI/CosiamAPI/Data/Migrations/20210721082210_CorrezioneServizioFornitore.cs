using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class CorrezioneServizioFornitore : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServizioFornitore_Fornitori_IdCliente",
                table: "ServizioFornitore");

            migrationBuilder.DropIndex(
                name: "IX_ServizioFornitore_IdCliente",
                table: "ServizioFornitore");

            migrationBuilder.DropColumn(
                name: "IdCliente",
                table: "ServizioFornitore");


            migrationBuilder.CreateIndex(
                name: "IX_ServizioFornitore_IdFornitore",
                table: "ServizioFornitore",
                column: "IdFornitore");

            migrationBuilder.AddForeignKey(
                name: "FK_ServizioFornitore_Fornitori_IdFornitore",
                table: "ServizioFornitore",
                column: "IdFornitore",
                principalTable: "Fornitori",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServizioFornitore_Fornitori_IdFornitore",
                table: "ServizioFornitore");

            migrationBuilder.DropIndex(
                name: "IX_ServizioFornitore_IdFornitore",
                table: "ServizioFornitore");


            migrationBuilder.AddColumn<int>(
                name: "IdCliente",
                table: "ServizioFornitore",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServizioFornitore_IdCliente",
                table: "ServizioFornitore",
                column: "IdCliente");

            migrationBuilder.AddForeignKey(
                name: "FK_ServizioFornitore_Fornitori_IdCliente",
                table: "ServizioFornitore",
                column: "IdCliente",
                principalTable: "Fornitori",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
