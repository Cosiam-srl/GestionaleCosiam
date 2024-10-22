using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class aggiuntoRiferimentoAPrezziarioClienteSuContratto : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IdPrezziarioGenerale",
                table: "Contratto",
                newName: "IdPrezziarioCliente");

            migrationBuilder.CreateIndex(
                name: "IX_Contratto_IdPrezziarioCliente",
                table: "Contratto",
                column: "IdPrezziarioCliente");

            migrationBuilder.AddForeignKey(
                name: "FK_Contratto_PrezziarioCliente_IdPrezziarioCliente",
                table: "Contratto",
                column: "IdPrezziarioCliente",
                principalTable: "PrezziarioCliente",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contratto_PrezziarioCliente_IdPrezziarioCliente",
                table: "Contratto");

            migrationBuilder.DropIndex(
                name: "IX_Contratto_IdPrezziarioCliente",
                table: "Contratto");

            migrationBuilder.RenameColumn(
                name: "IdPrezziarioCliente",
                table: "Contratto",
                newName: "IdPrezziarioGenerale");
        }
    }
}
