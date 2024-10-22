using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class personaleForeignKeyImproved : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AlertPersonale_Personale_PersonId",
                table: "AlertPersonale");

            migrationBuilder.DropForeignKey(
                name: "FK_Personale_Ruoli_RoleId",
                table: "Personale");

            migrationBuilder.DropIndex(
                name: "IX_Personale_RoleId",
                table: "Personale");

            migrationBuilder.DropIndex(
                name: "IX_AlertPersonale_PersonId",
                table: "AlertPersonale");

            migrationBuilder.DropColumn(
                name: "RoleId",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "PersonId",
                table: "AlertPersonale");

            migrationBuilder.AddColumn<int>(
                name: "RuoliId",
                table: "Personale",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PersonaleId",
                table: "AlertPersonale",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Personale_RuoliId",
                table: "Personale",
                column: "RuoliId");

            migrationBuilder.CreateIndex(
                name: "IX_AlertPersonale_PersonaleId",
                table: "AlertPersonale",
                column: "PersonaleId");

            migrationBuilder.AddForeignKey(
                name: "FK_AlertPersonale_Personale_PersonaleId",
                table: "AlertPersonale",
                column: "PersonaleId",
                principalTable: "Personale",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Personale_Ruoli_RuoliId",
                table: "Personale",
                column: "RuoliId",
                principalTable: "Ruoli",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AlertPersonale_Personale_PersonaleId",
                table: "AlertPersonale");

            migrationBuilder.DropForeignKey(
                name: "FK_Personale_Ruoli_RuoliId",
                table: "Personale");

            migrationBuilder.DropIndex(
                name: "IX_Personale_RuoliId",
                table: "Personale");

            migrationBuilder.DropIndex(
                name: "IX_AlertPersonale_PersonaleId",
                table: "AlertPersonale");

            migrationBuilder.DropColumn(
                name: "RuoliId",
                table: "Personale");

            migrationBuilder.DropColumn(
                name: "PersonaleId",
                table: "AlertPersonale");

            migrationBuilder.AddColumn<int>(
                name: "RoleId",
                table: "Personale",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PersonId",
                table: "AlertPersonale",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Personale_RoleId",
                table: "Personale",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_AlertPersonale_PersonId",
                table: "AlertPersonale",
                column: "PersonId");

            migrationBuilder.AddForeignKey(
                name: "FK_AlertPersonale_Personale_PersonId",
                table: "AlertPersonale",
                column: "PersonId",
                principalTable: "Personale",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Personale_Ruoli_RoleId",
                table: "Personale",
                column: "RoleId",
                principalTable: "Ruoli",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
