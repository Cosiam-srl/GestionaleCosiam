using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class fixedAttachments : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttachmentsNota_Cantiere_IdNota",
                table: "AttachmentsNota");

            migrationBuilder.AddForeignKey(
                name: "FK_AttachmentsNota_Note_IdNota",
                table: "AttachmentsNota",
                column: "IdNota",
                principalTable: "Note",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttachmentsNota_Note_IdNota",
                table: "AttachmentsNota");

            migrationBuilder.AddForeignKey(
                name: "FK_AttachmentsNota_Cantiere_IdNota",
                table: "AttachmentsNota",
                column: "IdNota",
                principalTable: "Cantiere",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
