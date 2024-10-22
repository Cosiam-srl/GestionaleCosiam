using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class modifcaFotoPersonale : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Personale_File_IdPicture",
                table: "Personale");

            migrationBuilder.DropIndex(
                name: "IX_Personale_IdPicture",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "IdPicture",
                table: "Personale");

            migrationBuilder.AddColumn<string>(
                name: "File",
                table: "Personale",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "File",
                table: "Personale");

            migrationBuilder.AddColumn<int>(
                name: "IdPicture",
                table: "Personale",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Personale_IdPicture",
                table: "Personale",
                column: "IdPicture");

            migrationBuilder.AddForeignKey(
                name: "FK_Personale_File_IdPicture",
                table: "Personale",
                column: "IdPicture",
                principalTable: "File",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
