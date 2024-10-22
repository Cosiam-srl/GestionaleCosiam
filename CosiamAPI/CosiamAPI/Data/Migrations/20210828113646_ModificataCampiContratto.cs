using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class ModificataCampiContratto : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contratto_Clienti_IdCliente",
                table: "Contratto");

            migrationBuilder.DropForeignKey(
                name: "FK_Contratto_Personale_idPm",
                table: "Contratto");

            migrationBuilder.DropForeignKey(
                name: "FK_Contratto_PrezziarioCliente_IdPrezziarioCliente",
                table: "Contratto");

            migrationBuilder.AlterColumn<int>(
                name: "idPm",
                table: "Contratto",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "IdPrezziarioCliente",
                table: "Contratto",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "IdCliente",
                table: "Contratto",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Contratto_Clienti_IdCliente",
                table: "Contratto",
                column: "IdCliente",
                principalTable: "Clienti",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Contratto_Personale_idPm",
                table: "Contratto",
                column: "idPm",
                principalTable: "Personale",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

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
                name: "FK_Contratto_Clienti_IdCliente",
                table: "Contratto");

            migrationBuilder.DropForeignKey(
                name: "FK_Contratto_Personale_idPm",
                table: "Contratto");

            migrationBuilder.DropForeignKey(
                name: "FK_Contratto_PrezziarioCliente_IdPrezziarioCliente",
                table: "Contratto");

            migrationBuilder.AlterColumn<int>(
                name: "idPm",
                table: "Contratto",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "IdPrezziarioCliente",
                table: "Contratto",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "IdCliente",
                table: "Contratto",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Contratto_Clienti_IdCliente",
                table: "Contratto",
                column: "IdCliente",
                principalTable: "Clienti",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Contratto_Personale_idPm",
                table: "Contratto",
                column: "idPm",
                principalTable: "Personale",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Contratto_PrezziarioCliente_IdPrezziarioCliente",
                table: "Contratto",
                column: "IdPrezziarioCliente",
                principalTable: "PrezziarioCliente",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
