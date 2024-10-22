using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class sistematoPrezziarioClienteERelativiServizi1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ScontoCliente_BeniEServizi_IdPrezziarioCliente",
                table: "ScontoCliente");

            migrationBuilder.DropForeignKey(
                name: "FK_ServizioCliente_BeniEServizi_IdPrezziario",
                table: "ServizioCliente");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BeniEServizi",
                table: "BeniEServizi");

            migrationBuilder.RenameTable(
                name: "BeniEServizi",
                newName: "PrezziarioCliente");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PrezziarioCliente",
                table: "PrezziarioCliente",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ScontoCliente_PrezziarioCliente_IdPrezziarioCliente",
                table: "ScontoCliente",
                column: "IdPrezziarioCliente",
                principalTable: "PrezziarioCliente",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ServizioCliente_PrezziarioCliente_IdPrezziario",
                table: "ServizioCliente",
                column: "IdPrezziario",
                principalTable: "PrezziarioCliente",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ScontoCliente_PrezziarioCliente_IdPrezziarioCliente",
                table: "ScontoCliente");

            migrationBuilder.DropForeignKey(
                name: "FK_ServizioCliente_PrezziarioCliente_IdPrezziario",
                table: "ServizioCliente");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PrezziarioCliente",
                table: "PrezziarioCliente");

            migrationBuilder.RenameTable(
                name: "PrezziarioCliente",
                newName: "BeniEServizi");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BeniEServizi",
                table: "BeniEServizi",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ScontoCliente_BeniEServizi_IdPrezziarioCliente",
                table: "ScontoCliente",
                column: "IdPrezziarioCliente",
                principalTable: "BeniEServizi",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ServizioCliente_BeniEServizi_IdPrezziario",
                table: "ServizioCliente",
                column: "IdPrezziario",
                principalTable: "BeniEServizi",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
