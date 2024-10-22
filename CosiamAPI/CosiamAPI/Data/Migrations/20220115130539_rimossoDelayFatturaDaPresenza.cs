using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class rimossoDelayFatturaDaPresenza : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "delayDaysFattura",
                table: "Saltura");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "delayDaysFattura",
                table: "Saltura",
                type: "int",
                nullable: true);
        }
    }
}
