using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class CorrezioneConsistenzaNomiTabelleDB2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PersonaleResponsabile_Note_IdNote",
                table: "PersonaleResponsabile");

            migrationBuilder.DropForeignKey(
                name: "FK_PersonaleResponsabile_Personale_IdPersonale",
                table: "PersonaleResponsabile");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PersonaleResponsabile",
                table: "PersonaleResponsabile");

            migrationBuilder.RenameTable(
                name: "PersonaleResponsabile",
                newName: "PersonaleResponsabileDiNota");

            migrationBuilder.RenameIndex(
                name: "IX_PersonaleResponsabile_IdPersonale",
                table: "PersonaleResponsabileDiNota",
                newName: "IX_PersonaleResponsabileDiNota_IdPersonale");

            migrationBuilder.RenameIndex(
                name: "IX_PersonaleResponsabile_IdNote",
                table: "PersonaleResponsabileDiNota",
                newName: "IX_PersonaleResponsabileDiNota_IdNote");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PersonaleResponsabileDiNota",
                table: "PersonaleResponsabileDiNota",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PersonaleResponsabileDiNota_Note_IdNote",
                table: "PersonaleResponsabileDiNota",
                column: "IdNote",
                principalTable: "Note",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PersonaleResponsabileDiNota_Personale_IdPersonale",
                table: "PersonaleResponsabileDiNota",
                column: "IdPersonale",
                principalTable: "Personale",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PersonaleResponsabileDiNota_Note_IdNote",
                table: "PersonaleResponsabileDiNota");

            migrationBuilder.DropForeignKey(
                name: "FK_PersonaleResponsabileDiNota_Personale_IdPersonale",
                table: "PersonaleResponsabileDiNota");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PersonaleResponsabileDiNota",
                table: "PersonaleResponsabileDiNota");

            migrationBuilder.RenameTable(
                name: "PersonaleResponsabileDiNota",
                newName: "PersonaleResponsabile");

            migrationBuilder.RenameIndex(
                name: "IX_PersonaleResponsabileDiNota_IdPersonale",
                table: "PersonaleResponsabile",
                newName: "IX_PersonaleResponsabile_IdPersonale");

            migrationBuilder.RenameIndex(
                name: "IX_PersonaleResponsabileDiNota_IdNote",
                table: "PersonaleResponsabile",
                newName: "IX_PersonaleResponsabile_IdNote");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PersonaleResponsabile",
                table: "PersonaleResponsabile",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PersonaleResponsabile_Note_IdNote",
                table: "PersonaleResponsabile",
                column: "IdNote",
                principalTable: "Note",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PersonaleResponsabile_Personale_IdPersonale",
                table: "PersonaleResponsabile",
                column: "IdPersonale",
                principalTable: "Personale",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
