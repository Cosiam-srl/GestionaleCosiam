using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class modificatagestionetimecardECorrettoloopidclientesucontrattoecantiere : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cantiere_Clienti_IdClienti",
                table: "Cantiere");

            migrationBuilder.RenameColumn(
                name: "IdClienti",
                table: "Cantiere",
                newName: "ContrattoId");

            migrationBuilder.RenameIndex(
                name: "IX_Cantiere_IdClienti",
                table: "Cantiere",
                newName: "IX_Cantiere_ContrattoId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndDate",
                table: "TimeCard",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "TimeCard",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_Cantiere_Contratto_ContrattoId",
                table: "Cantiere",
                column: "ContrattoId",
                principalTable: "Contratto",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cantiere_Contratto_ContrattoId",
                table: "Cantiere");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "TimeCard");

            migrationBuilder.RenameColumn(
                name: "ContrattoId",
                table: "Cantiere",
                newName: "IdClienti");

            migrationBuilder.RenameIndex(
                name: "IX_Cantiere_ContrattoId",
                table: "Cantiere",
                newName: "IX_Cantiere_IdClienti");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndDate",
                table: "TimeCard",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Cantiere_Clienti_IdClienti",
                table: "Cantiere",
                column: "IdClienti",
                principalTable: "Clienti",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
