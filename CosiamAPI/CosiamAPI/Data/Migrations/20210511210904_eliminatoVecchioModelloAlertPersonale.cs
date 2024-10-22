using Microsoft.EntityFrameworkCore.Migrations;

namespace CosiamAPI.Data.Migrations
{
    public partial class eliminatoVecchioModelloAlertPersonale : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlertPersonale");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AlertPersonale",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Object = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PersonaleId = table.Column<int>(type: "int", nullable: false),
                    expirationDay = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertPersonale", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlertPersonale_Personale_PersonaleId",
                        column: x => x.PersonaleId,
                        principalTable: "Personale",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AlertPersonale_PersonaleId",
                table: "AlertPersonale",
                column: "PersonaleId");
        }
    }
}
