using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    /// <inheritdoc />
    public partial class TableTimeCard_FKPersonale_OnDeleteNoAction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TimeCard_Personale_PersonaleId",
                table: "TimeCard");

            migrationBuilder.AddForeignKey(
                name: "FK_TimeCard_Personale_PersonaleId",
                table: "TimeCard",
                column: "PersonaleId",
                principalTable: "Personale",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TimeCard_Personale_PersonaleId",
                table: "TimeCard");

            migrationBuilder.AddForeignKey(
                name: "FK_TimeCard_Personale_PersonaleId",
                table: "TimeCard",
                column: "PersonaleId",
                principalTable: "Personale",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
