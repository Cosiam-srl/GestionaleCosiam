using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class aggiuntFKdaIDLogoCantiereAidTabellaFileProvaNullableFile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cantiere_File_IdLogo",
                table: "Cantiere");

            migrationBuilder.AlterColumn<int>(
                name: "IdLogo",
                table: "Cantiere",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Cantiere_File_IdLogo",
                table: "Cantiere",
                column: "IdLogo",
                principalTable: "File",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cantiere_File_IdLogo",
                table: "Cantiere");

            migrationBuilder.AlterColumn<int>(
                name: "IdLogo",
                table: "Cantiere",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Cantiere_File_IdLogo",
                table: "Cantiere",
                column: "IdLogo",
                principalTable: "File",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
