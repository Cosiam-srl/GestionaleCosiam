using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class CantieriFKClienti : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_Cantiere_Clienti_IdClienti",
                table: "Cantiere",
                column: "IdClienti",
                principalTable: "Clienti",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction); //NOTA
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cantiere_Clienti_IdClienti",
                table: "Cantiere");
        }
    }
}
