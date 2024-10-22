using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    public partial class BudgetAttivita_FornitoreNotRequired : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BudgetAttivita_Fornitori_IdFornitore",
                table: "BudgetAttivita");

            migrationBuilder.AlterColumn<int>(
                name: "IdFornitore",
                table: "BudgetAttivita",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetAttivita_Fornitori_IdFornitore",
                table: "BudgetAttivita",
                column: "IdFornitore",
                principalTable: "Fornitori",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BudgetAttivita_Fornitori_IdFornitore",
                table: "BudgetAttivita");

            migrationBuilder.AlterColumn<int>(
                name: "IdFornitore",
                table: "BudgetAttivita",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetAttivita_Fornitori_IdFornitore",
                table: "BudgetAttivita",
                column: "IdFornitore",
                principalTable: "Fornitori",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
