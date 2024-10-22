using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class aggiuntFKdaIDLogoCantiereAidTabellaFile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Cantiere_IdLogo",
                table: "Cantiere",
                column: "IdLogo");

            migrationBuilder.AddForeignKey(
                name: "FK_Cantiere_File_IdLogo",
                table: "Cantiere",
                column: "IdLogo",
                principalTable: "File",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cantiere_File_IdLogo",
                table: "Cantiere");

            migrationBuilder.DropIndex(
                name: "IX_Cantiere_IdLogo",
                table: "Cantiere");
        }
    }
}
