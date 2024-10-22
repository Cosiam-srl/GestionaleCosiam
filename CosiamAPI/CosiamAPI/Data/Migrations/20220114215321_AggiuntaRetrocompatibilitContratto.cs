using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AggiuntaRetrocompatibilitContratto : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdPrezziarioCliente",
                table: "Contratto",
                type: "int",
                nullable: true);

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
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contratto_PrezziarioCliente_IdPrezziarioCliente",
                table: "Contratto");

            migrationBuilder.DropIndex(
                name: "IX_Contratto_IdPrezziarioCliente",
                table: "Contratto");

            migrationBuilder.DropColumn(
                name: "IdPrezziarioCliente",
                table: "Contratto");
        }
    }
}
