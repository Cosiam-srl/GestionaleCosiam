using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class ElimntPrcedente : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Personale_Cantiere_CantiereId",
                table: "Personale");

            migrationBuilder.DropIndex(
                name: "IX_Personale_CantiereId",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "CantiereId",
                table: "Personale");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CantiereId",
                table: "Personale",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Personale_CantiereId",
                table: "Personale",
                column: "CantiereId");

            migrationBuilder.AddForeignKey(
                name: "FK_Personale_Cantiere_CantiereId",
                table: "Personale",
                column: "CantiereId",
                principalTable: "Cantiere",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
