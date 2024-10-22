using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AggiustateInfoPrezziario : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdCliente",
                table: "PrezziarioCliente",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "clienteName",
                table: "PrezziarioCliente",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrezziarioCliente_IdCliente",
                table: "PrezziarioCliente",
                column: "IdCliente");

            migrationBuilder.AddForeignKey(
                name: "FK_PrezziarioCliente_Clienti_IdCliente",
                table: "PrezziarioCliente",
                column: "IdCliente",
                principalTable: "Clienti",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PrezziarioCliente_Clienti_IdCliente",
                table: "PrezziarioCliente");

            migrationBuilder.DropIndex(
                name: "IX_PrezziarioCliente_IdCliente",
                table: "PrezziarioCliente");

            migrationBuilder.DropColumn(
                name: "IdCliente",
                table: "PrezziarioCliente");

            migrationBuilder.DropColumn(
                name: "clienteName",
                table: "PrezziarioCliente");
        }
    }
}
