using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CosiamAPI.Data.Migrations
{
    public partial class TablePersonaleAddedIndexEmailUnique : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Personale_email",
                table: "Personale");

            migrationBuilder.CreateIndex(
                name: "IX_Personale_email",
                table: "Personale",
                column: "email",
                unique: true,
                filter: "[email] IS NOT NULL")
                .Annotation("SqlServer:Clustered", false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Personale_email",
                table: "Personale");

            migrationBuilder.CreateIndex(
                name: "IX_Personale_email",
                table: "Personale",
                column: "email")
                .Annotation("SqlServer:Clustered", false);
        }
    }
}
