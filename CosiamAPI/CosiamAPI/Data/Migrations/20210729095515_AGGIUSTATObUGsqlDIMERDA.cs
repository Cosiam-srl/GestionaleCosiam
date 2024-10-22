using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class AGGIUSTATObUGsqlDIMERDA : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cantiere_Contratto_ContrattoId",
                table: "Cantiere");

            migrationBuilder.RenameColumn(
                name: "ContrattoId",
                table: "Cantiere",
                newName: "IdContratto");

            migrationBuilder.RenameIndex(
                name: "IX_Cantiere_ContrattoId",
                table: "Cantiere",
                newName: "IX_Cantiere_IdContratto");

            migrationBuilder.AddForeignKey(
                name: "FK_Cantiere_Contratto_IdContratto",
                table: "Cantiere",
                column: "IdContratto",
                principalTable: "Contratto",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cantiere_Contratto_IdContratto",
                table: "Cantiere");

            migrationBuilder.RenameColumn(
                name: "IdContratto",
                table: "Cantiere",
                newName: "ContrattoId");

            migrationBuilder.RenameIndex(
                name: "IX_Cantiere_IdContratto",
                table: "Cantiere",
                newName: "IX_Cantiere_ContrattoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cantiere_Contratto_ContrattoId",
                table: "Cantiere",
                column: "ContrattoId",
                principalTable: "Contratto",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
