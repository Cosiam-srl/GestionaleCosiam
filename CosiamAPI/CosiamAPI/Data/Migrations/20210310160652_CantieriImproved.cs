using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class CantieriImproved : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "start",
                table: "Cantiere",
                newName: "Start");

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Cantiere",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdClienti",
                table: "Cantiere",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Cantiere",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Clienti",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clienti", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cantiere_IdClienti",
                table: "Cantiere",
                column: "IdClienti");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Clienti");

            migrationBuilder.DropIndex(
                name: "IX_Cantiere_IdClienti",
                table: "Cantiere");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Cantiere");

            migrationBuilder.DropColumn(
                name: "IdClienti",
                table: "Cantiere");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Cantiere");

            migrationBuilder.RenameColumn(
                name: "Start",
                table: "Cantiere",
                newName: "start");
        }
    }
}
